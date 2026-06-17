# PDE Solver Studio

Interface gráfica desktop (WebView) interativa para construir, simular e analisar Sistemas de Equações Diferenciais Parciais (PDEs) com suporte a 1D, 2D, temas (claro/escuro) e importação/exportação de dados.

## Requisitos de Sistema

* Python >= 3.9
* Node.js >= 18 (para compilar o frontend)
* resolvedor `pdesolver` instalado no ambiente Python

---

## Executando em Desenvolvimento

Para rodar o estúdio em modo de desenvolvimento (com live reload do frontend e backend):

1. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Isso iniciará o servidor de desenvolvimento do Vite em `http://localhost:5173`.

2. **Backend:**
   Abra outro terminal no diretório do projeto e defina a variável `DEV=1` para conectar ao servidor do Vite:
   ```bash
   # Windows (PowerShell)
   $env:DEV="1"
   python backend/main.py

   # macOS / Linux
   DEV=1 python backend/main.py
   ```

3. **Modo Web Alternativo (FastAPI):**
   Se preferir testar a API web em vez da janela desktop:
   ```bash
   python backend.py
   ```

---

## Compilando o Executável Localmente

Para gerar um binário executável único (`.exe` no Windows, `.app` no macOS ou binário nativo no Linux):

1. Instale o PyInstaller no seu ambiente Python:
   ```bash
   pip install pyinstaller pywebview fastapi uvicorn openpyxl
   ```
2. Execute o script de automação de build:
   ```bash
   python build_studio.py
   ```
3. O executável compilado final estará disponível no diretório `studio/dist/`.

---

## Automação de Build com GitHub Actions

O repositório já inclui um fluxo de trabalho do GitHub Actions configurado para compilar executáveis de Windows, macOS e Linux automaticamente a cada nova Release ou Tag gerada no GitHub.

Os executáveis de cada plataforma são anexados diretamente na página de Releases do repositório para download instantâneo do usuário final.
