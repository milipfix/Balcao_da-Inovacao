import pandas as pd

def analisar_excel_detalhado():
    """Analisa a estrutura detalhada do Excel"""
    
    print("Carregando Excel...")
    df = pd.read_excel('/home/ubuntu/upload/BI_instituicoes_com_emails_confirmados.xlsx')
    
    print(f"Total de linhas: {len(df)}")
    print(f"Colunas disponíveis: {list(df.columns)}")
    print()
    
    # Mostrar primeiras 10 linhas de todas as colunas
    print("=== PRIMEIRAS 10 LINHAS ===")
    for i in range(min(10, len(df))):
        print(f"\n--- LINHA {i+1} ---")
        for col in df.columns:
            valor = df.iloc[i][col]
            if pd.notna(valor) and str(valor).strip():
                print(f"{col}: {valor}")
    
    # Verificar valores únicos em colunas importantes
    print("\n=== VALORES ÚNICOS ===")
    
    for col in ['Nome da Instituição/Tipo', 'Setor', 'Estado']:
        if col in df.columns:
            valores_unicos = df[col].dropna().unique()
            print(f"\n{col} ({len(valores_unicos)} valores únicos):")
            for valor in sorted(valores_unicos)[:20]:  # Mostrar apenas os primeiros 20
                print(f"  - {valor}")
            if len(valores_unicos) > 20:
                print(f"  ... e mais {len(valores_unicos) - 20} valores")
    
    # Verificar se há outras colunas que podem conter nomes
    print("\n=== ANÁLISE DE COLUNAS PARA NOMES ===")
    for col in df.columns:
        if any(palavra in col.lower() for palavra in ['nome', 'instituição', 'organização', 'empresa']):
            valores_sample = df[col].dropna().head(5).tolist()
            print(f"{col}: {valores_sample}")

if __name__ == "__main__":
    analisar_excel_detalhado()

