// Variáveis globais
let map;
let instituicoes = [];
let filteredInstituicoes = [];
let markersLayer;
let currentInstitutionName = ''; // Para a funcionalidade IA

// Configurações do mapa - Agora para todo o Brasil
const BRASIL_CENTER = [-15.0, -47.0];
const BRASIL_BOUNDS = [
    [-35.0, -75.0], // Southwest
    [5.0, -30.0]    // Northeast
];

// Cores para diferentes tipos de instituições (baseado na coluna Tipo)
const MARKER_COLORS = {
    'ICT': '#2563eb',              // Azul
    'IFS': '#059669',              // Verde escuro
    'Universidades': '#7c3aed',    // Roxo
    'Instituto Embrapii': '#dc2626', // Vermelho
    'Parque Tecnológico': '#16a34a', // Verde
    'Outros': '#6b7280'             // Cinza
};

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    initializeMap();
    setupEventListeners();
    
    // Aguardar um pouco para garantir que o mapa esteja totalmente inicializado
    setTimeout(() => {
        loadData();
    }, 100);
});

// Inicializar o mapa
function initializeMap() {
    map = L.map('map', {
        center: BRASIL_CENTER,
        zoom: 5,
        maxBounds: BRASIL_BOUNDS,
        maxBoundsViscosity: 1.0
    });

    // Adicionar camada de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 4
    }).addTo(map);

    // Criar layer group para os marcadores
    markersLayer = L.layerGroup().addTo(map);
}

