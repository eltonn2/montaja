require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const mercadopago = require('mercadopago');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';

if (!MP_ACCESS_TOKEN) {
    console.warn('⚠️ MP_ACCESS_TOKEN não configurado. O Checkout Pro ficará indisponível até configurar a variável de ambiente.');
} else {
    mercadopago.configure({ access_token: MP_ACCESS_TOKEN });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const DB_PATH = path.join(__dirname, 'montaja.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        console.log('⚡ Conectado com sucesso ao Banco de Dados SQLite (montaja.db)');
        initDatabase();
    }
});

function normalizePhone(phone = '') {
    return String(phone || '').replace(/\D/g, '');
}

function getSubscriptionStatus(row = {}) {
    const now = new Date();
    const trialEnd = row.trial_termina_em ? new Date(row.trial_termina_em) : null;
    const paidEnd = row.assinatura_fim ? new Date(row.assinatura_fim) : null;
    const statusValue = row.assinatura_status || (trialEnd ? 'trial' : 'inactive');
    const isTrialActive = statusValue === 'trial' && trialEnd && trialEnd > now;
    const isActive = statusValue === 'active' && paidEnd && paidEnd > now;
    const finalEnd = paidEnd || trialEnd;
    const isExpired = Boolean(finalEnd && finalEnd <= now);
    let daysLeft = 0;
    if (finalEnd) {
        daysLeft = Math.max(0, Math.ceil((finalEnd.getTime() - now.getTime()) / 86400000));
    }

    return {
        status: isExpired ? 'inactive' : statusValue,
        daysLeft,
        searchable: isTrialActive || isActive,
        endsAt: finalEnd ? finalEnd.toISOString() : null,
        statusLabel: isActive ? 'Plano ativo' : isTrialActive ? 'Teste grátis ativo' : 'Inativo'
    };
}

function initDatabase() {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='montadores'", (err, row) => {
        if (!row) {
            console.log('📦 Inicializando tabelas e dados fictícios no banco de dados...');
            if (fs.existsSync(SCHEMA_PATH)) {
                const sqlScript = fs.readFileSync(SCHEMA_PATH, 'utf8');
                db.exec(sqlScript, (execErr) => {
                    if (execErr) {
                        console.error('❌ Erro ao executar schema.sql:', execErr.message);
                    } else {
                        console.log('✅ Banco de dados populado com sucesso!');
                    }
                });
            }
        } else {
            console.log('ℹ️ Tabelas já existem no banco de dados.');
        }
    });
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor MontaJá API operando normalmente!' });
});

app.get('/api/montadores', (req, res) => {
    const { q, category } = req.query;

    let sql = `
        SELECT 
            m.id, m.nome as name, m.verificado as verified, m.avaliacao as rating,
            m.total_avaliacoes as reviewsCount, m.trabalhos_concluidos as completedJobs,
            m.tempo_resposta as responseTime, m.dias_garantia as guaranteeDays,
            m.foto as photo, m.whatsapp as phone, m.cidade as city,
            m.bairros_atendimento as neighborhoods, m.anos_experiencia as experienceYears,
            m.bio, m.fotos_portfolio, m.assinatura_status, m.trial_termina_em, m.assinatura_fim,
            GROUP_CONCAT(e.especialidade) as specialties_str
        FROM montadores m
        LEFT JOIN montador_especialidades e ON m.id = e.montador_id
    `;

    const whereConditions = [];
    const params = [];

    if (q) {
        const searchTerm = `%${String(q).toLowerCase()}%`;
        whereConditions.push(`(LOWER(m.nome) LIKE ? OR LOWER(m.cidade) LIKE ? OR LOWER(m.bairros_atendimento) LIKE ?)`);
        params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
        whereConditions.push(`m.id IN (SELECT montador_id FROM montador_especialidades WHERE especialidade = ?)`);
        params.push(category);
    }

    if (whereConditions.length > 0) {
        sql += ` WHERE ` + whereConditions.join(' AND ');
    }

    sql += ` GROUP BY m.id ORDER BY m.id DESC`;

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Erro na consulta GET /api/montadores:', err.message);
            return res.status(500).json({ error: 'Erro ao buscar montadores no banco de dados.' });
        }

        const formattedRows = rows
            .map(row => {
                let portfolioPhotos = [];
                if (row.fotos_portfolio) {
                    try {
                        portfolioPhotos = JSON.parse(row.fotos_portfolio);
                    } catch (e) {
                        portfolioPhotos = [];
                    }
                }

                const subscription = getSubscriptionStatus(row);
                return {
                    ...row,
                    verified: Boolean(row.verified),
                    specialties: row.specialties_str ? row.specialties_str.split(',') : [],
                    portfolioPhotos,
                    subscriptionStatus: subscription.status,
                    daysLeft: subscription.daysLeft,
                    searchable: subscription.searchable,
                    statusLabel: subscription.statusLabel
                };
            })
            .filter(row => row.searchable !== false);

        res.json(formattedRows);
    });
});

