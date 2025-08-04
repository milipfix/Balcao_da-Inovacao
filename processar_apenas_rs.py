import pandas as pd
import json

def processar_apenas_rs():
    """Processa apenas instituições do RS com coordenadas conhecidas"""
    
    print("Carregando dados do Excel...")
    
    # Carregar dados do Excel
    df = pd.read_excel('/home/ubuntu/upload/BI_instituicoes_com_emails_confirmados.xlsx')
    
    print(f"Total de instituições no Excel: {len(df)}")
    
    # Filtrar apenas RS
    df_rs = df[(df['Estado'] == 'RS') | (df['Estado'] == 'Rio Grande do Sul')]
    print(f"Instituições do RS: {len(df_rs)}")
    
    # Coordenadas conhecidas das principais cidades do RS
    coordenadas_conhecidas = {
        'Porto Alegre': (-30.0346, -51.2177),
        'Caxias do Sul': (-29.1685, -51.1796),
        'Pelotas': (-31.7654, -52.3376),
        'Canoas': (-29.9167, -51.1833),
        'Santa Maria': (-29.6842, -53.8069),
        'Gravataí': (-29.9444, -50.9931),
        'Viamão': (-30.0811, -51.0233),
        'Novo Hamburgo': (-29.6783, -51.1306),
        'São Leopoldo': (-29.7603, -51.1472),
        'Rio Grande': (-32.0350, -52.0986),
        'Alvorada': (-29.9897, -51.0839),
        'Passo Fundo': (-28.2636, -52.4069),
        'Sapucaia do Sul': (-29.8439, -51.1456),
        'Uruguaiana': (-29.7547, -57.0883),
        'Santa Cruz do Sul': (-29.7175, -52.4264),
        'Cachoeirinha': (-29.9511, -51.0944),
        'Bagé': (-31.3314, -54.1063),
        'Bento Gonçalves': (-29.1654, -51.5198),
        'Erechim': (-27.6351, -52.2739),
        'Guaíba': (-30.1131, -51.3294),
        'Lajeado': (-29.4672, -51.9624),
        'Santo Ângelo': (-28.3000, -54.2670),
        'Alegrete': (-29.7902, -55.7949),
        'Ijuí': (-28.3879, -53.9202),
        'Cruz Alta': (-28.6451, -53.6058),
        'Carazinho': (-28.2982, -52.7942),
        'Frederico Westphalen': (-27.3571, -53.3964),
        'Horizontina': (-27.6279, -54.3090),
        'Cerro Largo': (-28.1475, -54.7384),
        'Casca': (-28.5653, -51.9769),
        'Farroupilha': (-29.2265, -51.3468),
        'Encantado': (-29.2393, -51.8745),
        'Feliz': (-29.4523, -51.3070),
        'Campo Bom': (-29.6784, -51.0572),
        'Estância Velha': (-29.6530, -51.1720),
        'Esteio': (-29.8512, -51.1779),
        'Charqueadas': (-29.9549, -51.6250),
        'Eldorado do Sul': (-29.9976, -51.3064),
        'Gramado': (-29.3793, -50.8737),
        'Capão da Canoa': (-29.7508, -50.0211),
        'Capão do Leão': (-31.7661, -52.5013),
        'Caçapava do Sul': (-30.5113, -53.4917),
        'Dom Pedrito': (-30.9838, -54.6746),
        'Itaqui': (-29.1222, -56.5551),
        'Jaguari': (-29.4980, -54.6919),
        'Jaguarão': (-32.5663, -53.3766),
        'Júlio de Castilhos': (-29.2287, -53.6825),
        'Lagoa Vermelha': (-28.2087, -51.5275),
        'Guaporé': (-28.8472, -51.8908),
        'Ibirubá': (-28.6302, -53.0961),
        'Camaquã': (-30.8525, -51.8076),
        'Cachoeira do Sul': (-30.0482, -52.8902),
        'São Borja': (-28.6611, -56.0044),
        'Santa Vitória do Palmar': (-33.5186, -53.3675),
        'Restinga Seca': (-29.8167, -53.3833),
        'Panambi': (-28.2925, -53.5019),
        'Três Passos': (-27.4542, -53.9306),
        'Soledade': (-28.8267, -52.5069),
        'Venâncio Aires': (-29.6058, -52.1942),
        'Teutônia': (-29.4533, -51.8069),
        'Estrela': (-29.4950, -51.9644),
        'Arroio do Meio': (-29.4069, -51.9500),
        'Cruzeiro do Sul': (-29.5167, -51.9833),
        'Sobradinho': (-29.4167, -53.0167),
        'São Gabriel': (-30.3378, -54.3194),
        'Santana do Livramento': (-30.8906, -55.5322),
        'Taquara': (-29.6533, -50.7806),
        'São Lourenço do Sul': (-31.3669, -51.9815),
        'Tapes': (-30.6748, -51.3986),
        'Vacaria': (-28.5103, -50.9356),
        'São Luiz Gonzaga': (-28.4075, -54.9609),
        'Sertão': (-27.9854, -52.2576),
        'Sananduva': (-27.9499, -51.8074),
        'Sarandi': (-27.9311, -52.8631),
        'Palmeira das Missões': (-27.9011, -53.3136),
        'Santa Rosa': (-27.8644, -54.4779),
        'Santo Augusto': (-27.8526, -53.7776),
        'Três de Maio': (-27.7799, -54.2357),
        'São Sebastião do Caí': (-29.5912, -51.3779),
        'Torres': (-29.3374, -49.7300)
    }
    
    # Processar cada instituição do RS
    dados_processados = []
    
    for index, row in df_rs.iterrows():
        # Extrair dados básicos
        cidade_original = str(row.get('Cidade', '')).strip()
        estado_original = str(row.get('Estado', '')).strip()
        nome = str(row.get('Nome da Instituição/Tipo', '')).strip()
        abreviatura = str(row.get('Abreviatura da Instituição', '')).strip()
        setor = str(row.get('Setor', '')).strip()
        contato = str(row.get('Contato', '')).strip()
        site = str(row.get('Site', '')).strip()
        email = str(row.get('E-mail de contato', '')).strip()
        
        # Limpar dados vazios
        if nome in ['nan', 'NaN', ''] or pd.isna(nome):
            nome = 'Nome não disponível'
        if abreviatura in ['nan', 'NaN', ''] or pd.isna(abreviatura):
            abreviatura = ''
        if setor in ['nan', 'NaN', ''] or pd.isna(setor):
            setor = 'Outros'
        if contato in ['nan', 'NaN', ''] or pd.isna(contato):
            contato = ''
        if site in ['nan', 'NaN', ''] or pd.isna(site):
            site = ''
        if email in ['nan', 'NaN', ''] or pd.isna(email):
            email = ''
        if cidade_original in ['nan', 'NaN', ''] or pd.isna(cidade_original):
            cidade_original = 'Cidade não informada'
        
        # Normalizar estado
        if estado_original == 'Rio Grande do Sul':
            estado_original = 'RS'
        
        # Processar coordenadas
        lat, lng = None, None
        coordenadas_status = 'nao_encontrada'
        
        if cidade_original != 'Cidade não informada':
            cidade_limpa = cidade_original.replace('/RS', '').strip()
            
            if cidade_limpa in coordenadas_conhecidas:
                lat, lng = coordenadas_conhecidas[cidade_limpa]
                coordenadas_status = 'conhecida'
            else:
                # Usar coordenada padrão do centro do RS
                lat, lng = -29.5, -53.0
                coordenadas_status = 'padrao_rs'
        
        # Criar registro da instituição
        instituicao = {
            'Cidade': cidade_original,
            'Estado': estado_original,
            'Abreviatura da Instituição': abreviatura,
            'Nome da Instituição/Tipo': nome,
            'Setor': setor,
            'Contato': contato,
            'Site': site,
            'E-mail de contato': email,
            'latitude': lat,
            'longitude': lng,
            'coordenadas_status': coordenadas_status
        }
        
        dados_processados.append(instituicao)
        
        print(f"Processado: {nome[:50]}... - {cidade_original}")
    
    # Filtrar apenas com coordenadas válidas
    dados_com_coords = [d for d in dados_processados if d['latitude'] and d['longitude']]
    
    # Salvar dados processados
    with open('/home/ubuntu/dados_rs_completos.json', 'w', encoding='utf-8') as f:
        json.dump(dados_com_coords, f, ensure_ascii=False, indent=2)
    
    # Estatísticas
    print(f"\n=== RELATÓRIO FINAL ===")
    print(f"Total de instituições do RS processadas: {len(dados_processados)}")
    print(f"Instituições do RS com coordenadas: {len(dados_com_coords)}")
    
    # Mostrar algumas instituições como exemplo
    print(f"\n=== EXEMPLOS DE INSTITUIÇÕES ===")
    for i, inst in enumerate(dados_com_coords[:10]):
        print(f"{i+1}. {inst['Nome da Instituição/Tipo']}")
        print(f"   Cidade: {inst['Cidade']}, {inst['Estado']}")
        print(f"   Setor: {inst['Setor']}")
        print(f"   Coordenadas: {inst['latitude']}, {inst['longitude']}")
        print()

if __name__ == "__main__":
    processar_apenas_rs()

