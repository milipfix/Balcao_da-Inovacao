import json
import requests
from bs4 import BeautifulSoup
import re
import time
from urllib.parse import urljoin

def extrair_emails_do_texto(texto):
    """Extrai emails válidos de um texto usando regex"""
    padrao_email = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(padrao_email, texto)
    
    emails_validos = []
    for email in emails:
        if not any(ext in email.lower() for ext in ['.jpg', '.png', '.gif', '.pdf', '.doc']):
            emails_validos.append(email.lower())
    
    return list(set(emails_validos))

def buscar_emails_no_site(url, timeout=10):
    """Busca emails em um site específico"""
    emails_encontrados = []
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        print(f"Acessando: {url}")
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        texto_pagina = soup.get_text()
        emails_encontrados.extend(extrair_emails_do_texto(texto_pagina))
        
        # Buscar links de contato
        links_contato = []
        for link in soup.find_all('a', href=True):
            href = link['href'].lower()
            texto_link = link.get_text().lower()
            
            if any(palavra in href or palavra in texto_link for palavra in 
                   ['contato', 'contact', 'fale', 'sobre', 'about']):
                url_completa = urljoin(url, link['href'])
                links_contato.append(url_completa)
        
        print(f"Links de contato encontrados: {len(links_contato)}")
        
        # Visitar primeira página de contato
        if links_contato:
            try:
                link_contato = links_contato[0]
                print(f"Visitando página de contato: {link_contato}")
                response_contato = requests.get(link_contato, headers=headers, timeout=timeout)
                response_contato.raise_for_status()
                
                soup_contato = BeautifulSoup(response_contato.content, 'html.parser')
                texto_contato = soup_contato.get_text()
                emails_contato = extrair_emails_do_texto(texto_contato)
                emails_encontrados.extend(emails_contato)
                
            except Exception as e:
                print(f"Erro ao acessar página de contato: {e}")
        
        return list(set(emails_encontrados))
        
    except Exception as e:
        print(f"Erro ao acessar {url}: {e}")
        return []

# Testar com algumas instituições
with open('/home/ubuntu/instituicoes_data.json', 'r', encoding='utf-8') as f:
    instituicoes = json.load(f)

# Pegar primeiras 5 instituições sem email
sem_email = []
for inst in instituicoes:
    email_atual = inst.get('E-mail de contato', '').strip()
    site = inst.get('Site', '').strip()
    
    if site and not email_atual:
        sem_email.append(inst)

print(f"Testando com as primeiras 5 de {len(sem_email)} instituições sem email...")

for i, instituicao in enumerate(sem_email[:5]):
    nome = instituicao.get('Nome da Instituição/Tipo', 'N/A')
    site = instituicao.get('Site', '')
    
    print(f"\n=== TESTE {i+1}/5 ===")
    print(f"Nome: {nome}")
    print(f"Site: {site}")
    
    emails = buscar_emails_no_site(site)
    
    if emails:
        print(f"✅ Emails encontrados: {', '.join(emails)}")
    else:
        print("❌ Nenhum email encontrado")
    
    time.sleep(3)  # Pausa entre testes

