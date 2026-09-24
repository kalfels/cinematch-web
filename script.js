// script.js - Lógica principal (Formulário, LocalStorage, Fetch, Cálculo e Orquestração)

import { exibirErro, limparErro, exibirContador, renderizarResultados } from './ui.js';
import { tratarCatalogo, Serie, criarContador } from './modelo.js';

// RF11: contador por closure (vive enquanto a página estiver aberta)
const contadorRecalculos = criarContador();

// Guarda o catálogo tratado e as recomendações calculadas (usados no RF08)
let catalogo = [];
let recomendacoes = [];

// ==========================================
// RF04, RF05 & RF12: Consumo da API TVMaze via Fetch
// ==========================================
async function buscarCatalogoSeries() {
    const containerResultados = document.getElementById('resultados');

    try {
        // ESTADO 1 - CARREGANDO (RF12)
        containerResultados.innerHTML = "<p class='aviso-msg'>Buscando as melhores séries pra você...</p>";

        await new Promise(resolve => setTimeout(resolve, 1000));

        const resposta = await fetch('https://api.tvmaze.com/shows?page=0');

        if (!resposta.ok) {
            throw new Error(`Erro na API: ${resposta.status}`);
        }

        const dadosBrutos = await resposta.json();
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

        catalogo = await buscarCatalogoSeries();
        if (catalogo.length === 0) {
            return;
        }

        // RF06 + RF07: calcula a compatibilidade
        recomendacoes = calcularRecomendacoes(catalogo, usuario);

        // RF08: desenha os cards na tela (substitui o console.table de validação)
        renderizarResultados(recomendacoes);

        // RF11: incrementa o contador (closure) e mostra na tela
        exibirContador(contadorRecalculos.incrementar());
    }
});