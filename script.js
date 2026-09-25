// script.js - Lógica principal (Formulário, LocalStorage, Fetch, Cálculo e Orquestração)

import {
    exibirErro,
    limparErro,
    exibirContador,
    renderizarPagina,
    renderizarPaginacao,
    exibirMensagemDeBoasVindas,
    limparMensagemBoasVindas
} from './ui.js';
import { tratarCatalogo, Serie, criarContador } from './modelo.js';

// RF11: contador por closure (vive enquanto a página estiver aberta)
const contadorRecalculos = criarContador();

// Guarda o catálogo tratado e as recomendações calculadas (usados no RF08)
let catalogo = [];
let recomendacoes = [];
let paginaAtual = 1;

// Quantas páginas da TVMaze buscar (cada uma tem até 250 séries).
// A API responde com status de erro quando a página não existe, e isso já
// é tratado abaixo como "página indisponível" (Promise.allSettled + response.ok)
const TOTAL_PAGINAS_API = 4;

// ==========================================
// RF04, RF05 & RF12: Consumo da API TVMaze via Fetch
// ==========================================
async function buscarCatalogoSeries() {
    const containerResultados = document.getElementById('resultados');

    try {
        // ESTADO 1 - CARREGANDO (RF12)
        containerResultados.innerHTML = "<p class='aviso-msg'>Buscando as melhores séries pra você...</p>";

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Busca várias páginas da TVMaze em paralelo. Promise.allSettled garante que,
        // se uma página falhar (rede ou 404 de página inexistente), as outras ainda
        // sejam aproveitadas, em vez de derrubar a busca inteira
        const numerosPagina = Array.from({ length: TOTAL_PAGINAS_API }, (_, indice) => indice);
        const resultadosPaginas = await Promise.allSettled(
            numerosPagina.map(pagina => fetch(`https://api.tvmaze.com/shows?page=${pagina}`))
        );

        let dadosBrutos = [];
        let algumaPaginaOk = false;

        for (const resultado of resultadosPaginas) {
            if (resultado.status !== "fulfilled") {
                console.warn("Falha de rede ao buscar uma página da API:", resultado.reason);
                continue;
            }

            const resposta = resultado.value;
            if (!resposta.ok) {
                console.warn(`Página indisponível (status ${resposta.status}), pulando.`);
                continue;
            }

            const dadosPagina = await resposta.json();
            if (Array.isArray(dadosPagina) && dadosPagina.length > 0) {
                dadosBrutos = dadosBrutos.concat(dadosPagina);
                algumaPaginaOk = true;
            }
        }

        // Se NENHUMA página respondeu, trata como falha real da API (cai no catch)
        if (!algumaPaginaOk) {
            throw new Error("Nenhuma página da API respondeu corretamente.");
        }

        console.log(`Catálogo bruto: ${dadosBrutos.length} séries recebidas de ${TOTAL_PAGINAS_API} página(s).`);

        const catalogoTratado = tratarCatalogo(dadosBrutos);
        console.log("Catálogo tratado com sucesso:", catalogoTratado);

        // ESTADO 2 - VAZIO
        if (catalogoTratado.length === 0) {
            containerResultados.innerHTML = `
                <p class="aviso-msg">Não encontramos recomendações agora. Tente novamente mais tarde.</p>
            `;
            return [];
        }

        containerResultados.innerHTML = "";
        return catalogoTratado;

    } catch (erro) {
        // ESTADO 3 - ERRO
        console.error("Erro capturado no catch:", erro);
        containerResultados.innerHTML = `
            <p class="erro-msg" role="alert">Ops! Não foi possível carregar as séries no momento. Verifique sua conexão e tente novamente.</p>
        `;
        return [];
    }
}

// ==========================================
// RF10: Callback
// Recebe outra função (callback) e a executa no momento certo do fluxo,
// mesmo padrão do executarCallbackOnboarding do CineMatch JS original
// ==========================================
function executarCallbackOnboarding(nome, callback) {
    callback(nome);
}

