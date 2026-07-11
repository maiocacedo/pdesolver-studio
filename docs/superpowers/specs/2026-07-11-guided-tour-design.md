# Especificação de Design: Tour Guiado (Tutorial Interativo)

Este documento descreve a arquitetura de software e a interface do usuário para o Tour Guiado do PDESsolver Studio, atualizado conforme a nova interface consolidada da barra lateral.

## Objetivo
Fornecer um tutorial interativo passo a passo na primeira inicialização do aplicativo (com opção de acionamento manual) para guiar estudantes de matemática através dos recursos do software, utilizando realces visuais da interface (backdrop e spotlight) e explicações físicas/matemáticas claras.

---

## Estrutura Atual da Interface da Barra Lateral
A barra lateral foi consolidada em apenas **dois cards colapsáveis principais**:
1. **Card 1: Equations (`step="1"`)**: Contém a seleção de funções do sistema, o construtor visual de equações (EquationBuilder), a entrada simbólica da Condição Inicial (IC) com renderizador LaTeX e as abas para configuração das Condições de Contorno (BC) físicas (Oeste, Leste, Norte, Sul com tipos Dirichlet, Neumann e Robin).
2. **Card 2: Numeric (`step="2"`)**: Contém os limites do domínio espacial ($x$ e $y$) e temporal ($t$), a densidade da malha (sliders de $n_x$ e $n_y$), o método de discretização espacial (backward, central, forward), o método de integração no tempo (BDF-2, CN, RKF) e o slider de passos de tempo ($n_t$), além do botão para "Apenas Discretizar".

---

## Fluxo do Tutorial (Passos Atualizados)

1. **Definição do Sistema de EDPs (Barra Lateral - Card 1: "Equations")**
   - **Destaque:** Primeiro card de configurações da barra lateral.
   - **Descrição:** Aqui você define a equação diferencial parcial (EDP) a ser resolvida (via Construtor Visual), a Condição Inicial ($u(x,0)$) e as Condições de Contorno físicas nas bordas (como extremidades presas ou isoladas).

2. **Parâmetros Numéricos (Barra Lateral - Card 2: "Numeric")**
   - **Destaque:** Segundo card de configurações da barra lateral.
   - **Descrição:** Onde definimos os limites físicos do domínio espacial/temporal e a densidade da malha numérica ($n_x$, $n_t$). O passo de tempo discreto ($\Delta t$) e espacial ($\Delta x$) são calculados automaticamente para o solver.

3. **Execução do Solver (Toolbar - Botão "Run")**
   - **Destaque:** Botão "▶ Run" no menu de ferramentas superior.
   - **Descrição:** Executa a integração temporal. O estúdio envia o sistema para o solver em Python, discretiza as derivadas e calcula a evolução temporal da onda.

4. **Gráfico de Perfil 1D (Painel Central - Aba 1D)**
   - **Efeito:** Força a ativação da aba "Perfil 1D" (`vizTab: "plot1d"`).
   - **Destaque:** A área central do gráfico de linha.
   - **Descrição:** Mostra a amplitude vertical $u(x)$ da onda ao longo da corda física em um determinado instante. Use o slider temporal inferior para ver a onda viajar e refletir.

5. **Evolução em Mapa de Calor (Painel Central - Aba Heatmap)**
   - **Efeito:** Força a ativação da aba "Mapa de Calor" (`vizTab: "heatmap"`).
   - **Destaque:** Área central do heatmap espaço-temporal.
   - **Descrição:** Exibe todo o histórico da simulação em uma imagem plana. O eixo vertical representa o espaço $x$ e o horizontal o tempo $t$. A intensidade da cor representa o valor de $u(x, t)$ em cada ponto.

6. **Superfície 3D e Mudança de Conceito (Painel Central - Aba 3D)**
   - **Efeito:** Força a ativação da aba "Superfície 3D" (`vizTab: "plot3d"`).
   - **Destaque:** O canvas 3D.
   - **Descrição:** Explica a mudança de significado físico dependendo da dimensão do problema:
     - *Em problemas 1D:* A superfície 3D representa o gráfico espaço-tempo $u(x, t)$, onde a altura é a amplitude, o eixo X é o espaço e o eixo Y é o tempo (mostrando o histórico completo como um relevo).
     - *Em problemas 2D:* A superfície representa $u(x, y)$ em um único instante, mostrando o relevo espacial da onda (como as oscilações na superfície da água).

