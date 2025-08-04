import json
import requests
from bs4 import BeautifulSoup
import re
import time
import csv
from urllib.parse import urljoin, urlparse

def extrair_emails_do_texto(texto):
    """Extrai emails válidos de um texto usando regex"""
    # Padrão regex para emails
    padrao_email = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(padrao_email, texto)
    
    # Filtrar emails válidos (remover imagens, etc.)
    emails_validos = []
    for email in emails:
        if not any(ext in email.lower() for ext in ['.jpg', '.png', '.gif', '.pdf', '.doc']):
            emails_validos.append(email.lower())
    
    return list(set(emails_validos))  # Remover duplicatas

def buscar_emails_no_site(url, timeout=10):
    """Busca emails em um site específico"""
    emails_encontrados = []
    
    try:
        # Configurar headers para parecer um navegador real
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Tentar acessar a página principal
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Buscar emails na página principal
        texto_pagina = soup.get_text()
        emails_encontrados.extend(extrair_emails_do_texto(texto_pagina))
        
        # Buscar links para páginas de contato
        links_contato = []
        for link in soup.find_all('a', href=True):
            href = link['href'].lower()
            texto_link = link.get_text().lower()
            
            if any(palavra in href or palavra in texto_link for palavra in 
                   ['contato', 'contact', 'fale', 'sobre', 'about', 'equipe', 'team']):
                url_completa = urljoin(url, link['href'])
                links_contato.append(url_completa)
        
        # Visitar páginas de contato (máximo 3)
        for link_contato in links_contato[:3]:
            try:
                response_contato = requests.get(link_contato, headers=headers, timeout=timeout)
                response_contato.raise_for_status()
                
                soup_contato = BeautifulSoup(response_contato.content, 'html.parser')
                texto_contato = soup_contato.get_text()
                emails_encontrados.extend(extrair_emails_do_texto(texto_contato))
                
                time.sleep(1)  # Pausa entre requisições
                
            except Exception as e:
                print(f"Erro ao acessar página de contato {link_contato}: {e}")
                continue
        
        # Remover duplicatas e retornar
        return list(set(emails_encontrados))
        
    except Exception as e:
        print(f"Erro ao acessar {url}: {e}")
        return []

def processar_instituicoes():
    """Processa todas as instituições sem email"""
    
    # Carregar dados
    with open('/home/ubuntu/instituicoes_data.json', 'r', encoding='utf-8') as f:
        instituicoes = json.load(f)
    
    # Filtrar instituições sem email
    sem_email = []
    for inst in instituicoes:
        email_atual = inst.get('E-mail de contato', '').strip()
        site = inst.get('Site', '').strip()
        
        if site and not email_atual:
            sem_email.append(inst)
    
    print(f"Processando {len(sem_email)} instituições sem email...")
    
    # Arquivo para salvar resultados
    resultados = []
    
    for i, instituicao in enumerate(sem_email):
        nome = instituicao.get('Nome da Instituição/Tipo', 'N/A')
        site = instituicao.get('Site', '')
        cidade = instituicao.get('Cidade', '')
        
        print(f"\n[{i+1}/{len(sem_email)}] Processando: {nome}")
        print(f"Site: {site}")
        
        emails = buscar_emails_no_site(site)
        
        resultado = {
            'nome': nome,
            'cidade': cidade,
            'site': site,
            'emails_encontrados': emails,
            'status': 'sucesso' if emails else 'sem_email'
        }
        
        resultados.append(resultado)
        
        if emails:
            print(f"✅ Emails encontrados: {', '.join(emails)}")
        else:
            print("❌ Nenhum email encontrado")
        
        # Pausa entre requisições para não sobrecarregar os servidores
        time.sleep(2)
        
        # Salvar progresso a cada 10 instituições
        if (i + 1) % 10 == 0:
            with open('/home/ubuntu/emails_encontrados_temp.json', 'w', encoding='utf-8') as f:
                json.dump(resultados, f, ensure_ascii=False, indent=2)
            print(f"Progresso salvo: {i+1}/{len(sem_email)}")
    
    # Salvar resultados finais
    with open('/home/ubuntu/emails_encontrados.json', 'w', encoding='utf-8') as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)
    
    # Criar relatório
    total_com_email = len([r for r in resultados if r['emails_encontrados']])
    print(f"\n=== RELATÓRIO FINAL ===")
    print(f"Total processado: {len(resultados)}")
    print(f"Com email encontrado: {total_com_email}")
    print(f"Sem email: {len(resultados) - total_com_email}")
    print(f"Taxa de sucesso: {total_com_email/len(resultados)*100:.1f}%")

if __name__ == "__main__":
    processar_instituicoes()

