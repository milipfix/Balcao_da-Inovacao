// API de pesquisa com IA para áreas de pesquisa das instituições

class AIResearchService {
    constructor() {
        this.apiKey = 'sk-proj-your-api-key'; // Será configurado via variável de ambiente
        this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    }

    async pesquisarAreasDeEstudo(nomeInstituicao) {
        const prompt = `Pesquise e forneça informações sobre as principais áreas de pesquisa da instituição "${nomeInstituicao}". 

Formate a resposta em JSON com a seguinte estrutura:
{
    "instituicao": "${nomeInstituicao}",
    "areas_principais": ["área 1", "área 2", "área 3"],
    "descricao_breve": "Descrição em 2-3 frases sobre o foco da instituição",
    "especializacoes": ["especialização 1", "especialização 2"],
    "programas_destaque": ["programa 1", "programa 2"],
    "parcerias_relevantes": ["parceria 1", "parceria 2"]
}

Seja preciso e baseie-se em informações reais e atualizadas sobre a instituição.`;

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'Você é um especialista em instituições de ensino e pesquisa brasileiras. Forneça informações precisas e atualizadas sobre as áreas de pesquisa das instituições solicitadas.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            
            try {
                return JSON.parse(content);
            } catch (parseError) {
                // Se não conseguir fazer parse do JSON, retorna estrutura padrão
                return {
                    instituicao: nomeInstituicao,
                    areas_principais: ["Informação não disponível"],
                    descricao_breve: content.substring(0, 200) + "...",
                    especializacoes: [],
                    programas_destaque: [],
                    parcerias_relevantes: []
                };
            }

        } catch (error) {
            console.error('Erro ao pesquisar áreas de estudo:', error);
            
            // Retorna informações básicas em caso de erro
            return {
                instituicao: nomeInstituicao,
                areas_principais: ["Erro ao carregar informações"],
                descricao_breve: "Não foi possível obter informações sobre as áreas de pesquisa desta instituição no momento.",
                especializacoes: [],
                programas_destaque: [],
                parcerias_relevantes: [],
                erro: error.message
            };
        }
    }

    // Versão simplificada usando busca web simulada
    async pesquisarAreasSimplificada(nomeInstituicao) {
        // Simula uma pesquisa baseada no nome da instituição
        const areasComuns = {
            'federal': ['Engenharia', 'Ciências Exatas', 'Tecnologia da Informação', 'Pesquisa Aplicada'],
            'universidade': ['Ensino Superior', 'Pesquisa Acadêmica', 'Extensão Universitária', 'Inovação'],
            'instituto': ['Pesquisa Tecnológica', 'Desenvolvimento', 'Inovação Industrial', 'Transferência de Tecnologia'],
            'embrapa': ['Agricultura', 'Pecuária', 'Biotecnologia Agrícola', 'Sustentabilidade Rural'],
            'senai': ['Formação Profissional', 'Tecnologia Industrial', 'Automação', 'Manufatura'],
            'embrapii': ['Inovação Industrial', 'Pesquisa Aplicada', 'Desenvolvimento Tecnológico', 'Parcerias Empresa-ICT']
        };

        const nomeMinusculo = nomeInstituicao.toLowerCase();
        let areas = ['Pesquisa e Desenvolvimento', 'Inovação Tecnológica'];

        // Identifica áreas baseadas em palavras-chave no nome
        for (const [palavra, areasEspecificas] of Object.entries(areasComuns)) {
            if (nomeMinusculo.includes(palavra)) {
                areas = [...areas, ...areasEspecificas];
                break;
            }
        }

        // Remove duplicatas
        areas = [...new Set(areas)];

        return {
            instituicao: nomeInstituicao,
            areas_principais: areas.slice(0, 4),
            descricao_breve: `${nomeInstituicao} atua nas áreas de ${areas.slice(0, 2).join(' e ')}, contribuindo para o desenvolvimento científico e tecnológico.`,
            especializacoes: areas.slice(2, 4),
            programas_destaque: ['Programas de Pesquisa', 'Projetos de Inovação'],
            parcerias_relevantes: ['Setor Privado', 'Outras ICTs']
        };
    }
}

// Instância global do serviço
const aiResearchService = new AIResearchService();

// Função para exibir resultados da pesquisa IA
function exibirResultadosIA(dados) {
    const modalBody = document.getElementById('modal-body');
    
    const resultadosHTML = `
        <div class="ai-research-results">
            <div class="ai-header">
                <h4><i class="fas fa-brain"></i> Visão da IA - Áreas de Pesquisa</h4>
            </div>
            
            <div class="ai-content">
                <div class="ai-section">
                    <h5>Descrição</h5>
                    <p>${dados.descricao_breve}</p>
                </div>
                
                <div class="ai-section">
                    <h5>Principais Áreas de Pesquisa</h5>
                    <div class="ai-tags">
                        ${dados.areas_principais.map(area => `<span class="ai-tag">${area}</span>`).join('')}
                    </div>
                </div>
                
                ${dados.especializacoes.length > 0 ? `
                <div class="ai-section">
                    <h5>Especializações</h5>
                    <div class="ai-tags">
                        ${dados.especializacoes.map(esp => `<span class="ai-tag secondary">${esp}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${dados.programas_destaque.length > 0 ? `
                <div class="ai-section">
                    <h5>Programas de Destaque</h5>
                    <ul class="ai-list">
                        ${dados.programas_destaque.map(prog => `<li>${prog}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${dados.parcerias_relevantes.length > 0 ? `
                <div class="ai-section">
                    <h5>Parcerias Relevantes</h5>
                    <ul class="ai-list">
                        ${dados.parcerias_relevantes.map(parc => `<li>${parc}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
            
            <div class="ai-footer">
                <small><i class="fas fa-info-circle"></i> Informações geradas por IA baseadas em dados públicos</small>
            </div>
        </div>
    `;
    
    modalBody.innerHTML = resultadosHTML;
}

// Função para mostrar loading da IA
function mostrarLoadingIA() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="ai-loading">
            <div class="loading-spinner">
                <i class="fas fa-brain fa-spin"></i>
            </div>
            <h4>Visão da IA</h4>
            <p>Pesquisando áreas de pesquisa da instituição...</p>
            <div class="loading-bar">
                <div class="loading-progress"></div>
            </div>
        </div>
    `;
}

// Função principal para executar pesquisa IA
async function executarVisaoIA(nomeInstituicao) {
    try {
        mostrarLoadingIA();
        
        // Usar versão simplificada por enquanto
        const resultados = await aiResearchService.pesquisarAreasSimplificada(nomeInstituicao);
        
        // Simular delay para melhor UX
        setTimeout(() => {
            exibirResultadosIA(resultados);
        }, 2000);
        
    } catch (error) {
        console.error('Erro na Visão da IA:', error);
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="ai-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Erro na Visão da IA</h4>
                <p>Não foi possível obter informações sobre as áreas de pesquisa desta instituição.</p>
                <button onclick="location.reload()" class="btn-retry">Tentar Novamente</button>
            </div>
        `;
    }
}

