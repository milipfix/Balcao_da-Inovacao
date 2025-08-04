# Painel de Instituições de CT&I - Rio Grande do Sul

Um painel interativo para consulta de instituições de Ciência, Tecnologia e Inovação do estado do Rio Grande do Sul, desenvolvido para deploy via GitHub Pages.

## 🎯 Funcionalidades

- **Mapa Interativo**: Visualização das instituições em um mapa do Rio Grande do Sul usando Leaflet.js
- **Busca Avançada**: Campo de busca por nome, tipo ou cidade
- **Filtros**: Filtros por tipo de instituição e cidade
- **Detalhes Completos**: Modal com informações detalhadas de cada instituição
- **Design Responsivo**: Interface adaptável para desktop e dispositivos móveis
- **Marcadores Categorizados**: Diferentes cores para diferentes tipos de instituições

## 🗂️ Estrutura do Projeto

```
painel-instituicoes-rs/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # JavaScript com toda a funcionalidade
├── data.json           # Dados das instituições com coordenadas
└── README.md           # Documentação
```

## 🚀 Como Usar

### Deploy Local

1. Clone ou baixe os arquivos do projeto
2. Abra o arquivo `index.html` em um navegador web
3. O site carregará automaticamente os dados e exibirá o mapa

### Deploy no GitHub Pages

1. Faça upload dos arquivos para um repositório no GitHub
2. Ative o GitHub Pages nas configurações do repositório
3. Selecione a branch principal como fonte
4. O site estará disponível em `https://seu-usuario.github.io/nome-do-repositorio`

## 📊 Dados

O projeto inclui dados de **186 instituições de CT&I do Rio Grande do Sul** com as seguintes informações:

- Nome completo da instituição
- Tipo/Setor (ICT, Parque Tecnológico, Embrapii, etc.)
- Cidade e coordenadas geográficas precisas
- Site oficial
- E-mail de contato (quando disponível)
- Abreviatura da instituição

### Estatísticas:
- **186 instituições** mapeadas
- **99 cidades** do Rio Grande do Sul
- **Coordenadas geográficas** precisas para todas as instituições
- **Nomes completos** de todas as instituições

## 🎨 Design

- **Cores**: Paleta moderna com azul primário (#2563eb) e cores complementares
- **Tipografia**: Inter font para melhor legibilidade
- **Layout**: Grid responsivo com mapa e lista lateral
- **Interações**: Hover states, transições suaves e micro-interações

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos com CSS Grid e Flexbox
- **JavaScript ES6+**: Funcionalidade interativa
- **Leaflet.js**: Biblioteca de mapas interativos
- **OpenStreetMap**: Tiles do mapa
- **Font Awesome**: Ícones
- **Google Fonts**: Tipografia (Inter)

## 📱 Responsividade

O site é totalmente responsivo e se adapta a diferentes tamanhos de tela:

- **Desktop**: Layout com mapa e lista lado a lado
- **Tablet**: Layout adaptado com elementos empilhados
- **Mobile**: Interface otimizada para toque com navegação simplificada

## 🔍 Funcionalidades de Busca e Filtro

### Busca
- Busca em tempo real por nome, tipo ou cidade
- Destaque visual dos resultados
- Botão para limpar busca

### Filtros
- Filtro por tipo de instituição
- Filtro por cidade
- Botão para resetar todos os filtros
- Combinação de múltiplos filtros

### Interações do Mapa
- Marcadores clicáveis com popups informativos
- Zoom automático ao selecionar instituição
- Legenda com cores por categoria
- Bounds limitados ao Rio Grande do Sul

## 📈 Estatísticas

O painel exibe estatísticas em tempo real:
- Total de instituições cadastradas
- Número de cidades com instituições
- Contador de resultados filtrados

## 🎯 Casos de Uso

- **Pesquisadores**: Encontrar instituições para parcerias
- **Empresas**: Localizar centros de inovação próximos
- **Estudantes**: Descobrir oportunidades acadêmicas
- **Gestores Públicos**: Mapear ecossistema de CT&I regional

## 🔧 Personalização

Para adaptar o projeto para outros estados ou regiões:

1. Substitua o arquivo `data.json` com novos dados
2. Ajuste as coordenadas do centro e bounds no `script.js`
3. Modifique as cores e estilos no `styles.css` conforme necessário
4. Atualize os textos e títulos no `index.html`

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais e não comerciais.

## 🤝 Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📞 Contato

Para dúvidas ou sugestões sobre o projeto, abra uma issue no repositório do GitHub.

---

Desenvolvido com ❤️ para o ecossistema de Ciência, Tecnologia e Inovação do Rio Grande do Sul.

