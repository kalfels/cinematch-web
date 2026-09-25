
Instruções
- Baixe o ZIP
- Descompacte no diretorio cinematch-web
- verifique se tem o node instalado caso não baixe em xxx e instale.
- rode no cmd ou terminal dentro da pasta : npm install
- para abrir o index.html execute o comando: npx live-server


Explicações
- aplicado SEO geral e assessibilidade (labels/inputs)
- testes com Lighthouse no Chrome
- utilizado semantica html (header, main, section, article, footer)
- utilizado flexbox no CSS - mobile-first
- plubliquei da branch develop
feat: adiciona estrutura inicial do html e css
- criado e ajustado a logotipo estilo netflix
- iniciado scripts.js
- observa o comportamento da DOM pra verificar se há localstorage definido
- verifica o localstorage para carregar o perfil
- captura os dados do formulario e grava perfil no localstorage
- implementado a troca de perfil para limpar o localstorage
- manipula telas e informações conforme status do localstorage
- fazer testes e verificar o localstorage e console
- ajustar validações dos campos do formulário
- criado o consumo da API do TVMaze na pagina inicial para testes
- Utilizado async/await com promise
- efetuado testes de conectividade com a API e queda de conexão, comportamentos foram como esperados.
- para tratamento do catalogo com array, foi criada a função tratarCatalogo() dentro de modelo.js
- .filter consiste em remover series que não possuem nota média ou que estão sem gêneros cadastrados
- com .map transformamos os dados brutos em um objeto limpo e padronizado
- com .sort ordenamos as séries em ordem decrescente com base na nota (da maior para a menor)
- com .slice limitamos o catálogo resultante para exibir apenas as top 8 melhores séries
- importamos tratarCatalogo e verificamos no console.log se os dados estão sendo tratados conforme função tratarCatalogo();
- criadas as classes Conteudo e Serie em modelo.js (POO), adaptadas do CineMatch JS original
- Conteudo guarda id, titulo, tipo, generos, duracaoMinutos e imagem, com os métodos exibirResumo(), classificar() e calcularCompatibilidade()
- Serie usa herança (extends + super), fixa o tipo "Série", acrescenta o atributo nota e o método exibirNota(), e sobrescreve exibirResumo() reaproveitando o da classe base
- no projeto original a Serie tinha "temporadas"; na versão web foi trocado por "nota", porque a TVMaze não devolve temporadas no endpoint /shows
- compatibilidade calculada com a mesma regra do projeto original: (gêneros em comum / total de gêneros da série) x 100, com Math.round
- gêneros não explorados montados com um laço for...of
- classificação com if / else if / else, mantendo as faixas do original: Alta afinidade (80% ou mais), Média afinidade (50% a 79%) e Baixa afinidade (abaixo de 50%)
- o cálculo devolve também um "nivel" sem acento (Alta, Media, Baixa), para ser usado como classe CSS dos badges
- calcularRecomendacoes() em script.js instancia cada série com new Serie(), calcula a compatibilidade e ordena por percentual (empate resolvido pela nota)
- lógica validada no console com console.table antes de desenhar os cards (RF08)
- criada uma closure (criarContador) que mantém a variável total privada, com os métodos incrementar() e obterTotal()
- o contador de recálculos da sessão é exibido na tela pela função exibirContador() em ui.js
- o contador vive em memória: zera ao recarregar a página (F5), o que corresponde a "nesta sessão" no desafio
- mensagem de erro do formulário com role="alert", e o fieldset recebe tabindex="-1" para poder receber foco
- testes realizados: perfil só com Drama (100%, 50% e 0% conferidos na mão), limite de 50% classificado como Média, contador subindo ao trocar de perfil e reenviar o formulário
- criada a renderização dinâmica dos cards (RF08): renderizarCard() e renderizarResultados() em ui.js, gerando um <article> por série com createElement, sem nenhum card fixo no HTML
- cada card mostra capa (com alt "Capa da série ..."), título, nota, duração, percentual de compatibilidade, badge de afinidade, gêneros em comum e gêneros ainda não explorados
- usado textContent em vez de innerHTML para inserir os dados vindos da API, evitando injetar HTML de fonte externa
- criado um objeto de tradução dos gêneros (Comedy -> Comédia, Horror -> Terror...) usado só para exibição; o cálculo continua com os valores originais da TVMaze
- os cards são exibidos ordenados por compatibilidade (maior primeiro), com a nota da série como critério de desempate
- removido o console.table de validação, já que o resultado agora aparece na tela
- estilização responsiva com Flexbox (RF09), mobile-first: 1 card por linha no celular, 2 a partir de 768px e 3 a partir de 1024px, com media queries
- o container principal ganha a classe main-largo (via classList) na tela de resultados para caber os cards, e volta à largura estreita ao clicar em "Trocar perfil"
- badges de afinidade (.Alta, .Media, .Baixa) com texto sempre visível, sem depender só da cor
- CSS sem !important: o .oculto usa #tela-resultados:not(.oculto) para não perder para a regra de ID, e o destaque de erro usa input.input-erro / fieldset.input-erro, que vence pela ordem no arquivo
- adicionado :focus-visible com contorno branco, para o foco do teclado ficar visível em campos, checkboxes e botões
- organização em módulos ES (RF14): script.js importa de ui.js e modelo.js, e o index.html carrega com <script type="module" src="script.js"></script>
- divisão de responsabilidades: script.js (fluxo, localStorage, fetch e cálculo), ui.js (tudo que toca a tela) e modelo.js (tratamento do catálogo, classes e closure)
- testes realizados: 8 cards na tela ordenados por afinidade, layout em 375px (1 coluna), cerca de 800px (2) e 1200px (3), botão "Trocar perfil" escondendo os cards, e API offline mostrando a mensagem de erro

