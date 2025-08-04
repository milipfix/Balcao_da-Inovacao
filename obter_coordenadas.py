import json
import requests
import time
from collections import defaultdict

def obter_coordenadas_cidade(cidade, estado="RS"):
    """Obtém coordenadas lat/lng de uma cidade usando API de geocodificação"""
    
    # Usar Nominatim (OpenStreetMap) - gratuito e sem necessidade de API key
    base_url = "https://nominatim.openstreetmap.org/search"
    
    # Preparar query
    query = f"{cidade}, {estado}, Brasil"
    
    params = {
        'q': query,
        'format': 'json',
        'limit': 1,
        'countrycodes': 'br'
    }
    
    headers = {
        'User-Agent': 'Painel-Instituicoes-RS/1.0 (contato@exemplo.com)'
    }
    
    try:
        response = requests.get(base_url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data and len(data) > 0:
            result = data[0]
            lat = float(result['lat'])
            lng = float(result['lon'])
            
            print(f"✅ {cidade}: {lat}, {lng}")
            return lat, lng
        else:
            print(f"❌ {cidade}: Não encontrada")
            return None, None
            
    except Exception as e:
        print(f"❌ {cidade}: Erro - {e}")
        return None, None

def processar_coordenadas():
    """Processa todas as cidades e obtém suas coordenadas"""
    
    # Carregar dados das instituições
    with open('/home/ubuntu/instituicoes_data.json', 'r', encoding='utf-8') as f:
        instituicoes = json.load(f)
    
    # Obter lista única de cidades
    cidades_unicas = set()
    for inst in instituicoes:
        cidade = inst.get('Cidade', '').strip()
        if cidade:
            cidades_unicas.add(cidade)
    
    print(f"Processando coordenadas para {len(cidades_unicas)} cidades únicas...")
    
    # Dicionário para armazenar coordenadas
    coordenadas_cidades = {}
    
    # Processar cada cidade
    for i, cidade in enumerate(sorted(cidades_unicas)):
        print(f"\n[{i+1}/{len(cidades_unicas)}] Processando: {cidade}")
        
        lat, lng = obter_coordenadas_cidade(cidade)
        
        if lat is not None and lng is not None:
            coordenadas_cidades[cidade] = {
                'lat': lat,
                'lng': lng,
                'status': 'encontrada'
            }
        else:
            coordenadas_cidades[cidade] = {
                'lat': None,
                'lng': None,
                'status': 'nao_encontrada'
            }
        
        # Pausa para respeitar rate limit da API
        time.sleep(1)
    
    # Salvar coordenadas
    with open('/home/ubuntu/coordenadas_cidades.json', 'w', encoding='utf-8') as f:
        json.dump(coordenadas_cidades, f, ensure_ascii=False, indent=2)
    
    # Criar dados finais combinando instituições com coordenadas
    dados_finais = []
    
    for inst in instituicoes:
        cidade = inst.get('Cidade', '').strip()
        
        # Copiar dados da instituição
        dados_inst = dict(inst)
        
        # Adicionar coordenadas se disponíveis
        if cidade in coordenadas_cidades:
            coords = coordenadas_cidades[cidade]
            dados_inst['latitude'] = coords['lat']
            dados_inst['longitude'] = coords['lng']
            dados_inst['coordenadas_status'] = coords['status']
        else:
            dados_inst['latitude'] = None
            dados_inst['longitude'] = None
            dados_inst['coordenadas_status'] = 'nao_processada'
        
        dados_finais.append(dados_inst)
    
    # Salvar dados finais
    with open('/home/ubuntu/instituicoes_com_coordenadas.json', 'w', encoding='utf-8') as f:
        json.dump(dados_finais, f, ensure_ascii=False, indent=2)
    
    # Relatório
    total_cidades = len(cidades_unicas)
    cidades_encontradas = len([c for c in coordenadas_cidades.values() if c['status'] == 'encontrada'])
    
    print(f"\n=== RELATÓRIO DE COORDENADAS ===")
    print(f"Total de cidades: {total_cidades}")
    print(f"Coordenadas encontradas: {cidades_encontradas}")
    print(f"Coordenadas não encontradas: {total_cidades - cidades_encontradas}")
    print(f"Taxa de sucesso: {cidades_encontradas/total_cidades*100:.1f}%")
    
    # Mostrar cidades não encontradas
    nao_encontradas = [cidade for cidade, coords in coordenadas_cidades.items() 
                      if coords['status'] == 'nao_encontrada']
    
    if nao_encontradas:
        print(f"\nCidades não encontradas:")
        for cidade in nao_encontradas:
            print(f"- {cidade}")

if __name__ == "__main__":
    processar_coordenadas()