// ==========================================
// Paginação: desenha uma página específica das recomendações já calculadas
// ==========================================
function exibirPagina(pagina) {
    paginaAtual = pagina;
    renderizarPagina(recomendacoes, paginaAtual);
    renderizarPaginacao(recomendacoes.length, paginaAtual, exibirPagina);

    // Leva o usuário de volta ao topo dos resultados ao trocar de página
    document.querySelector("#tela-resultados").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ==========================================
// RF06 & RF07: Instancia as séries e calcula a compatibilidade
// ==========================================
function calcularRecomendacoes(catalogoTratado, usuario) {
    return catalogoTratado
        .map(dados => new Serie(dados))
        .map(serie => ({
            serie,
            ...serie.calcularCompatibilidade(usuario.generosFavoritos)
        }))
        // Maior compatibilidade primeiro; empate resolvido pela nota da série
        .sort((a, b) => b.percentual - a.percentual || b.serie.nota - a.serie.nota);
}

document.addEventListener("DOMContentLoaded", () => {

    const main = document.querySelector("main");
    const formPerfil = document.querySelector("#form-perfil");
    const telaPerfil = document.querySelector("#tela-perfil");
    const telaResultados = document.querySelector("#tela-resultados");
    const btnVoltar = document.querySelector("#btn-voltar");

    const inputNome = document.querySelector("#nome");
    const inputIdade = document.querySelector("#idade");
    const fieldsetGeneros = document.querySelector("fieldset");

    // RF03: carrega o perfil salvo (trata null e JSON inválido)
    const perfilSalvo = localStorage.getItem("cinematchPerfil");

    if (perfilSalvo) {
        try {
            const usuarioExistente = JSON.parse(perfilSalvo);
            console.log("Perfil carregado automaticamente do LocalStorage:", usuarioExistente);
            mostrarResultados(usuarioExistente);
        } catch (erro) {
            console.error("Perfil salvo está corrompido, removendo:", erro);
            localStorage.removeItem("cinematchPerfil");
        }
    }

    // RF02: captura e validação do formulário
    formPerfil.addEventListener("submit", (e) => {
        e.preventDefault();
        limparErro();

        const nome = inputNome.value.trim();
        const idade = parseInt(inputIdade.value);

        const checkboxesGeneros = document.querySelectorAll('input[name="genero"]:checked');
        const generosFavoritos = Array.from(checkboxesGeneros).map(checkbox => checkbox.value);

        if (nome.length < 3) {
            exibirErro("O nome deve conter pelo menos 3 caracteres.", inputNome);
            return;
        }

        if (isNaN(idade) || idade <= 0 || idade >= 100) {
            exibirErro("A idade deve ser um número válido entre 1 e 99 anos.", inputIdade);
            return;
        }

        if (generosFavoritos.length === 0) {
            exibirErro("Por favor, selecione ao menos um gênero favorito.", fieldsetGeneros);
            return;
        }

        const usuario = { nome, idade, generosFavoritos };

        localStorage.setItem("cinematchPerfil", JSON.stringify(usuario));
        console.log("Perfil salvo com sucesso no LocalStorage:", usuario);

        mostrarResultados(usuario);
    });

    // Botão "Trocar perfil"
    if (btnVoltar) {
        btnVoltar.addEventListener("click", () => {
            localStorage.removeItem("cinematchPerfil");
            limparErro();
            main.classList.remove("main-largo");
            telaResultados.classList.add("oculto");
            telaPerfil.classList.remove("oculto");
            formPerfil.reset();
        });
    }

    // Troca de tela, busca o catálogo e calcula a compatibilidade
    async function mostrarResultados(usuario) {
        telaPerfil.classList.add("oculto");
        telaResultados.classList.remove("oculto");
        main.classList.add("main-largo"); // cards precisam de mais largura que o formulário

        const tituloResultados = telaResultados.querySelector("h2");
        if (tituloResultados) {
            tituloResultados.textContent = `Recomendado pra você, ${usuario.nome}`;
        }

        limparMensagemBoasVindas(); // evita mostrar o nome do perfil anterior durante o carregamento

        catalogo = await buscarCatalogoSeries();
        if (catalogo.length === 0) {
            return;
        }

        // RF06 + RF07: calcula a compatibilidade para o catálogo inteiro
        recomendacoes = calcularRecomendacoes(catalogo, usuario);

        // Paginação: sempre começa na página 1 a cada novo cálculo
        exibirPagina(1);

        // RF11: incrementa o contador (closure) e mostra na tela
        exibirContador(contadorRecalculos.incrementar());

        // RF10: callback disparado só depois que a busca terminou e os cards foram renderizados
        executarCallbackOnboarding(usuario.nome, exibirMensagemDeBoasVindas);
    }
});