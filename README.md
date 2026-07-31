# PDE Solver Studio

Interface gráfica desktop (WebView) interativa para construir, simular e analisar Sistemas de Equações Diferenciais Parciais (PDEs) com suporte a 1D, 2D, temas (claro/escuro) e importação/exportação de dados.

## Requisitos de Sistema

* Python >= 3.9
* Node.js >= 18 (para compilar o frontend)
* resolvedor `pdesolver` instalado no ambiente Python

---

## 🚀 Fluxo de Uso Básico (Passo a Passo)

O PDE Solver Studio foi projetado para um fluxo de trabalho direto, partindo da definição do problema físico até a visualização dos resultados:

1. **Definição das Equações (Equations)**
   * Utilize a barra lateral esquerda (ou abra o menu **File > Open** para iniciar a partir de um exemplo pronto).
   * Insira a equação diferencial desejada (ex: `du/dt = d2u/dx2`), e nomeie as funções que pretende calcular.
   * Defina as **Condições de Contorno** (Oeste, Leste, Norte, Sul) utilizando os tipos (Dirichlet ou Neumann) e as funções respectivas.
   * Adicione a **Condição Inicial (IC)** que descreve o perfil do campo no tempo zero `t=0`.

2. **Configuração de Malha e Domínio (Numeric)**
   * Ainda na barra lateral, desça até a seção "Numérico".
   * Defina os limites espaciais do problema em `[xmin, xmax]` e, se for um problema 2D, `[ymin, ymax]`.
   * Escolha o limite de tempo `tf` da simulação.
   * Defina a resolução da simulação indicando quantos pontos terá a malha espacial (`nx`, `ny`) e temporal (`nt`). O **Inspetor** no menu Exibir (View) irá calcular e te informar do índice numérico de estabilidade (CFL).

3. **Seleção do Solver**
   * Na barra de menus superior, acesse **Solve (Resolver)** para selecionar o método de integração desejado (ex: BDF-2, Crank–Nicolson, RKF com CUDA para equações grandes).

4. **Execução**
   * Clique em **Executar (Run)** ou aperte a tecla `F5`. O painel central indicará o progresso.

5. **Análise Visual**
   * Com a simulação concluída, alterne pelas opções no menu central ou pelo menu **View**:
     * **Perfil 1D**: Análise em linha. No caso 2D, permite "fatiar" o mapa. 
     * **Mapa de Calor (Heatmap)**: Visão top-down com mapeamento em paletas de cores configuráveis (em *Tweaks* no canto inferior direito).
     * **Superfície 3D**: Simulação gráfica tridimensional com visualização rotativa e detalhada utilizando GPU.

6. **Salvar e Exportar**
   * Se desejar manter sua configuração para carregar depois, vá em **File > Save As...** e nomeie o seu modelo. Ele aparecerá na sua Galeria (Menu Open) na guia "Meus Projetos".
   * É possível também **Exportar CSV** com os dados brutos calculados, ou uma imagem (PNG) do gráfico renderizado.

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
