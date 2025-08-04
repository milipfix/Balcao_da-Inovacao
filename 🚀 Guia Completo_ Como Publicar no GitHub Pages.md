# 🚀 Guia Completo: Como Publicar no GitHub Pages

## Passo 1: Criar Conta no GitHub (se não tiver)
1. Acesse [github.com](https://github.com)
2. Clique em "Sign up" 
3. Crie sua conta gratuita

## Passo 2: Criar Novo Repositório
1. Faça login no GitHub
2. Clique no botão **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Configure o repositório:
   - **Repository name**: `painel-instituicoes-rs` (ou outro nome de sua escolha)
   - **Description**: "Painel interativo de instituições de CT&I do Rio Grande do Sul"
   - Marque como **Public** (necessário para GitHub Pages gratuito)
   - ✅ Marque **"Add a README file"**
5. Clique em **"Create repository"**

## Passo 3: Fazer Upload dos Arquivos

### Opção A: Via Interface Web (Mais Fácil)
1. No seu repositório recém-criado, clique em **"uploading an existing file"**
2. Arraste e solte todos os arquivos do projeto:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `data.json`
   - `README.md`
3. Adicione uma mensagem de commit: "Adicionar painel de instituições"
4. Clique em **"Commit changes"**

### Opção B: Via Git (Para usuários avançados)
```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/painel-instituicoes-rs.git

# Entre na pasta
cd painel-instituicoes-rs

# Copie os arquivos do projeto para esta pasta
# Adicione os arquivos
git add .

# Faça o commit
git commit -m "Adicionar painel de instituições"

# Envie para o GitHub
git push origin main
```

## Passo 4: Ativar GitHub Pages
1. No seu repositório, clique na aba **"Settings"**
2. Role para baixo até encontrar **"Pages"** no menu lateral esquerdo
3. Em **"Source"**, selecione:
   - **Source**: Deploy from a branch
   - **Branch**: main (ou master)
   - **Folder**: / (root)
4. Clique em **"Save"**

## Passo 5: Aguardar Deploy
- O GitHub levará alguns minutos para processar
- Você verá uma mensagem verde quando estiver pronto
- Seu site estará disponível em: `https://SEU-USUARIO.github.io/painel-instituicoes-rs`

## 🎯 Exemplo de URL Final
Se seu usuário GitHub for `joaosilva` e o repositório `painel-instituicoes-rs`, o site ficará em:
```
https://joaosilva.github.io/painel-instituicoes-rs
```

## ⚡ Dicas Importantes

### ✅ Verificações Essenciais:
- [ ] Repositório é **público**
- [ ] Arquivo `index.html` está na raiz do repositório
- [ ] Todos os arquivos foram enviados corretamente
- [ ] GitHub Pages está ativado nas configurações

### 🔄 Atualizações Futuras:
- Qualquer alteração nos arquivos será automaticamente refletida no site
- Pode levar alguns minutos para as mudanças aparecerem

### 🛠️ Solução de Problemas:

**Site não carrega?**
- Verifique se o repositório é público
- Confirme se GitHub Pages está ativado
- Aguarde até 10 minutos após ativar

**Erro 404?**
- Verifique se o arquivo `index.html` está na raiz
- Confirme se o nome do repositório está correto na URL

**Dados não aparecem?**
- Verifique se o arquivo `data.json` foi enviado
- Abra o console do navegador (F12) para ver erros

## 🌟 Recursos Adicionais

### Domínio Personalizado (Opcional):
- Você pode configurar um domínio próprio nas configurações do GitHub Pages
- Exemplo: `www.meupainel.com.br` em vez de `usuario.github.io`

### HTTPS Automático:
- GitHub Pages fornece HTTPS automaticamente
- Seu site será seguro por padrão

### Monitoramento:
- Acesse a aba "Actions" para ver o status dos deploys
- Receba notificações por email sobre problemas

## 📞 Suporte
- [Documentação oficial do GitHub Pages](https://docs.github.com/en/pages)
- [Comunidade GitHub](https://github.community/)

---

🎉 **Parabéns!** Seu painel estará online e acessível para qualquer pessoa na internet!

