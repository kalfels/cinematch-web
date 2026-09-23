// Lógica principal (Formulário, LocalStorage, Validação e Eventos)

import { exibirErro, limparErro } from './ui.js';
import { tratarCatalogo } from './modelo.js';

// ==========================================
// RF04, RF05 & RF12: Consumo da API + tratamento do catálogo
// ==========================================

// Guarda o catálogo tratado para as próximas etapas (RF06/RF07)
let catalogo = [];

// Busca, trata e devolve o catálogo. Sempre retorna um array (vazio em caso de erro).
async function buscarCatalogoSeries() {
    const containerResultados = document.getElementById('resultados');

    try {
        // ESTADO 1 - CARREGANDO (RF12)
        containerResultados.innerHTML = "<p class='aviso-msg'>Buscando as melhores séries pra você...</p>";

        // Pequeno atraso proposital para evidenciar o carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));

        const resposta = await fetch('https://api.tvmaze.com/shows?page=0');

        if (!resposta.ok) {
            throw new Error(`Erro na API: ${resposta.status}`);
        }

        const dadosBrutos = await resposta.json();
        console.log("Catálogo bruto carregado com sucesso:", dadosBrutos);

        // RF05: filter, sort, slice e map
        const catalogoTratado = tratarCatalogo(dadosBrutos);
        console.log("Catálogo tratado com sucesso:", catalogoTratado);

        // ESTADO 2 - VAZIO (RF05)
        if (catalogoTratado.length === 0) {
            containerResultados.innerHTML = `
                <p class="aviso-msg">Não encontramos recomendações agora. Tente novamente mais tarde.</p>
            `;
            return [];
        }

        // Sucesso: limpa a mensagem de carregamento (os cards serão gerados no RF08)
        containerResultados.innerHTML = "";
        return catalogoTratado;

    } catch (erro) {
        // ESTADO 3 - ERRO (RF04)
        console.error("Erro capturado no catch:", erro);
        containerResultados.innerHTML = `
            <p class="erro-msg" role="alert">Ops! Não foi possível carregar as séries no momento. Verifique sua conexão e tente novamente.</p>
        `;
        return [];
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const formPerfil = document.querySelector("#form-perfil");
    const telaPerfil = document.querySelector("#tela-perfil");
    const telaResultados = document.querySelector("#tela-resultados");
    const btnVoltar = document.querySelector("#btn-voltar");

    const inputNome = document.querySelector("#nome");
    const inputIdade = document.querySelector("#idade");
    const fieldsetGeneros = document.querySelector("fieldset");

    // =========================================================================
    // RF03: Verificação inicial do localStorage (com proteção contra JSON inválido)
    // =========================================================================
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

    // =========================================================================
    // RF02: Captura do formulário com preventDefault e validação
    // =========================================================================
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

        const usuario = {
            nome: nome,
            idade: idade,
            generosFavoritos: generosFavoritos
        };

        // RF03: salva o perfil
        localStorage.setItem("cinematchPerfil", JSON.stringify(usuario));
        console.log("Perfil salvo com sucesso no LocalStorage:", usuario);

        mostrarResultados(usuario);
    });

    // Botão "Trocar perfil"
    if (btnVoltar) {
        btnVoltar.addEventListener("click", () => {
            localStorage.removeItem("cinematchPerfil");
            limparErro();
            telaResultados.classList.add("oculto");
            telaPerfil.classList.remove("oculto");
            formPerfil.reset();
        });
    }

    // Troca de tela + busca do catálogo (só busca quando há perfil)
    async function mostrarResultados(usuario) {
        telaPerfil.classList.add("oculto");
        telaResultados.classList.remove("oculto");

        const tituloResultados = telaResultados.querySelector("h2");
        if (tituloResultados) {
            tituloResultados.textContent = `Recomendado pra você, ${usuario.nome}`;
        }

        catalogo = await buscarCatalogoSeries();
        console.log("Catálogo pronto para o cálculo de compatibilidade (RF07):", catalogo);
    }
});