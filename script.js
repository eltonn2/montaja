/**
 * MontaJá - Lógica Funcional Frontend com Suporte a API Backend & Banco de Dados
 * Conecta ao servidor Node.js + SQLite quando ativo, ou usa fallback local.
 */

const API_BASE_URL = `${window.location.origin}/api`;

// 1. DADOS INICIAIS DE TESTE (FALLBACK MOCK DATA)
const DEFAULT_ASSEMBLERS = [
    {
        id: 1,
        name: 'Carlos Eduardo Silva',
        verified: true,
        rating: 4.9,
        reviewsCount: 156,
        completedJobs: 156,
        responseTime: 'Responde em ~15 min',
        guaranteeDays: 30,
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
        phone: '11987654321',
        city: 'São Paulo',
        neighborhoods: 'Moema, Pinheiros, Vila Mariana e Centro',
        specialties: ['Guarda-Roupas', 'Cozinhas Planejadas', 'Painéis de TV'],
        experienceYears: 7,
        bio: 'Especialista em montagem de guarda-roupas grandes e cozinhas planejadas. Atendimento rápido e limpo com ferramentas profissionais.',
        portfolioPhotos: [
            'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=300&q=80',
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=300&q=80',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80'
        ]
    },
    {
        id: 2,
        name: 'Marcelo Oliveira',
        verified: true,
        rating: 4.8,
        reviewsCount: 98,
        completedJobs: 98,
        responseTime: 'Responde em ~30 min',
        guaranteeDays: 15,
        photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
        phone: '11976543210',
        city: 'São Paulo',
        neighborhoods: 'Tatuapé, Anália Franco, Mooca e Região Leste',
        specialties: ['Móveis de Escritório', 'Guarda-Roupas', 'Reparos Gerais'],
        experienceYears: 5,
        bio: 'Pontualidade e cuidado com seu imóvel. Montagem de escritórios corporativos, home office e reparos em gavetas e portas.',
        portfolioPhotos: [
            'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=300&q=80',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80'
        ]
    },
    {
        id: 3,
        name: 'Roberto "Beto" Santos',
        verified: true,
        rating: 5.0,
        reviewsCount: 210,
        completedJobs: 210,
        responseTime: 'Responde em ~15 min',
        guaranteeDays: 90,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        phone: '21998765432',
        city: 'Rio de Janeiro',
        neighborhoods: 'Barra da Tijuca, Recreio, Copacabana e Botafogo',
        specialties: ['Cozinhas Planejadas', 'Painéis de TV', 'Reparos Gerais'],
        experienceYears: 10,
        bio: 'Mais de 10 anos no ramo de montagens finas. Instalação perfeita de armários sob medida, nichos e suportes de TV na parede.',
        portfolioPhotos: [
            'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=300&q=80',
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=300&q=80',
            'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=300&q=80'
        ]
    },
    {
        id: 4,
        name: 'Lucas Ferreira',
        verified: true,
        rating: 4.7,
        reviewsCount: 84,
        completedJobs: 84,
        responseTime: 'Responde em ~1 hora',
        guaranteeDays: 30,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        phone: '11965432109',
        city: 'São Paulo',
        neighborhoods: 'Santo Amaro, Morumbi, Campo Belo e Grajaú',
        specialties: ['Guarda-Roupas', 'Móveis de Escritório'],
        experienceYears: 4,
        bio: 'Montador rápido para móveis convencionais (Ikea, MadeiraMadeira, Tok&Stok). Orçamento justo e sem enrolação.',
        portfolioPhotos: [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80'
        ]
    },
    {
        id: 5,
        name: 'Juliana & André (Dupla de Montagem)',
        verified: true,
        rating: 4.9,
        reviewsCount: 142,
        completedJobs: 142,
        responseTime: 'Responde em ~15 min',
        guaranteeDays: 60,
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        phone: '31988776655',
        city: 'Belo Horizonte',
        neighborhoods: 'Savassi, Lourdes, Buritis e Anchieta',
        specialties: ['Cozinhas Planejadas', 'Guarda-Roupas', 'Painéis de TV'],
        experienceYears: 6,
        bio: 'Trabalho em dupla para montagens complexas e grandes volumes. Entregamos seu ambiente pronto na metade do tempo!',
        portfolioPhotos: [
            'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=300&q=80',
            'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=300&q=80'
        ]
    },
    {
        id: 6,
        name: 'Fernando Souza',
        verified: true,
        rating: 4.8,
        reviewsCount: 115,
        completedJobs: 115,
        responseTime: 'Responde em ~30 min',
        guaranteeDays: 30,
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        phone: '41999887766',
        city: 'Curitiba',
        neighborhoods: 'Batel, Água Verde, Bigorrilho e Centro',
        specialties: ['Reparos Gerais', 'Móveis de Escritório'],
        experienceYears: 8,
        bio: 'Especialista em desmontagem e remontagem para mudanças, além de regulagem de dobradiças e corrediças de gavetas.',
        portfolioPhotos: [
            'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=300&q=80',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80'
        ]
    }
];

