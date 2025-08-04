// Variáveis globais
let map;
let markersLayer;
let instituicoes = [];
let filteredInstituicoes = [];
let currentMarkers = [];

// Configurações do mapa
const RS_CENTER = [-29.5, -53.0];
const RS_BOUNDS = [
    [-33.8, -57.7], // Southwest
    [-27.0, -49.7]  // Northeast
];

// Cores para diferentes tipos de instituições
const MARKER_COLORS = {
    'ict': '#2563eb',
    'parque': '#10b981',
    'embrapii': '#f59e0b',
    'outros': '#64748b'
};

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    initializeMap();
    loadData();
    setupEventListeners();
});

// Inicializar o mapa
function initializeMap() {
    map = L.map('map', {
        center: RS_CENTER,
        zoom: 7,
        maxBounds: RS_BOUNDS,
        maxBoundsViscosity: 1.0
    });

    // Adicionar camada de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 6
    }).addTo(map);

    // Criar layer group para os marcadores
    markersLayer = L.layerGroup().addTo(map);
}

// Carregar dados das instituições
async function loadData() {
    try {
        // Simular carregamento dos dados (em produção, seria um fetch)
        // Por enquanto, vamos usar dados mockados baseados no que processamos
        const response = await fetch('./data.json').catch(() => {
            // Se não conseguir carregar o arquivo, usar dados mockados
            return { ok: false };
        });

        if (response.ok) {
            instituicoes = await response.json();
        } else {
            // Dados mockados para demonstração
            instituicoes = await getMockData();
        }

        // Filtrar apenas instituições do RS com coordenadas
        instituicoes = instituicoes.filter(inst => 
            inst.Estado === 'RS' && 
            inst.latitude && 
            inst.longitude
        );

        filteredInstituicoes = [...instituicoes];
        
        updateStats();
        populateFilters();
        displayMarkers();
        displayInstitutionsList();
        hideLoading();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        hideLoading();
        showError('Erro ao carregar os dados das instituições.');
    }
}

// Dados mockados baseados no processamento anterior
async function getMockData() {
    return [
        {
            "Cidade": "Porto Alegre",
            "Estado": "RS",
            "Abreviatura da Instituição": "UFRGS",
            "Nome da Instituição/Tipo": "Universidade Federal do Rio Grande do Sul",
            "Setor": "ICT",
            "Contato": "",
            "Site": "https://www.ufrgs.br",
            "E-mail de contato": "reitoria@ufrgs.br",
            "latitude": -30.0346,
            "longitude": -51.2177,
            "coordenadas_status": "conhecida"
        },
        {
            "Cidade": "Caxias do Sul",
            "Estado": "RS",
            "Abreviatura da Instituição": "UCS",
            "Nome da Instituição/Tipo": "Universidade de Caxias do Sul",
            "Setor": "ICT",
            "Contato": "",
            "Site": "https://www.ucs.br",
            "E-mail de contato": "reitoria@ucs.br",
            "latitude": -29.1685,
            "longitude": -51.1796,
            "coordenadas_status": "conhecida"
        },
        {
            "Cidade": "Pelotas",
            "Estado": "RS",
            "Abreviatura da Instituição": "UFPEL",
            "Nome da Instituição/Tipo": "Universidade Federal de Pelotas",
            "Setor": "ICT",
            "Contato": "",
            "Site": "https://portal.ufpel.edu.br",
            "E-mail de contato": "reitoria@ufpel.edu.br",
            "latitude": -31.7654,
            "longitude": -52.3376,
            "coordenadas_status": "conhecida"
        },
        {
            "Cidade": "Santa Maria",
            "Estado": "RS",
            "Abreviatura da Instituição": "UFSM",
            "Nome da Instituição/Tipo": "Universidade Federal de Santa Maria",
            "Setor": "ICT",
            "Contato": "",
            "Site": "https://www.ufsm.br",
            "E-mail de contato": "reitoria@ufsm.br",
            "latitude": -29.6842,
            "longitude": -53.8069,
            "coordenadas_status": "conhecida"
        },
        {
            "Cidade": "Passo Fundo",
            "Estado": "RS",
            "Abreviatura da Instituição": "UPF",
            "Nome da Instituição/Tipo": "Universidade de Passo Fundo",
            "Setor": "ICT",
            "Contato": "",
            "Site": "https://www.upf.br",
            "E-mail de contato": "reitoria@upf.br",
            "latitude": -28.2636,
            "longitude": -52.4069,
            "coordenadas_status": "conhecida"
        },
        {
            "Cidade": "Porto Alegre",
            "Estado": "RS",
            "Abreviatura da Instituição": "TECNOPUC",
            "Nome da Instituição/Tipo": "Parque Científico e Tecnológico da PUCRS",
            "Setor": "Parque Tecnológico",
            "Contato": "",
            "Site": "https://www.tecnopuc.com.br",
            "E-mail de contato": "contato@tecnopuc.com.br",
            "latitude": -30.0346,
            "longitude": -51.2177,
            "coordenadas_status": "conhecida"
        }
    ];
}

