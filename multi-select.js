// Variáveis globais para filtros múltiplos
let selectedFilters = {
    tipo: [],
    setor: [],
    estado: []
};

// Função para alternar dropdown de seleção múltipla
function toggleMultiSelect(filterType) {
    const dropdown = document.getElementById(`${filterType}-dropdown`);
    const header = dropdown.previousElementSibling;
    
    // Fechar outros dropdowns
    ['tipo', 'setor', 'estado'].forEach(type => {
        if (type !== filterType) {
            const otherDropdown = document.getElementById(`${type}-dropdown`);
            const otherHeader = otherDropdown.previousElementSibling;
            otherDropdown.classList.remove('show');
            otherHeader.classList.remove('active');
        }
    });
    
    // Alternar dropdown atual
    dropdown.classList.toggle('show');
    header.classList.toggle('active');
}

// Função para alternar "Todos"
function toggleSelectAll(filterType) {
    const allCheckbox = document.getElementById(`${filterType}-all`);
    const optionsContainer = document.getElementById(`${filterType}-options`);
    const checkboxes = optionsContainer.querySelectorAll('input[type="checkbox"]');
    
    if (allCheckbox.checked) {
        // Desmarcar todos os outros
        checkboxes.forEach(cb => cb.checked = false);
        selectedFilters[filterType] = [];
    } else {
        // Se desmarcou "Todos", não fazer nada especial
    }
    
    updateSelectedText(filterType);
    applyFilters();
}

// Função para alternar opção individual
function toggleOption(filterType, value) {
    const allCheckbox = document.getElementById(`${filterType}-all`);
    const checkbox = document.querySelector(`input[data-filter="${filterType}"][data-value="${value}"]`);
    
    if (checkbox.checked) {
        // Adicionar à seleção
        if (!selectedFilters[filterType].includes(value)) {
            selectedFilters[filterType].push(value);
        }
        // Desmarcar "Todos"
        allCheckbox.checked = false;
    } else {
        // Remover da seleção
        selectedFilters[filterType] = selectedFilters[filterType].filter(v => v !== value);
        
        // Se não há nada selecionado, marcar "Todos"
        if (selectedFilters[filterType].length === 0) {
            allCheckbox.checked = true;
        }
    }
    
    updateSelectedText(filterType);
    applyFilters();
}

// Atualizar texto do header
function updateSelectedText(filterType) {
    const selectedSpan = document.getElementById(`${filterType}-selected`);
    const allCheckbox = document.getElementById(`${filterType}-all`);
    
    if (allCheckbox.checked || selectedFilters[filterType].length === 0) {
        selectedSpan.textContent = `Todos os ${filterType}s`;
    } else if (selectedFilters[filterType].length === 1) {
        selectedSpan.textContent = selectedFilters[filterType][0];
    } else {
        selectedSpan.textContent = `${selectedFilters[filterType].length} selecionados`;
    }
}

// Popular opções de filtro múltiplo
function populateMultiSelectOptions(filterType, options) {
    const container = document.getElementById(`${filterType}-options`);
    container.innerHTML = '';
    
    options.forEach(option => {
        const div = document.createElement('div');
        div.className = 'multi-select-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${filterType}-${option.replace(/\s+/g, '-').toLowerCase()}`;
        checkbox.setAttribute('data-filter', filterType);
        checkbox.setAttribute('data-value', option);
        checkbox.onchange = () => toggleOption(filterType, option);
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = option;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });
}

// Fechar dropdowns ao clicar fora
document.addEventListener('click', function(e) {
    if (!e.target.closest('.multi-select-container')) {
        ['tipo', 'setor', 'estado'].forEach(type => {
            const dropdown = document.getElementById(`${type}-dropdown`);
            const header = dropdown.previousElementSibling;
            dropdown.classList.remove('show');
            header.classList.remove('active');
        });
    }
});

// Resetar filtros múltiplos
function resetMultiSelectFilters() {
    selectedFilters = {
        tipo: [],
        setor: [],
        estado: []
    };
    
    // Marcar todos os "Todos"
    ['tipo', 'setor', 'estado'].forEach(type => {
        const allCheckbox = document.getElementById(`${type}-all`);
        if (allCheckbox) allCheckbox.checked = true;
        
        // Desmarcar todas as opções
        const optionsContainer = document.getElementById(`${type}-options`);
        const checkboxes = optionsContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
        
        // Atualizar texto
        updateSelectedText(type);
        
        // Fechar dropdown
        const dropdown = document.getElementById(`${type}-dropdown`);
        const header = dropdown.previousElementSibling;
        dropdown.classList.remove('show');
        header.classList.remove('active');
    });
}