// 2. ESTADO DA APLICAÇÃO
let assemblers = [];
let isApiConnected = false;
let favoriteIds = [];
let showOnlyFavorites = false;

// 3. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
    initApp();
    setupEventListeners();
});

function loadFavorites() {
    const storedFavs = localStorage.getItem('montaja_favorites');
    if (storedFavs) {
        try {
            favoriteIds = JSON.parse(storedFavs).map(Number);
        } catch (e) {
            favoriteIds = [];
        }
    }
    updateFavoritesBadge();
}

function updateFavoritesBadge() {
    const badge = document.getElementById('favorites-badge');
    if (badge) {
        badge.textContent = favoriteIds.length;
    }
}

function toggleFavorite(assemblerId, event) {
    if (event) event.stopPropagation();

    const numericId = Number(assemblerId);
    const index = favoriteIds.indexOf(numericId);

    if (index > -1) {
        favoriteIds.splice(index, 1);
        showToast('Montador removido dos favoritos.', 'info');
    } else {
        favoriteIds.push(numericId);
        showToast('❤️ Montador adicionado aos favoritos!', 'success');
    }

    localStorage.setItem('montaja_favorites', JSON.stringify(favoriteIds));
    updateFavoritesBadge();

    handleFilterChange();
}

function toggleFavoritesFilter() {
    showOnlyFavorites = !showOnlyFavorites;
    const btn = document.getElementById('btn-toggle-favorites');
    const icon = document.getElementById('fav-filter-icon');

    if (btn) {
        if (showOnlyFavorites) {
            btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-200');
            btn.classList.add('bg-rose-500', 'text-white', 'border-rose-600');
            if (icon) {
                icon.classList.remove('fa-regular', 'text-rose-500');
                icon.classList.add('fa-solid', 'text-white');
            }
            showToast('Exibindo apenas seus montadores favoritos!', 'info');
        } else {
            btn.classList.remove('bg-rose-500', 'text-white', 'border-rose-600');
            btn.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
            if (icon) {
                icon.classList.remove('fa-solid', 'text-white');
                icon.classList.add('fa-regular', 'text-rose-500');
            }
        }
    }

    handleFilterChange();
}

async function initApp() {
    await fetchAssemblersFromApiOrLocal();
}

async function fetchAssemblersFromApiOrLocal(query = '', category = '') {
    try {
        const url = new URL(`${API_BASE_URL}/montadores`);
        if (query) url.searchParams.append('q', query);
        if (category) url.searchParams.append('category', category);

        const response = await fetch(url.toString());
        if (response.ok) {
            const data = await response.json();
            assemblers = data;
            isApiConnected = true;

            const filtered = filterLocalAssemblers(assemblers, query, category);
            renderAssemblers(filtered);
            return;
        }
    } catch (e) {
        // Servidor API off-line, usando fallback do localStorage
        isApiConnected = false;
    }

    // Fallback Local Storage
    const storedData = localStorage.getItem('montaja_assemblers');
    if (storedData) {
        try {
            assemblers = JSON.parse(storedData);
        } catch (e) {
            assemblers = DEFAULT_ASSEMBLERS;
        }
    } else {
        assemblers = DEFAULT_ASSEMBLERS;
        localStorage.setItem('montaja_assemblers', JSON.stringify(assemblers));
    }

    // Filtragem local se a API não estiver conectada
    const filtered = filterLocalAssemblers(assemblers, query, category);
    renderAssemblers(filtered);
}

function filterLocalAssemblers(list, query, category) {
    const q = query.toLowerCase().trim();
    return list.filter(item => {
        const matchQuery = !q || 
            item.neighborhoods.toLowerCase().includes(q) ||
            item.city.toLowerCase().includes(q) ||
            item.name.toLowerCase().includes(q);

        const matchCategory = !category || 
            (item.specialties && item.specialties.includes(category));

        const matchFav = !showOnlyFavorites || favoriteIds.includes(Number(item.id));

        return matchQuery && matchCategory && matchFav;
    });
}