// Configurar event listeners
function setupEventListeners() {
    // Busca
    const searchInput = document.getElementById('search-input');
    const clearSearch = document.getElementById('clear-search');
    
    searchInput.addEventListener('input', handleSearch);
    clearSearch.addEventListener('click', clearSearchInput);
    
    // Filtros
    document.getElementById('tipo-filter').addEventListener('change', applyFilters);
    document.getElementById('cidade-filter').addEventListener('change', applyFilters);
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
    
    const cidadesUnicas = new Set(instituicoes.map(inst => inst.Cidade));
    document.getElementById('total-cidades').textContent = cidadesUnicas.size;
}

// Popular filtros
function populateFilters() {
    const tipoFilter = document.getElementById('tipo-filter');
    const cidadeFilter = document.getElementById('cidade-filter');
    
    // Tipos únicos
    const tipos = new Set(instituicoes.map(inst => inst.Setor || 'Outros').filter(Boolean));
    tipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        tipoFilter.appendChild(option);
    });
    
    // Cidades únicas
    const cidades = new Set(instituicoes.map(inst => inst.Cidade).filter(Boolean));
    Array.from(cidades).sort().forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade;
        option.textContent = cidade;
        cidadeFilter.appendChild(option);
    });
}

// Determinar tipo de instituição para cor do marcador
function getInstitutionType(instituicao) {
    const setor = (instituicao.Setor || '').toLowerCase();
    const nome = (instituicao['Nome da Instituição/Tipo'] || '').toLowerCase();
    
    if (setor.includes('ict') || nome.includes('universidade') || nome.includes('instituto')) {
        return 'ict';
    } else if (setor.includes('parque') || nome.includes('parque')) {
        return 'parque';
    } else if (setor.includes('embrapii') || nome.includes('embrapii')) {
        return 'embrapii';
    } else {
        return 'outros';
    }
}

// Criar ícone customizado para marcador
function createCustomIcon(type) {
    const color = MARKER_COLORS[type];
    
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
    // Limpar marcadores existentes
    markersLayer.clearLayers();
    currentMarkers = [];
    
    filteredInstituicoes.forEach((instituicao, index) => {
        if (!instituicao.latitude || !instituicao.longitude) return;
        
        const type = getInstitutionType(instituicao);
        const icon = createCustomIcon(type);
        
        const marker = L.marker([instituicao.latitude, instituicao.longitude], { icon })
            .bindPopup(createPopupContent(instituicao))
            .on('click', () => highlightInstitution(index));
        
        markersLayer.addLayer(marker);
        currentMarkers.push({ marker, instituicao, index });
    });
}

// Criar conteúdo do popup
function createPopupContent(instituicao) {
    const nome = instituicao['Nome da Instituição/Tipo'] || 'Nome não disponível';
    const cidade = instituicao.Cidade || 'Cidade não informada';
    const setor = instituicao.Setor || 'Tipo não informado';
    const site = instituicao.Site;
    const email = instituicao['E-mail de contato'];
    
    let content = `
        <div style="min-width: 250px;">
            <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px; font-weight: 600; line-height: 1.3;">
                ${nome}
            </h4>
            <div style="margin-bottom: 6px;">
                <span style="display: inline-block; background: rgba(37, 99, 235, 0.1); color: #2563eb; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;">
                    ${setor}
                </span>
            </div>
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">
                <i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i>
                ${cidade}, RS
            </p>
    `;
    
    if (site) {
        content += `
            <p style="margin: 0 0 6px 0;">
                <a href="${site}" target="_blank" style="color: #2563eb; text-decoration: none; font-size: 12px;">
                    <i class="fas fa-external-link-alt" style="margin-right: 4px;"></i>
                    Visitar site
                </a>
            </p>
        `;
    }
    
    if (email) {
        content += `
            <p style="margin: 0 0 6px 0;">
                <a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-size: 12px;">
                    <i class="fas fa-envelope" style="margin-right: 4px;"></i>
                    ${email}
                </a>
            </p>
        `;
    }
    
    content += `
            <button onclick="showInstitutionDetails(${filteredInstituicoes.indexOf(instituicao)})" 
                    style="margin-top: 8px; padding: 6px 12px; background: #2563eb; color: white; border: none; border-radius: 4px; font-size: 11px; cursor: pointer;">
                Ver detalhes
            </button>
        </div>
    `;
    
    return content;
}