// Carregar dados das instituições
async function loadData() {
    try {
        console.log('Carregando dados das instituições...');
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        instituicoes = await response.json();
        console.log(`${instituicoes.length} instituições carregadas`);
        
        filteredInstituicoes = [...instituicoes];
        
        updateStats();
        populateFilters();
        displayMarkers();
        updateResultsList();
        hideLoading();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        hideLoading();
        showError('Erro ao carregar dados das instituições. Tente novamente mais tarde.');
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Busca
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce(applyFilters, 300));
    
    // Reset filters
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // Modal
    document.getElementById('institution-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Tecla ESC para fechar modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Atualizar estatísticas no header
function updateStats() {
    document.getElementById('total-instituicoes').textContent = instituicoes.length;
    
    const estadosUnicos = new Set(instituicoes.map(inst => inst.Estado));
    document.getElementById('total-cidades').textContent = estadosUnicos.size;
}

// Popular filtros
function populateFilters() {
    // Tipos únicos (baseado na coluna Tipo)
    const tipos = [...new Set(instituicoes.map(inst => inst.Tipo))].filter(Boolean).sort();
    populateMultiSelectOptions('tipo', tipos);
    
    // Setores únicos
    const setores = [...new Set(instituicoes.map(inst => inst.Setor))].filter(Boolean).sort();
    populateMultiSelectOptions('setor', setores);
    
    // Estados únicos
    const estados = [...new Set(instituicoes.map(inst => inst.Estado))].filter(Boolean).sort();
    populateMultiSelectOptions('estado', estados);
}

// Determinar tipo de instituição para cor do marcador
function getInstitutionType(instituicao) {
    return instituicao.Tipo || 'Outros';
}

// Criar ícone customizado para marcador
function createCustomIcon(type) {
    const color = MARKER_COLORS[type] || MARKER_COLORS['Outros'];
    
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background-color: ${color};
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                position: relative;
            "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });
}

// Exibir marcadores no mapa
function displayMarkers() {
    // Verificar se o mapa e markersLayer estão inicializados
    if (!map || !markersLayer) {
        console.error('Mapa ou markersLayer não inicializados');
        return;
    }
    
    // Limpar marcadores existentes
    markersLayer.clearLayers();
    currentMarkers = [];
    
    filteredInstituicoes.forEach((instituicao, index) => {
        if (!instituicao.latitude || !instituicao.longitude) return;
        
        const type = getInstitutionType(instituicao);
        const icon = createCustomIcon(type);
        
        const marker = L.marker([instituicao.latitude, instituicao.longitude], { icon })
            .bindPopup(createPopupContent(instituicao))
            .addTo(markersLayer);
        
        currentMarkers.push(marker);
    });
}

// Criar conteúdo do popup
function createPopupContent(instituicao) {
    const nome = instituicao['Nome da Instituição/Tipo'] || 'Nome não disponível';
    const tipo = instituicao.Tipo || 'Não informado';
    const cidade = instituicao.Cidade || 'Não informado';
    const estado = instituicao.Estado || 'Não informado';
    const site = instituicao.Site;
    const contato = instituicao.Contato;
    
    let popupContent = `
        <div class="popup-content">
            <h3 class="popup-title">${nome}</h3>
            <div class="popup-info">
                <p><strong>Tipo:</strong> ${tipo}</p>
                <p><strong>Localização:</strong> ${cidade}, ${estado}</p>
    `;
    
    if (contato) {
        popupContent += `<p><strong>Contato:</strong> ${contato}</p>`;
    }
    
    popupContent += `
            </div>
            <div class="popup-actions">
    `;
    
    if (site) {
        popupContent += `<a href="${site}" target="_blank" class="btn-link">Visitar site</a>`;
    }
    
    popupContent += `
                <button onclick="showModal(${filteredInstituicoes.indexOf(instituicao)})" class="btn-details">Ver detalhes</button>
            </div>
        </div>
    `;
    
    return popupContent;
}

// Aplicar filtros
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    filteredInstituicoes = instituicoes.filter(instituicao => {
        // Filtro de busca
        const nome = (instituicao['Nome da Instituição/Tipo'] || '').toLowerCase();
        const tipo = (instituicao.Tipo || '').toLowerCase();
        const cidade = (instituicao.Cidade || '').toLowerCase();
        const estado = (instituicao.Estado || '').toLowerCase();
        const setor = (instituicao.Setor || '').toLowerCase();
        
        const matchesSearch = !searchTerm || 
            nome.includes(searchTerm) || 
            tipo.includes(searchTerm) || 
            cidade.includes(searchTerm) || 
            estado.includes(searchTerm) ||
            setor.includes(searchTerm);
        
        // Filtros múltiplos
        const matchesTipo = selectedFilters.tipo.length === 0 || 
            selectedFilters.tipo.includes(instituicao.Tipo);
        
        const matchesSetor = selectedFilters.setor.length === 0 || 
            selectedFilters.setor.includes(instituicao.Setor);
        
        const matchesEstado = selectedFilters.estado.length === 0 || 
            selectedFilters.estado.includes(instituicao.Estado);
        
        return matchesSearch && matchesTipo && matchesSetor && matchesEstado;
    });
    
    displayMarkers();
    updateResultsList();
}

// Resetar filtros
function resetFilters() {
    document.getElementById('search-input').value = '';
    resetMultiSelectFilters();
    
    filteredInstituicoes = [...instituicoes];
    displayMarkers();
    updateResultsList();
}

// Atualizar lista de resultados
function updateResultsList() {
    const resultsList = document.getElementById('institutions-list');
    const resultsCount = document.getElementById('results-count');
    
    resultsCount.textContent = `${filteredInstituicoes.length} resultados`;
    
    resultsList.innerHTML = '';
    
    filteredInstituicoes.forEach((instituicao, index) => {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.onclick = () => showModal(index);
        
        const nome = instituicao['Nome da Instituição/Tipo'] || 'Nome não disponível';
        const tipo = instituicao.Tipo || 'Não informado';
        const cidade = instituicao.Cidade || 'Não informado';
        const estado = instituicao.Estado || 'Não informado';
        
        item.innerHTML = `
            <h4>${nome}</h4>
            <p class="result-type">${tipo}</p>
            <p class="result-location">${cidade}, ${estado}</p>
        `;
        
        resultsList.appendChild(item);
    });
}

// Mostrar modal com detalhes
function showModal(index) {
    const instituicao = filteredInstituicoes[index];
    const modal = document.getElementById('institution-modal');
    
    const nome = instituicao['Nome da Instituição/Tipo'] || 'Nome não disponível';
    const tipo = instituicao.Tipo || 'Não informado';
    const cidade = instituicao.Cidade || 'Não informado';
    const estado = instituicao.Estado || 'Não informado';
    const site = instituicao.Site;
    const contato = instituicao.Contato;
    const setor = instituicao.Setor || 'Não informado';
    
    // Salvar nome da instituição para a IA
    currentInstitutionName = nome;
    
    // SEMPRE resetar o modal para o estado inicial
    document.getElementById('modal-title').textContent = nome;
    
    // Resetar conteúdo do modal para mostrar informações básicas
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="modal-info">
            <div class="info-row">
                <strong>Tipo:</strong>
                <span id="modal-tipo">${tipo}</span>
            </div>
            <div class="info-row">
                <strong>Localização:</strong>
                <span id="modal-cidade">${cidade}, ${estado}</span>
            </div>
            <div class="info-row">
                <strong>Setor:</strong>
                <span id="modal-setor">${setor}</span>
            </div>
            <div class="info-row">
                <strong>Site:</strong>
                <span id="modal-site">${site ? `<a href="${site}" target="_blank">${site}</a>` : 'Não informado'}</span>
            </div>
            <div class="info-row">
                <strong>Contato:</strong>
                <span id="modal-contato">${contato || 'Não informado'}</span>
            </div>
        </div>
        
        <div class="modal-actions">
            <button id="btn-visao-ia" class="btn-ai" onclick="executarVisaoIA('${nome}')">
                <i class="fas fa-brain"></i>
                Visão da IA
            </button>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Fechar modal
function closeModal() {
    document.getElementById('institution-modal').style.display = 'none';
}

// Mostrar loading
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

// Esconder loading
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Mostrar erro
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 5000);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

