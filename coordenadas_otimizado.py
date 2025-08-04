import json
import requests
import time

def obter_coordenadas_cidade(cidade, estado="RS"):
    """Obtém coordenadas lat/lng de uma cidade usando API de geocodificação"""
    
    base_url = "https://nominatim.openstreetmap.org/search"
    query = f"{cidade}, {estado}, Brasil"
    
    params = {
        'q': query,
        'format': 'json',
        'limit': 1,
        'countrycodes': 'br'
    }
    
    headers = {
        'User-Agent': 'Painel-Instituicoes-RS/1.0'
    }
    
    try:
        response = requests.get(base_url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data and len(data) > 0:
            result = data[0]
            lat = float(result['lat'])
            lng = float(result['lon'])
            return lat, lng
        else:
            return None, None
            
    except Exception as e:
        print(f"Erro ao buscar {cidade}: {e}")
        return None, None

def processar_coordenadas_rs():
    """Processa coordenadas focando no RS"""
    
    # Carregar dados das instituições
    with open('/home/ubuntu/instituicoes_data.json', 'r', encoding='utf-8') as f:
        instituicoes = json.load(f)
    
    # Filtrar apenas instituições do RS
    instituicoes_rs = [inst for inst in instituicoes if inst.get('Estado', '').strip() == 'RS']
    
    print(f"Processando {len(instituicoes_rs)} instituições do RS...")
    
    # Obter cidades únicas do RS
    cidades_rs = set()
    for inst in instituicoes_rs:
        cidade = inst.get('Cidade', '').strip()
        if cidade and not any(estado in cidade for estado in ['/SP', '/RJ', '/MG', '/PR', '/SC', '/PA', '/CE', '/GO', '/DF', '/PB', '/RN', '/AL', '/MS']):
            # Limpar nome da cidade
            cidade_limpa = cidade.replace('/RS', '').strip()
            cidades_rs.add(cidade_limpa)
    
    print(f"Cidades únicas do RS: {len(cidades_rs)}")
    
    # Coordenadas conhecidas para acelerar
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
        'Guaíba': (-30.1131, -51.3294)
    }
    
    coordenadas_cidades = {}
    
    # Usar coordenadas conhecidas primeiro
    for cidade in cidades_rs:
        if cidade in coordenadas_conhecidas:
            lat, lng = coordenadas_conhecidas[cidade]
            coordenadas_cidades[cidade] = {
                'lat': lat,
                'lng': lng,
                'status': 'conhecida'
            }
            print(f"✅ {cidade}: {lat}, {lng} (conhecida)")
        else:
            # Buscar na API
            print(f"Buscando: {cidade}")
            lat, lng = obter_coordenadas_cidade(cidade)
            
            if lat is not None and lng is not None:
                coordenadas_cidades[cidade] = {
                    'lat': lat,
                    'lng': lng,
                    'status': 'encontrada'
                }
                print(f"✅ {cidade}: {lat}, {lng}")
            else:
                # Usar coordenada padrão do centro do RS
                coordenadas_cidades[cidade] = {
                    'lat': -29.5,
                    'lng': -53.0,
                    'status': 'padrao_rs'
                }
                print(f"⚠️ {cidade}: Usando coordenada padrão do RS")
            
            time.sleep(0.5)  # Rate limit menor
    
    # Criar dados finais
    dados_finais = []
    
    for inst in instituicoes:
        cidade_original = inst.get('Cidade', '').strip()
        estado = inst.get('Estado', '').strip()
        
        # Copiar dados da instituição
        dados_inst = dict(inst)
        
        if estado == 'RS':
            # Limpar nome da cidade
            cidade_limpa = cidade_original.replace('/RS', '').strip()
            
            if cidade_limpa in coordenadas_cidades:
                coords = coordenadas_cidades[cidade_limpa]
                dados_inst['latitude'] = coords['lat']
                dados_inst['longitude'] = coords['lng']
                dados_inst['coordenadas_status'] = coords['status']
            else:
                # Coordenada padrão do RS
                dados_inst['latitude'] = -29.5
                dados_inst['longitude'] = -53.0
                dados_inst['coordenadas_status'] = 'padrao_rs'
        else:
            # Para outros estados, não incluir no mapa (foco no RS)
            dados_inst['latitude'] = None
            dados_inst['longitude'] = None
            dados_inst['coordenadas_status'] = 'fora_rs'
        
        dados_finais.append(dados_inst)
    
    # Salvar resultados
    with open('/home/ubuntu/coordenadas_cidades.json', 'w', encoding='utf-8') as f:
        json.dump(coordenadas_cidades, f, ensure_ascii=False, indent=2)
    
    with open('/home/ubuntu/instituicoes_com_coordenadas.json', 'w', encoding='utf-8') as f:
        json.dump(dados_finais, f, ensure_ascii=False, indent=2)
    
    # Relatório
    total_rs = len([d for d in dados_finais if d.get('Estado') == 'RS'])
    com_coords = len([d for d in dados_finais if d.get('latitude') is not None])
    
    print(f"\n=== RELATÓRIO ===")
    print(f"Total de instituições: {len(dados_finais)}")
    print(f"Instituições do RS: {total_rs}")
    print(f"Com coordenadas: {com_coords}")
    print(f"Cidades únicas do RS processadas: {len(coordenadas_cidades)}")

if __name__ == "__main__":
    processar_coordenadas_rs()