function updateAssemblersCount(count) {
    const countEl = document.getElementById('assemblers-count');
    if (!countEl) return;

    const label = count === 1 ? 'profissional' : 'profissionais';
    countEl.textContent = `${count} ${label}`;
}

function handleFilterChange() {
    const searchInput = document.getElementById('search-location');
    const categorySelect = document.getElementById('filter-category');
    const query = searchInput ? searchInput.value.trim() : '';
    const category = categorySelect ? categorySelect.value : '';

    const filtered = filterLocalAssemblers(assemblers, query, category);
    renderAssemblers(filtered);
}

function clearFilters() {
    const searchInput = document.getElementById('search-location');
    const categorySelect = document.getElementById('filter-category');

    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = '';

    handleFilterChange();
}

// 4. EVENT LISTENERS
function setupEventListeners() {
    const searchInput = document.getElementById('search-location');
    const categorySelect = document.getElementById('filter-category');
    const btnSearch = document.getElementById('btn-search');
    const btnClear = document.getElementById('btn-clear');

    if (searchInput) searchInput.addEventListener('input', handleFilterChange);
    if (categorySelect) categorySelect.addEventListener('change', handleFilterChange);
    if (btnSearch) btnSearch.addEventListener('click', handleFilterChange);
    if (btnClear) btnClear.addEventListener('click', clearFilters);

    // Modal de Cadastro
    const btnOpenModal = document.getElementById('btn-open-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const modalCadastro = document.getElementById('modal-cadastro');
    const registerForm = document.getElementById('register-form');

    if (btnOpenModal) btnOpenModal.addEventListener('click', openModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (modalCadastro) {
        modalCadastro.addEventListener('click', (e) => {
            if (e.target === modalCadastro) closeModal();
        });
    }

    const lightboxModal = document.getElementById('modal-lightbox');
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });
    }

    const orderModal = document.getElementById('modal-order');
    if (orderModal) {
        orderModal.addEventListener('click', (e) => {
            if (e.target === orderModal) closeOrderModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (isModalOpen()) closeModal();
            if (isOrderModalOpen()) closeOrderModal();
            closeLightbox();
        }
    });

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }

    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
}