// Exibir lista de instituições
function displayInstitutionsList() {
    const container = document.getElementById('institutions-list');
    const noResults = document.getElementById('no-results');
    const resultsCount = document.getElementById('results-count');
    
    // Atualizar contador
    resultsCount.textContent = `${filteredInstituicoes.length} resultado${filteredInstituicoes.length !== 1 ? 's' : ''}`;
    
    if (filteredInstituicoes.length === 0) {
        container.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    noResults.style.display = 'none';
    
    container.innerHTML = '';
    
    filteredInstituicoes.forEach((instituicao, index) => {
        const card = document.createElement('div');
        card.className = 'institution-card';
        card.onclick = () => selectInstitution(index);
        
        const nome = instituicao['Nome da Instituição/Tipo'] || 'Nome não disponível';
        const cidade = instituicao.Cidade || 'Cidade não informada';
        const setor = instituicao.Setor || 'Outros';
        
        card.innerHTML = `
            <div class="institution-name">${nome}</div>
            <div class="institution-type">${setor}</div>
            <div class="institution-location">
                <i class="fas fa-map-marker-alt"></i>
                ${cidade}, RS
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Selecionar instituição na lista
function selectInstitution(index) {
    // Remover seleção anterior
    document.querySelectorAll('.institution-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Adicionar seleção atual
    const cards = document.querySelectorAll('.institution-card');
    if (cards[index]) {
        cards[index].classList.add('active');
    }
    
    // Centralizar no mapa
    const instituicao = filteredInstituicoes[index];
    if (instituicao.latitude && instituicao.longitude) {
        map.setView([instituicao.latitude, instituicao.longitude], 12);
        
        // Abrir popup do marcador correspondente
        const markerData = currentMarkers.find(m => m.index === index);
        if (markerData) {
            markerData.marker.openPopup();
        }
    }
}

// Destacar instituição quando marcador é clicado
function highlightInstitution(index) {
    selectInstitution(index);
    
    // Scroll para o item na lista
    const cards = document.querySelectorAll('.institution-card');
    if (cards[index]) {
        cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Busca
function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    const clearBtn = document.getElementById('clear-search');
    
    clearBtn.style.display = searchTerm ? 'block' : 'none';
    
    applyFilters();
}

// Limpar busca
function clearSearchInput() {
    document.getElementById('search-input').value = '';
    document.getElementById('clear-search').style.display = 'none';
    applyFilters();
}

// Aplicar filtros
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    const tipoFilter = document.getElementById('tipo-filter').value;
    const cidadeFilter = document.getElementById('cidade-filter').value;
    
    filteredInstituicoes = instituicoes.filter(instituicao => {
        // Filtro de busca
        if (searchTerm) {
            const nome = (instituicao['Nome da Instituição/Tipo'] || '').toLowerCase();
            const cidade = (instituicao.Cidade || '').toLowerCase();
            const setor = (instituicao.Setor || '').toLowerCase();
            
            if (!nome.includes(searchTerm) && 
                !cidade.includes(searchTerm) && 
                !setor.includes(searchTerm)) {
                return false;
            }
        }
        
        // Filtro de tipo
        if (tipoFilter && (instituicao.Setor || 'Outros') !== tipoFilter) {
            return false;
        }
        
        // Filtro de cidade
        if (cidadeFilter && instituicao.Cidade !== cidadeFilter) {
            return false;
        }
        
        return true;
    });
    
    displayMarkers();
    displayInstitutionsList();
}

// Resetar filtros
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('tipo-filter').value = '';
    document.getElementById('cidade-filter').value = '';
    document.getElementById('clear-search').style.display = 'none';
    
    filteredInstituicoes = [...instituicoes];
    displayMarkers();
    displayInstitutionsList();
    
    // Voltar para visualização geral do RS
    map.setView(RS_CENTER, 7);
}

// Mostrar detalhes da instituição em modal
function showInstitutionDetails(index) {
    const instituicao = filteredInstituicoes[index];
    const modal = document.getElementById('institution-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = instituicao['Nome da Instituição/Tipo'] || 'Instituição';
    
    body.innerHTML = `
        <div class="modal-field">
            <label>Tipo:</label>
            <div class="value">${instituicao.Setor || 'Não informado'}</div>
        </div>
        
        <div class="modal-field">
            <label>Cidade:</label>
            <div class="value">${instituicao.Cidade || 'Não informada'}, RS</div>
        </div>
        
        ${instituicao.Site ? `
        <div class="modal-field">
            <label>Site oficial:</label>
            <div class="value">
                <a href="${instituicao.Site}" target="_blank">${instituicao.Site}</a>
            </div>
        </div>
        ` : ''}
        
        ${instituicao['E-mail de contato'] ? `
        <div class="modal-field">
            <label>E-mail de contato:</label>
            <div class="value">
                <a href="mailto:${instituicao['E-mail de contato']}">${instituicao['E-mail de contato']}</a>
            </div>
        </div>
        ` : ''}
        
        ${instituicao['Abreviatura da Instituição'] ? `
        <div class="modal-field">
            <label>Abreviatura:</label>
            <div class="value">${instituicao['Abreviatura da Instituição']}</div>
        </div>
        ` : ''}
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Fechar modal
function closeModal() {
    document.getElementById('institution-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
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
    alert(message); // Em produção, usar um toast ou modal mais elegante
}

// Funções para footer
function showAbout() {
    alert('Painel de Instituições de Ciência, Tecnologia e Inovação do Rio Grande do Sul\n\nEste painel permite visualizar e consultar informações sobre instituições de CT&I localizadas no estado do Rio Grande do Sul.');
}

function showContact() {
    alert('Para mais informações ou sugestões, entre em contato através do GitHub do projeto.');
}

// Tornar funções globais para uso nos event handlers inline
window.showInstitutionDetails = showInstitutionDetails;
window.closeModal = closeModal;
window.showAbout = showAbout;
window.showContact = showContact;