## CommonJS x ESM

- CommonJS (require / module.exports) foi usado no CineMatch JS original, que rodava no terminal com Node.js (por exemplo: const prompt = require('prompt-sync')()). Os módulos são carregados de forma síncrona.
- ESM (import / export) é o padrão oficial do JavaScript e é o usado aqui, no navegador. Ele exige <script type="module"> no HTML e precisa de um servidor local (por isso o live-server), pois o navegador bloqueia módulos abertos direto pelo arquivo (file://).
- Diferença prática: no CommonJS exportamos com module.exports = { ... }; no ESM usamos export function / export class e importamos com import { ... } from './arquivo.js', sempre com a extensão .js.

- criada a função de callback exibirMensagemDeBoasVindas(nome) em ui.js (RF10)
- executarCallbackOnboarding(nome, callback) em script.js recebe a função como parâmetro e a executa, no mesmo padrão do CineMatch JS original
- o callback é disparado somente depois que a busca na API terminou e os cards foram renderizados; se a busca falhar ou vier vazia, ele não é chamado
- a mensagem usa role="status" para ser anunciada por leitores de tela e é removida ao começar uma nova busca, para não mostrar o nome do perfil anterior

melhorias opcionais

- melhoria opcional: buscadas 4 páginas da TVMaze (page=0 a page=3) em paralelo com Promise.allSettled, ampliando o catálogo de ~250 para ~1000 séries antes do tratamento
- Promise.allSettled evita que a falha de uma página derrube as outras; só é tratado como erro se nenhuma página responder
- tratarCatalogo() agora aceita um parâmetro de limite (padrão 60), no lugar do corte fixo em 8
- implementada paginação nos resultados: 8 recomendações por página, com botões Anterior/Próxima e indicador "Página X de Y"
- a paginação reinicia na página 1 a cada novo perfil, e os controles somem quando tudo cabe em uma página só

- melhoria opcional: alternância de tema dark/light, com o botão no header (🌙/☀️)
- tema salvo no localStorage (cinematchTema) e aplicado por um script inline no <head>, antes do CSS renderizar, para não piscar no tema errado ao carregar
- cores convertidas em variáveis CSS (--bg-pagina, --texto-principal, --acento, etc.), redefinidas em :root[data-theme="light"]
- badges de afinidade mantidos com cores fixas nos dois temas, por serem cores semânticas (sucesso/atenção/neutro)
- testado: alternância, persistência após F5, e contraste de texto no tema claro

- melhoria opcional: tela de loading com a logo centralizada, fundo desfocado (backdrop-filter) e efeito sonoro, exibida só ao enviar o formulário ou ao carregar automaticamente com perfil salvo
- ao terminar a busca, a logo anima subindo e desaparecendo, revelando os cards, o aviso de vazio ou a mensagem de erro
- overlay marcado com aria-hidden, e a área de resultados com aria-live="polite", para quem usa leitor de tela receber o status real em vez do efeito visual
- animação desativada para quem usa prefers-reduced-motion, por acessibilidade
- som tocado com try/catch, sem travar a aplicação caso o navegador bloqueie áudio automático