// ui.js - Manipulação de interface, mensagens de erro e cards

export function exibirErro(mensagem, campoComErro = null) {
    const form = document.querySelector("#form-perfil");

    // Remove erro anterior se houver para evitar duplicação
    limparErro();

    const divErro = document.createElement("div");
    divErro.className = "mensagem-erro";
    divErro.setAttribute("role", "alert"); // leitores de tela anunciam o erro
    divErro.textContent = mensagem;

    form.prepend(divErro);

    if (campoComErro) {
        campoComErro.classList.add("input-erro");
        // fieldset só recebe foco com tabindex
        if (!campoComErro.hasAttribute("tabindex") && campoComErro.tagName === "FIELDSET") {
            campoComErro.setAttribute("tabindex", "-1");
        }
        campoComErro.focus();
    }
}

export function limparErro() {
    const erroExistente = document.querySelector(".mensagem-erro");
    if (erroExistente) {
        erroExistente.remove();
    }

    const camposComErro = document.querySelectorAll(".input-erro");
    camposComErro.forEach(campo => {
        campo.classList.remove("input-erro");
    });
}

// RF11: mostra na tela quantas vezes a compatibilidade foi calculada na sessão
export function exibirContador(total) {
    const elemento = document.querySelector("#contador-recalculos");
    if (elemento) {
        elemento.textContent = `Compatibilidade calculada ${total} ${total === 1 ? "vez" : "vezes"} nesta sessão.`;
    }
}