7. **Painel de Multivisualização (Grid View)**
   - **Efeito:** Altera o `layoutMode` para `"grid"` e reseta maximizações.
   - **Destaque:** A grade com os múltiplos painéis lado a lado.
   - **Descrição:** Permite visualizar de forma simultânea o perfil da onda, o mapa de calor espaço-tempo, o relevo 3D e o console de estatísticas da simulação em uma única tela.

8. **O Inspetor de Resultados (Painel Direito)**
   - **Efeito:** Força `showInspector` para `true` e destaca o painel direito.
   - **Destaque:** Painel lateral do Inspetor.
   - **Descrição:** Apresenta 4 seções cruciais:
     - *Problem:* A EDP e contornos matemáticos compilados para execução.
     - *Mesh & CFL:* Onde monitoramos o número de estabilidade de Courant-Friedrichs-Lewy (CFL). Se CFL > 0.5, esquemas numéricos explícitos podem explodir!
     - *Solver:* Métodos de discretização espacial e integrador temporal em uso.
     - *Last result:* Mínimos, máximos e convergência da malha calculada.

9. **Barra de Ferramentas e Exportação (Toolbar - Demais Botões)**
   - **Destaque:** Botões "Open", "Save" e "Export" no topo.
   - **Descrição:** Facilita salvar/carregar presets completos de PDEs em JSON, exportar tabelas numéricas formatadas em CSV para análise em outros softwares (como Matlab ou Python) e salvar fotos em PNG dos gráficos.

---

## Design de UI/UX (Estilo Glassmorphic)

### 1. Spotlight (Destaque do Elemento)
O elemento ativo será realçado dinamicamente usando uma máscara de sombra de CSS.
- **Efeito Visual:** Uma borda iluminada na cor de destaque ativa (`var(--accent)`) com um sombreamento escuro e opaco (`rgba(10, 11, 18, 0.7)`) cobrindo o restante da tela.
- **Seletores CSS para Spotlight:**
  1. *Equations Card:* `.studio-sidebar .card:nth-of-type(1)`
  2. *Numeric Card:* `.studio-sidebar .card:nth-of-type(2)`
  3. *Run Button:* `.toolbar button[title*="Run"]`
  4. *Main Tab View:* `.viz-stage`
  5. *Heatmap View:* `.viz-stage`
  6. *3D View:* `.viz-stage`
  7. *Grid Layout:* `.viz-grid-layout`
  8. *Inspector:* `.inspector`
  9. *Toolbar Operations:* `.toolbar`

### 2. Pop-up Glassmorphic
Posicionado adjacente ao elemento destacado.
- **Estilos Glassmorphic:**
  ```css
  .tour-popup {
    position: fixed;
    z-index: 9999;
    width: 320px;
    background: rgba(26, 29, 39, 0.82);
    backdrop-filter: blur(12px) saturate(140%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--r-3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  }
  ```
- **Navegação do Footer:**
  - Canto inferior esquerdo: botão "Pular".
  - Centro: bolinhas indicadoras de paginação e contador (ex: "Passo 3 de 9").
  - Canto inferior direito: botão "Seguir" (ou "Finalizar" no passo 9).

---

## Especificação Técnica (Arquitetura)

### 1. Estado no Zustand (`store.ts`)
Campos adicionados na fatia `ui`:
- `tourActive: boolean` (default: `false` para ser ativado no primeiro mount).
- `tourStep: number` (default: `0`).
- Ações: `startTour()`, `endTour()`, `nextTourStep()`, `prevTourStep()`.

### 2. Novo Preset de Onda 1D (`examples.ts`)
Adição do preset com ID `onda-1d-acoplada` com o seguinte sistema físico:
- **EDPs:**
  1. $\frac{\partial u}{\partial t} = v$
  2. $\frac{\partial v}{\partial t} = 2.25 \frac{\partial^2 u}{\partial x^2} - 0.05 v$ (onde $c = 1.5$ e amortecimento $\gamma = 0.05$).
- **Domínio:** $x \in [0, 1]$, $t \in [0, 1.0]$, malha $nx = 100$, $nt = 300$.
- **Métodos:** Discretização espacial central e integrador Crank-Nicolson (`CN`).

---

## Plano de Verificação Visual e Funcional

1. **Garantia de Não Persistência para Testes:** Assegurar que atualizar a página (`F5` no navegador) reinicialize o tour, permitindo validação rápida.
2. **Adaptabilidade do Spotlight:** Testar o reposicionamento dos realces ao redimensionar a janela do estúdio.
3. **Validação Matemática do Preset 1D:** Rodar o solver no novo preset e checar se todas as visualizações (1D, mapa de calor e 3D) carregam corretamente sem erros numéricos.