app.get('/api/montadores/status', (req, res) => {
    const whatsapp = normalizePhone(req.query.whatsapp || '');

    if (!whatsapp) {
        return res.status(400).json({ error: 'Informe o WhatsApp do montador.' });
    }

    db.get('SELECT * FROM montadores WHERE whatsapp = ? LIMIT 1', [whatsapp], (err, row) => {
        if (err) {
            console.error('Erro na consulta de status:', err.message);
            return res.status(500).json({ error: 'Erro ao consultar status.' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Montador não encontrado para este WhatsApp.' });
        }

        const subscription = getSubscriptionStatus(row);

        res.json({
            id: row.id,
            name: row.nome,
            whatsapp: normalizePhone(row.whatsapp),
            subscriptionStatus: subscription.status,
            statusLabel: subscription.statusLabel,
            daysLeft: subscription.daysLeft,
            endsAt: subscription.endsAt,
            searchable: subscription.searchable,
            trialEndsAt: row.trial_termina_em,
            paidUntil: row.assinatura_fim
        });
    });
});

app.post('/api/montadores', (req, res) => {
    const { name, phone, city, neighborhoods, photo, bio, specialties, portfolioPhotos, completedJobs, responseTime, guaranteeDays } = req.body;

    if (!name || !phone || !city || !neighborhoods) {
        return res.status(400).json({ error: 'Campos obrigatórios: Nome, WhatsApp, Cidade e Bairros.' });
    }

    const defaultPhoto = photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
    const cleanPhone = normalizePhone(phone);
    const photosJson = JSON.stringify(Array.isArray(portfolioPhotos) ? portfolioPhotos : []);
    const nowIso = new Date().toISOString();
    const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const insertSql = `
        INSERT INTO montadores (
            nome, verificado, avaliacao, total_avaliacoes, trabalhos_concluidos, tempo_resposta,
            dias_garantia, foto, whatsapp, cidade, bairros_atendimento, anos_experiencia,
            bio, fotos_portfolio, assinatura_status, assinatura_ativa_em, trial_termina_em,
            assinatura_fim, criado_em
        )
        VALUES (?, 1, 5.0, 1, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 'trial', ?, ?, ?, ?)
    `;

    const jobsCount = Number(completedJobs || 1);
    const respTime = responseTime || 'Responde em ~15 min';
    const guarDays = Number(guaranteeDays ?? 30);

    db.run(insertSql, [name, jobsCount, respTime, guarDays, defaultPhoto, cleanPhone, city, neighborhoods, bio || '', photosJson, nowIso, trialEnd, trialEnd, nowIso], function (err) {
        if (err) {
            console.error('Erro ao inserir no banco:', err.message);
            return res.status(500).json({ error: 'Erro ao cadastrar montador no banco de dados.' });
        }

        const newId = this.lastID;
        const selectedSpecialties = Array.isArray(specialties) && specialties.length > 0 ? specialties : ['Reparos Gerais'];

        const specStmt = db.prepare(`INSERT INTO montador_especialidades (montador_id, especialidade) VALUES (?, ?)`);
        selectedSpecialties.forEach(spec => specStmt.run(newId, spec));
        specStmt.finalize();

        const createdAssembler = {
            id: newId,
            name,
            verified: true,
            rating: 5.0,
            reviewsCount: 1,
            completedJobs: jobsCount,
            responseTime: respTime,
            guaranteeDays: guarDays,
            photo: defaultPhoto,
            phone: cleanPhone,
            city,
            neighborhoods,
            experienceYears: 1,
            bio: bio || '',
            specialties: selectedSpecialties,
            portfolioPhotos: Array.isArray(portfolioPhotos) ? portfolioPhotos : [],
            subscriptionStatus: 'trial',
            statusLabel: 'Teste grátis ativo',
            daysLeft: 30,
            searchable: true
        };

        res.status(201).json(createdAssembler);
    });
});

app.post('/api/mercadopago/create-payment', async (req, res) => {
    const montadorId = Number(req.body?.montadorId || req.body?.montador_id || 0);

    if (!montadorId) {
        return res.status(400).json({ error: 'Identificador do montador não informado.' });
    }

    if (!MP_ACCESS_TOKEN) {
        return res.status(503).json({ error: 'MP_ACCESS_TOKEN não configurado.' });
    }

    db.get('SELECT * FROM montadores WHERE id = ?', [montadorId], async (err, row) => {
        if (err) {
            console.error('Erro ao buscar montador para checkout:', err.message);
            return res.status(500).json({ error: 'Erro ao localizar montador.' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Montador não encontrado.' });
        }

        try {
            const preference = await mercadopago.preferences.create({
                items: [{
                    title: 'Assinatura MontaJá - 1 mês',
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: 29.9
                }],
                payer: { email: 'montador@montaja.app' },
                back_urls: {
                    success: `${PUBLIC_URL}/?payment=success`,
                    failure: `${PUBLIC_URL}/?payment=failed`,
                    pending: `${PUBLIC_URL}/?payment=pending`
                },
                auto_return: 'approved',
                notification_url: `${PUBLIC_URL}/api/mercadopago/webhook`,
                metadata: { montador_id: String(montadorId) },
                payment_methods: { installments: 12, default_installments: 1 }
            });

            const initPoint = preference.body?.init_point || preference.body?.sandbox_init_point;
            if (!initPoint) {
                return res.status(500).json({ error: 'Não foi possível gerar a cobrança do Mercado Pago.' });
            }

            res.json({ initPoint });
        } catch (paymentError) {
            console.error('Erro ao criar preferência do Mercado Pago:', paymentError);
            res.status(500).json({ error: 'Erro ao criar pagamento do Mercado Pago.' });
        }
    });
});

app.post('/api/mercadopago/webhook', async (req, res) => {
    const paymentId = req.body?.data?.id || req.body?.id || req.body?.resource?.split('/').pop();

    if (!paymentId) {
        return res.status(200).json({ ok: true });
    }

    if (!MP_ACCESS_TOKEN) {
        return res.status(200).json({ ok: true, message: 'Token não configurado.' });
    }

    try {
        const payment = await mercadopago.payment.findById(Number(paymentId));
        const paymentStatus = payment.body?.status;
        const montadorId = Number(payment.body?.metadata?.montador_id || payment.body?.additional_info?.items?.[0]?.id || 0);

        if (paymentStatus === 'approved' && montadorId) {
            const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            db.run(
                `UPDATE montadores SET assinatura_status = 'active', assinatura_ativa_em = ?, assinatura_fim = ?, trial_termina_em = ?, ultimo_pagamento_mp = ? WHERE id = ?`,
                [new Date().toISOString(), nextMonth, nextMonth, String(paymentId), montadorId],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Erro ao ativar assinatura:', updateErr.message);
                    } else {
                        console.log(`✅ Montador ${montadorId} reativado via Mercado Pago payment ${paymentId}`);
                    }
                }
            );
        }
    } catch (error) {
        console.error('Erro ao processar webhook do Mercado Pago:', error);
    }

    res.status(200).json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor MontaJá API rodando em http://localhost:${PORT}`);
    console.log(`📂 Acesse http://localhost:${PORT} para ver o app funcionando!`);
});
