# Aplicacoes do Projeto

Este repositorio agora contem tres entradas web estaticas:

- `index.html`: pagina inicial para GitHub Pages
- `app.html`: controle de presenca de convidados
- `oab.html`: sistema de simulados interativos OAB com importacao de PDFs

## Entrada para GitHub

O arquivo `index.html` foi preparado como pagina inicial do repositorio no GitHub Pages.

Fluxo esperado:

- abrir a URL principal do GitHub Pages
- clicar em `Abrir sistema OAB` para entrar no simulador
- ou clicar em `Abrir controle de convidados` para acessar o app secundario

## OAB Simulados

Arquivos principais:

- `index.html`: landing page para publicacao no GitHub
- `oab.html`: pagina principal do sistema OAB
- `oab.css`: estilos da interface OAB
- `oab.js`: logica do banco de questoes, simulados e parser de PDF

Funcionalidades:

- Banco de questoes com filtros por disciplina, exame e busca textual
- Criacao de simulados com temporizador e correcao imediata opcional
- Modo biblioteca para responder questoes em sessao curta ou no pool completo
- Dashboard com historico, precisao por disciplina e plano automatico
- Importacao de PDFs de provas e gabaritos com `pdf.js`

## Controle de Convidados

## Funcionalidades

- Marcacao de `Presente`, `Ausente` e `Pendente`
- Controle de quantas pessoas entraram com o convidado principal
- Busca por nome, mesa e observacoes
- Ordenacao por ordem alfabetica ou numero da mesa
- Resumo com total de convidados, presentes, ausentes e pessoas que entraram
- Salvamento automatico no navegador com `localStorage`

## Publicar no GitHub Pages

1. Envie o arquivo `index.html` para a raiz do repositorio
2. No GitHub, abra `Settings`
3. Entre em `Pages`
4. Em `Build and deployment`, escolha:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` ou `master`
   - `Folder`: `/root`
5. Salve

Depois disso, o GitHub vai publicar a aplicacao automaticamente.

URL esperada:

- `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

## Estrutura

- `index.html`: pagina inicial do projeto
- `app.html`: pagina do controle de convidados
- `oab.html`: pagina do sistema OAB
- `README.md`: instrucoes de uso e implantacao
