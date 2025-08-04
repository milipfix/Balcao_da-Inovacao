import pandas as pd
import json

# Ler o arquivo Excel
df = pd.read_excel('/home/ubuntu/upload/BI_instituicoes_com_emails_confirmados.xlsx')

# Mostrar informações básicas sobre o dataset
print("=== INFORMAÇÕES DO DATASET ===")
print(f"Número de linhas: {len(df)}")
print(f"Número de colunas: {len(df.columns)}")
print("\n=== COLUNAS DISPONÍVEIS ===")
for i, col in enumerate(df.columns):
    print(f"{i}: {col}")

print("\n=== PRIMEIRAS 5 LINHAS ===")
print(df.head())

print("\n=== INFORMAÇÕES SOBRE VALORES NULOS ===")
print(df.isnull().sum())

# Salvar dados em formato JSON para facilitar o trabalho posterior
df_clean = df.fillna('')  # Substituir NaN por string vazia
data_dict = df_clean.to_dict('records')

with open('/home/ubuntu/instituicoes_data.json', 'w', encoding='utf-8') as f:
    json.dump(data_dict, f, ensure_ascii=False, indent=2)

print(f"\n=== DADOS SALVOS ===")
print("Arquivo JSON criado: /home/ubuntu/instituicoes_data.json")

# Verificar quais instituições têm sites mas não têm emails
if 'Site' in df.columns or 'site' in df.columns or any('site' in col.lower() for col in df.columns):
    site_col = None
    email_col = None
    
    for col in df.columns:
        if 'site' in col.lower():
            site_col = col
        if 'email' in col.lower() or 'e-mail' in col.lower():
            email_col = col
    
    if site_col and email_col:
        sem_email = df[(df[site_col].notna()) & (df[site_col] != '') & 
                      ((df[email_col].isna()) | (df[email_col] == ''))]
        print(f"\n=== INSTITUIÇÕES COM SITE MAS SEM EMAIL ===")
        print(f"Total: {len(sem_email)}")
        if len(sem_email) > 0:
            print("Primeiras 10:")
            for idx, row in sem_email.head(10).iterrows():
                nome = row.get('Nome', row.get('nome', 'N/A'))
                site = row[site_col]
                print(f"- {nome}: {site}")

