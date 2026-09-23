// ui.js - Manipulação de interface, mensagens de erro e cards

export function exibirErro(mensagem, campoComErro = null) {
    const form = document.querySelector("#form-perfil");
    
    // Remove erro anterior se houver para evitar duplicação
    limparErro();

    // Cria dinamicamente o elemento de erro usando createElement e classList
    const divErro = document.createElement("div");
    divErro.className = "mensagem-erro";
    divErro.textContent = mensagem;

    // Insere o aviso de erro no topo do formulário
    form.prepend(divErro);

    // Se um campo específico foi passado, aplica a borda branca de destaque e o foco
    if (campoComErro) {
        campoComErro.classList.add("input-erro");
        campoComErro.focus();
    }
}

export function limparErro() {
    const erroExistente = document.querySelector(".mensagem-erro");
    if (erroExistente) {
        erroExistente.remove();
    }

    // Remove a classe de erro de todos os inputs e fieldsets que possuíam destaque
    const camposComErro = document.querySelectorAll(".input-erro");
    camposComErro.forEach(campo => {
        campo.classList.remove("input-erro");
    });
}