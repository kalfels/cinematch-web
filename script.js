// script.js - Lógica principal (Formulário, LocalStorage, Validação e Eventos)

import { exibirErro, limparErro } from './ui.js';

// ==========================================
// RF04 & RF12: Consumo da API TVMaze via Fetch
// ==========================================

// Função assíncrona para buscar o catálogo de séries
async function buscarCatalogoSeries() {
    const containerResultados = document.getElementById('resultados');
    
    try {
        // RF12: Exibir mensagem de carregamento inicial (feedback visual)
        containerResultados.innerHTML = "<p>Buscando as melhores séries pra você...</p>";

        // Pequeno atraso proposital com setTimeout para simular/evidenciar o carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Realiza a requisição fetch na API pública da TVMaze
        const resposta = await fetch('https://api.tvmaze.com/shows?page=0');

        // Valida se a resposta da requisição foi bem-sucedida (response.ok)
        if (!resposta.ok) {
            throw new Error(`Erro na API: ${resposta.status}`);
        }

        // Converte a resposta para formato JSON
        const dadosBrutos = await resposta.json();

        console.log("Catálogo bruto carregado com sucesso:", dadosBrutos);

        // Próximo passo (RF05): Chamar a função de tratamento de array aqui
        // tratarCatalogo(dadosBrutos);

    } catch (erro) {
        // RF04: Tratamento de falhas de rede/API exibindo mensagem amigável
        console.error("Erro capturado no catch:", erro);
        containerResultados.innerHTML = `
            <p class="erro-msg">Ops! Não foi possível carregar as séries no momento. Verifique sua conexão e tente novamente.</p>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {

    buscarCatalogoSeries();

    const formPerfil = document.querySelector("#form-perfil");
    const telaPerfil = document.querySelector("#tela-perfil");
    const telaResultados = document.querySelector("#tela-resultados");
    const btnVoltar = document.querySelector("#btn-voltar");

    // Elementos do DOM dos inputs para validação e destaque visual
    const inputNome = document.querySelector("#nome");
    const inputIdade = document.querySelector("#idade");
    const fieldsetGeneros = document.querySelector("fieldset");

    // =========================================================================
    // RF03: Verificação inicial com localStorage.getItem para carregar o perfil
    // =========================================================================
    const perfilSalvo = localStorage.getItem("cinematchPerfil");
    
    if (perfilSalvo) {
        const usuarioExistente = JSON.parse(perfilSalvo);
        console.log("Perfil carregado automaticamente do LocalStorage:", usuarioExistente);
        
        // Pula o formulário e exibe a tela de resultados diretamente
        mostrarResultados(usuarioExistente);
    }

    // =========================================================================
    // RF02: Captura de dados do formulário com preventDefault e Validação
    // =========================================================================
    formPerfil.addEventListener("submit", (e) => {
        // Bloqueia o recarregamento padrão da página
        e.preventDefault();
        limparErro();

        // Captura os valores aplicando o trim() no nome e convertendo a idade
        const nome = inputNome.value.trim();
        const idade = parseInt(inputIdade.value);

        // Captura todos os checkboxes de gêneros selecionados
        const checkboxesGeneros = document.querySelectorAll('input[name="genero"]:checked');
        const generosFavoritos = Array.from(checkboxesGeneros).map(checkbox => checkbox.value);

        // =====================================================================
        // VALIDAÇÕES DOS CAMPOS COM DESTAQUE VISUAL (Borda Branca)
        // =====================================================================
        
        // 1. Validação do Nome: não aceita menos de 3 caracteres
        if (nome.length < 3) {
            exibirErro("O nome deve conter pelo menos 3 caracteres.", inputNome);
            return;
        }

        // 2. Validação da Idade: acima de 0 e abaixo de 100 (corrigida)
        if (isNaN(idade) || idade <= 0 || idade >= 100) {
            exibirErro("A idade deve ser um número válido entre 1 e 99 anos.", inputIdade);
            return;
        }

        // 3. Validação dos Checkboxes: não permite envio sem nenhuma seleção
        if (generosFavoritos.length === 0) {
            exibirErro("Por favor, selecione ao menos um gênero favorito.", fieldsetGeneros);
            return;
        }

        // Estrutura os dados capturados em um Objeto Simples (usuario)
        const usuario = {
            nome: nome,
            idade: idade,
            generosFavoritos: generosFavoritos
        };

        // =====================================================================
        // RF03: Utilizar localStorage.setItem e JSON.stringify para salvar o perfil
        // =====================================================================
        localStorage.setItem("cinematchPerfil", JSON.stringify(usuario));
        console.log("Perfil salvo com sucesso no LocalStorage:", usuario);

        // Alterna para a tela de resultados
        mostrarResultados(usuario);
    });

    // =========================================================================
    // Funcionalidade do Botão "Trocar perfil" (Limpar LocalStorage)
    // =========================================================================
    if (btnVoltar) {
        btnVoltar.addEventListener("click", () => {
            localStorage.removeItem("cinematchPerfil");
            limparErro();
            telaResultados.classList.add("oculto");
            telaPerfil.classList.remove("oculto");
            formPerfil.reset();
        });
    }

    // Função auxiliar para gerenciar a troca de telas na interface
    function mostrarResultados(usuario) {
        telaPerfil.classList.add("oculto");
        telaResultados.classList.remove("oculto");
        
        // Feedback visual amigável personalizado com o nome do usuário
        const tituloResultados = telaResultados.querySelector("h2");
        if (tituloResultados) {
            tituloResultados.textContent = `Recomendado pra você, ${usuario.nome}`;
        }
    }
});