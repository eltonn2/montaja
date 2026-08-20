/**
 * MontaJá - Servidor Backend API & Banco de Dados (Express + SQLite)
 */

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve os arquivos estáticos do frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Caminho do Banco de Dados SQLite
const DB_PATH = path.join(__dirname, 'montaja.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Conexão com o Banco de Dados
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        console.log('⚡ Conectado com sucesso ao Banco de Dados SQLite (montaja.db)');
        initDatabase();
    }
});

// Inicialização e População Inicial do Banco de Dados
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

// ============================================================================
// ROTAS DA API RESTful
// ============================================================================

// Healthcheck
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor MontaJá API operando normalmente!' });
});

// 1. GET /api/montadores - Listar e filtrar montadores
app.get('/api/montadores', (req, res) => {
    const { q, category } = req.query;

    let sql = `
        SELECT 
            m.id, m.nome as name, m.verificado as verified, m.avaliacao as rating, 
            m.total_avaliacoes as reviewsCount, m.trabalhos_concluidos as completedJobs,
            m.tempo_resposta as responseTime, m.dias_garantia as guaranteeDays,
            m.foto as photo, m.whatsapp as phone, 
            m.cidade as city, m.bairros_atendimento as neighborhoods, 
            m.anos_experiencia as experienceYears, m.bio, m.fotos_portfolio,
            GROUP_CONCAT(e.especialidade) as specialties_str
        FROM montadores m
        LEFT JOIN montador_especialidades e ON m.id = e.montador_id
    `;

    const whereConditions = [];
    const params = [];

    if (q) {
        const searchTerm = `%${q.toLowerCase()}%`;
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

        // Formata as especialidades e fotos de portfólio de JSON para Array
        const formattedRows = rows.map(row => {
            let portfolioPhotos = [];
            if (row.fotos_portfolio) {
                try {
                    portfolioPhotos = JSON.parse(row.fotos_portfolio);
                } catch (e) {
                    portfolioPhotos = [];
                }
            }
            return {
                ...row,
                verified: Boolean(row.verified),
                specialties: row.specialties_str ? row.specialties_str.split(',') : [],
                portfolioPhotos
            };
        });

        res.json(formattedRows);
    });
});

// 2. POST /api/montadores - Cadastrar novo montador
app.post('/api/montadores', (req, res) => {
    const { name, phone, city, neighborhoods, photo, bio, specialties, portfolioPhotos, completedJobs, responseTime, guaranteeDays } = req.body;

    if (!name || !phone || !city || !neighborhoods) {
        return res.status(400).json({ error: 'Campos obrigatórios: Nome, WhatsApp, Cidade e Bairros.' });
    }

    const defaultPhoto = photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
    const cleanPhone = phone.replace(/\D/g, '');
    const photosJson = JSON.stringify(Array.isArray(portfolioPhotos) ? portfolioPhotos : []);

    const insertSql = `
        INSERT INTO montadores (nome, verificado, avaliacao, total_avaliacoes, trabalhos_concluidos, tempo_resposta, dias_garantia, foto, whatsapp, cidade, bairros_atendimento, anos_experiencia, bio, fotos_portfolio)
        VALUES (?, 1, 5.0, 1, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `;

    const jobsCount = Number(completedJobs || 1);
    const respTime = responseTime || 'Responde em ~15 min';
    const guarDays = Number(guaranteeDays ?? 30);

    db.run(insertSql, [name, jobsCount, respTime, guarDays, defaultPhoto, cleanPhone, city, neighborhoods, bio || '', photosJson], function (err) {
        if (err) {
            console.error('Erro ao inserir no banco:', err.message);
            return res.status(500).json({ error: 'Erro ao cadastrar montador no banco de dados.' });
        }

        const newId = this.lastID;
        const selectedSpecialties = Array.isArray(specialties) && specialties.length > 0 ? specialties : ['Reparos Gerais'];

        // Inserir Especialidades
        const specStmt = db.prepare(`INSERT INTO montador_especialidades (montador_id, especialidade) VALUES (?, ?)`);
        selectedSpecialties.forEach(spec => specStmt.run(newId, spec));
        specStmt.finalize();

        // Objeto criado para retorno
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
            portfolioPhotos: Array.isArray(portfolioPhotos) ? portfolioPhotos : []
        };

        res.status(201).json(createdAssembler);
    });
});

// Iniciar Servidor API
app.listen(PORT, () => {
    console.log(`🚀 Servidor MontaJá API rodando em http://localhost:${PORT}`);
    console.log(`📂 Acesse http://localhost:${PORT} para ver o app funcionando com o Banco de Dados!`);
});
