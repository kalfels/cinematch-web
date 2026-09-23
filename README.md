
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