// 5. RENDERIZAÇÃO DOS CARDS
function renderAssemblers(list) {
    const grid = document.getElementById('assemblers-grid');
    const emptyState = document.getElementById('empty-state');

    if (!grid) return;

    grid.innerHTML = '';

    if (!list || list.length === 0) {
        if (emptyState) {
            emptyState.classList.remove('hidden');
            const emptyTitle = emptyState.querySelector('h3');
            const emptyText = emptyState.querySelector('p');
            if (showOnlyFavorites) {
                if (emptyTitle) emptyTitle.textContent = 'Nenhum favorito salvo';
                if (emptyText) emptyText.textContent = 'Você ainda não favoritou nenhum montador. Clique no ícone de coração nos cards para salvar seus profissionais preferidos.';
            } else {
                if (emptyTitle) emptyTitle.textContent = 'Nenhum montador encontrado';
                if (emptyText) emptyText.textContent = 'Tente buscar por outro bairro ou limpe os filtros para ver todos os profissionais da região.';
            }
        }
        grid.classList.add('hidden');
        updateAssemblersCount(0);
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    grid.classList.remove('hidden');

    list.forEach((item, index) => {
        const card = createAssemblerCard(item, index);
        grid.appendChild(card);
    });

    updateAssemblersCount(list.length);
}

function createAssemblerCard(item, index) {
    const isFav = favoriteIds.includes(Number(item.id));
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover flex flex-col justify-between animate-fade-in';
    card.style.animationDelay = `${index * 0.05}s`;

    const whatsappMsg = encodeURIComponent(
        `Olá ${item.name}, vi seu perfil no MontaJá e gostaria de solicitar um orçamento para montagem de móveis.`
    );
    const cleanPhone = item.phone ? item.phone.replace(/\D/g, '') : '';
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${whatsappMsg}`;

    const tagsHtml = (item.specialties || [])
        .map(spec => `<span class="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-100/60 mr-1 mb-1">${spec}</span>`)
        .join('');

    // Selo de Garantia de Serviço
    const guaranteeDays = Number(item.guaranteeDays ?? 30);
    const guaranteeBadgeHtml = guaranteeDays > 0 ? `
        <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70" title="Garantia estendida do serviço">
            <i class="fa-solid fa-shield-halved text-emerald-600 text-[10px]"></i>
            <span>${guaranteeDays} dias de garantia</span>
        </span>
    ` : '';

    // Galeria de Fotos de Trabalhos Anteriores (Antes/Depois)
    let galleryHtml = '';
    if (item.portfolioPhotos && item.portfolioPhotos.length > 0) {
        const photosHtml = item.portfolioPhotos.slice(0, 3).map((photoUrl, pIdx) => `
            <div class="relative overflow-hidden rounded-xl bg-slate-100 aspect-square group/img cursor-pointer border border-slate-200/80 shadow-xs"
                 onclick="openLightbox('${photoUrl}', 'Trabalho realizado por ${item.name.replace(/'/g, "\\'")}')">
                <img src="${photoUrl}" alt="Foto de trabalho ${pIdx + 1}" 
                     class="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                     onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs\'><i class=\'fa-solid fa-image\'></i></div>'">
                <div class="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    <i class="fa-solid fa-magnifying-glass-plus text-sm"></i>
                </div>
            </div>
        `).join('');

        galleryHtml = `
            <div class="mb-4">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[11px] uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1">
                        <i class="fa-solid fa-camera text-brand-600"></i> Trabalhos Realizados
                    </span>
                    <span class="text-[10px] text-slate-400 font-medium">${item.portfolioPhotos.length} foto(s)</span>
                </div>
                <div class="grid grid-cols-3 gap-1.5">
                    ${photosHtml}
                </div>
            </div>
        `;
    } else {
        galleryHtml = `
            <div class="mb-4 bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 flex items-center gap-2.5 text-xs text-slate-500">
                <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs">
                    <i class="fa-solid fa-images"></i>
                </div>
                <span class="text-[11px] leading-tight text-slate-500">Fotos de projetos anteriores disponíveis via WhatsApp</span>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="p-6">
            <div class="flex items-start gap-4 mb-4">
                <div class="relative flex-shrink-0">
                    <img src="${item.photo}" alt="${item.name}" class="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'">
                    ${item.verified ? `
                        <span class="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md" title="Profissional Verificado" aria-label="Verificado">
                            <i class="fa-solid fa-check"></i>
                        </span>
                    ` : ''}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-1 mb-1">
                        <h3 class="text-base font-bold text-slate-900 truncate" title="${item.name}">${item.name}</h3>
                        <button type="button" onclick="toggleFavorite(${item.id}, event)" 
                                class="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 border border-slate-200/60 flex items-center justify-center transition-colors shadow-2xs group/fav cursor-pointer flex-shrink-0" 
                                title="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}" aria-label="Favoritar">
                            <i class="${isFav ? 'fa-solid fa-heart text-rose-500 scale-110' : 'fa-regular fa-heart text-slate-400 group-hover/fav:text-rose-500'} transition-transform text-xs"></i>
                        </button>
                    </div>

                    <!-- Badges de Confiança (Estrelas, Trabalhos Concluídos, Garantia) -->
                    <div class="flex flex-wrap items-center gap-1.5 text-xs mb-1.5">
                        <span class="inline-flex items-center text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/60" title="Nota de avaliação">
                            <i class="fa-solid fa-star text-[11px] mr-1"></i>${Number(item.rating || 5).toFixed(1)}
                        </span>
                        <span class="inline-flex items-center text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded-md text-[11px]" title="Trabalhos concluídos">
                            <i class="fa-solid fa-circle-check text-emerald-500 text-[10px] mr-1"></i>${item.completedJobs || item.reviewsCount || 1} montagens
                        </span>
                        ${guaranteeBadgeHtml}
                    </div>

                    <!-- Tempo de Resposta -->
                    <p class="text-[11px] text-slate-500 flex items-center gap-1 mb-1 font-medium">
                        <i class="fa-solid fa-bolt text-amber-500 text-[10px]"></i>
                        <span>${item.responseTime || 'Responde em ~15 min'}</span>
                    </p>

                    <p class="text-xs text-slate-500 flex items-center gap-1">
                        <i class="fa-solid fa-location-dot text-slate-400 text-xs"></i>
                        <span class="font-medium text-slate-700">${item.city}</span>
                    </p>
                </div>
            </div>

            <p class="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed italic">
                "${item.bio || 'Profissional qualificado pronto para realizar sua montagem com segurança.'}"
            </p>

            <div class="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <span class="font-semibold text-slate-700 block mb-0.5">
                    <i class="fa-solid fa-map-location-dot mr-1 text-blue-600"></i>Regiões de Atendimento:
                </span>
                <span class="text-slate-600">${item.neighborhoods}</span>
            </div>

            ${galleryHtml}

            <div class="mb-4">
                <span class="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1.5">Especialidades</span>
                <div class="flex flex-wrap">
                    ${tagsHtml}
                </div>
            </div>
        </div>

        <div class="p-6 pt-0">
            <button type="button" onclick="openOrderModal(${item.id})" 
               class="whatsapp-btn w-full text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all duration-200 cursor-pointer">
                <i class="fa-brands fa-whatsapp text-lg"></i>
                Solicitar Orçamento no WhatsApp
            </button>
        </div>
    `;

    return card;
}

// 7. CONTROLE DO MODAL DE ORÇAMENTO RÁPIDO (PRÉ-PEDIDO WHATSAPP)
function openOrderModal(assemblerId) {
    const assembler = assemblers.find(a => Number(a.id) === Number(assemblerId));
    if (!assembler) return;

    const modal = document.getElementById('modal-order');
    const nameEl = document.getElementById('order-assembler-name');
    const idInput = document.getElementById('order-assembler-id');
    const locationInput = document.getElementById('order-location');

    if (modal && idInput) {
        idInput.value = assembler.id;
        if (nameEl) nameEl.textContent = `Com ${assembler.name}`;
        
        // Pré-preenche a localização se o usuário pesquisou por um bairro
        const searchVal = document.getElementById('search-location')?.value.trim();
        if (locationInput && searchVal) {
            locationInput.value = searchVal;
        }

        modal.classList.remove('modal-hidden');
        modal.classList.add('modal-visible');
        document.body.style.overflow = 'hidden';
    }
}

function closeOrderModal() {
    const modal = document.getElementById('modal-order');
    if (modal) {
        modal.classList.remove('modal-visible');
        modal.classList.add('modal-hidden');
        document.body.style.overflow = '';
    }
}

function isOrderModalOpen() {
    const modal = document.getElementById('modal-order');
    return modal && modal.classList.contains('modal-visible');
}

function handleOrderSubmit(e) {
    e.preventDefault();

    const idInput = document.getElementById('order-assembler-id');
    const typeSelect = document.getElementById('order-furniture-type');
    const qtySelect = document.getElementById('order-quantity');
    const condSelect = document.getElementById('order-condition');
    const urgSelect = document.getElementById('order-urgency');
    const locInput = document.getElementById('order-location');

    const assemblerId = idInput?.value;
    const assembler = assemblers.find(a => Number(a.id) === Number(assemblerId));
    if (!assembler) {
        showToast('Erro ao identificar montador.', 'warning');
        return;
    }

    const type = typeSelect?.value || 'Móveis';
    const qty = qtySelect?.value || '1 peça';
    const cond = condSelect?.value || 'Novo na caixa';
    const urg = urgSelect?.value || 'Nesta semana';
    const loc = locInput?.value.trim() || 'Minha região';

    const messageText = 
`Olá ${assembler.name}! Vi seu perfil no MontaJá e gostaria de um orçamento:

📌 *Móvel:* ${type}
📦 *Quantidade:* ${qty}
🛠️ *Estado:* ${cond}
⏰ *Prazo:* ${urg}
📍 *Local:* ${loc}

Podemos combinar o valor e sua disponibilidade?`;

    const cleanPhone = assembler.phone ? assembler.phone.replace(/\D/g, '') : '';
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(messageText)}`;

    closeOrderModal();
    showToast('🚀 Redirecionando para o WhatsApp...', 'success');

    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 350);
}

