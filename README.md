
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