// 7. CONTROLE DO LIGHTBOX (VISUALIZAÇÃO AMPLIADA DA FOTO)
function openLightbox(imgUrl, caption = 'Trabalho de Montagem') {
    const modal = document.getElementById('modal-lightbox');
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');

    if (modal && img) {
        img.src = imgUrl;
        if (cap) cap.textContent = caption;
        modal.classList.remove('modal-hidden');
        modal.classList.add('modal-visible');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const modal = document.getElementById('modal-lightbox');
    if (modal) {
        modal.classList.remove('modal-visible');
        modal.classList.add('modal-hidden');
        document.body.style.overflow = '';
    }
}

// 8. CONTROLE DO MODAL
function openModal() {
    const modal = document.getElementById('modal-cadastro');
    if (modal) {
        modal.classList.remove('modal-hidden');
        modal.classList.add('modal-visible');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            const firstInput = document.getElementById('register-name');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function closeModal() {
    const modal = document.getElementById('modal-cadastro');
    if (modal) {
        modal.classList.remove('modal-visible');
        modal.classList.add('modal-hidden');
        document.body.style.overflow = '';
    }
}

function isModalOpen() {
    const modal = document.getElementById('modal-cadastro');
    return modal && modal.classList.contains('modal-visible');
}

// 9. ENVIO DO FORMULÁRIO (GRAVA NO BANCO DE DADOS SE CONECTADO)
async function handleRegisterSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById('register-name');
    const phoneInput = document.getElementById('register-phone');
    const cityInput = document.getElementById('register-city');
    const neighborhoodsInput = document.getElementById('register-neighborhoods');
    const photoInput = document.getElementById('register-photo');
    const bioInput = document.getElementById('register-bio');
    const completedJobsInput = document.getElementById('register-completed-jobs');
    const responseTimeSelect = document.getElementById('register-response-time');
    const guaranteeSelect = document.getElementById('register-guarantee');
    const completedJobs = Number(completedJobsInput?.value || 1);
    const responseTime = responseTimeSelect?.value || 'Responde em ~15 min';
    const guaranteeDays = Number(guaranteeSelect?.value ?? 30);

    const g1 = document.getElementById('register-gallery-1')?.value.trim();
    const g2 = document.getElementById('register-gallery-2')?.value.trim();
    const g3 = document.getElementById('register-gallery-3')?.value.trim();
    const portfolioPhotos = [g1, g2, g3].filter(url => Boolean(url));

    const selectedSpecialties = Array.from(
        document.querySelectorAll('input[name="register-specialties"]:checked')
    ).map(cb => cb.value);

    if (selectedSpecialties.length === 0) {
        showToast('Selecione pelo menos 1 especialidade!', 'warning');
        return;
    }

    const payload = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        city: cityInput.value.trim(),
        neighborhoods: neighborhoodsInput.value.trim(),
        photo: photoInput.value.trim(),
        bio: bioInput.value.trim(),
        completedJobs: completedJobs,
        responseTime: responseTime,
        guaranteeDays: guaranteeDays,
        specialties: selectedSpecialties,
        portfolioPhotos: portfolioPhotos
    };

    if (isApiConnected) {
        try {
            const response = await fetch(`${API_BASE_URL}/montadores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast('🎉 Montador cadastrado com sucesso no Banco de Dados SQLite!', 'success');
                e.target.reset();
                closeModal();
                fetchAssemblersFromApiOrLocal();
                return;
            }
        } catch (err) {
            console.error('Erro ao postar na API:', err);
        }
    }

    // Fallback local se a API não estiver conectada
    const newAssembler = {
        id: Date.now(),
        ...payload,
        verified: true,
        rating: 5.0,
        reviewsCount: 1,
        photo: payload.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        phone: payload.phone.replace(/\D/g, '')
    };

    assemblers.unshift(newAssembler);
    localStorage.setItem('montaja_assemblers', JSON.stringify(assemblers));
    renderAssemblers(assemblers);

    e.target.reset();
    closeModal();
    showToast('🎉 Cadastro realizado localmente com sucesso!', 'success');
}

// 9. TOAST NOTIFICATIONS
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast-notification');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'fixed bottom-6 right-6 z-50 transform transition-all duration-300 translate-y-10 opacity-0 max-w-md';
        document.body.appendChild(toast);
    }

    const bgColors = {
        success: 'bg-slate-900 text-white border-emerald-500',
        warning: 'bg-amber-900 text-white border-amber-500',
        info: 'bg-blue-900 text-white border-blue-500'
    };

    const icons = {
        success: '<i class="fa-solid fa-circle-check text-emerald-400 text-lg mr-3"></i>',
        warning: '<i class="fa-solid fa-triangle-exclamation text-amber-400 text-lg mr-3"></i>',
        info: '<i class="fa-solid fa-circle-info text-blue-400 text-lg mr-3"></i>'
    };

    toast.innerHTML = `
        <div class="flex items-center p-4 rounded-xl shadow-2xl border-l-4 ${bgColors[type] || bgColors.info}">
            ${icons[type] || icons.info}
            <span class="text-sm font-medium leading-snug">${message}</span>
        </div>
    `;

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-10', 'opacity-0');
    }, 4000);
}