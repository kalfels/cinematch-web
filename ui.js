// ui.js - Manipulação de interface: erros, contador e cards (RF08)

// =========================================================================
// Formulário: mensagens de erro
// =========================================================================

export function exibirErro(mensagem, campoComErro = null) {
    const form = document.querySelector("#form-perfil");

    limparErro();

    const divErro = document.createElement("div");
    divErro.className = "mensagem-erro";
    divErro.setAttribute("role", "alert"); // leitores de tela anunciam o erro
    divErro.textContent = mensagem;

    form.prepend(divErro);

    if (campoComErro) {
        campoComErro.classList.add("input-erro");
        // fieldset só recebe foco com tabindex
        if (campoComErro.tagName === "FIELDSET" && !campoComErro.hasAttribute("tabindex")) {
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

// =========================================================================
// RF11: contador de recálculos
// =========================================================================

export function exibirContador(total) {
    const elemento = document.querySelector("#contador-recalculos");
    if (elemento) {
        elemento.textContent = `Compatibilidade calculada ${total} ${total === 1 ? "vez" : "vezes"} nesta sessão.`;
    }
}

// =========================================================================
// RF08: Renderização dos cards
// =========================================================================

// A TVMaze devolve os gêneros em inglês; este objeto serve só para EXIBIÇÃO
// (o cálculo continua usando os valores originais da API)
const TRADUCAO_GENEROS = {
    "Drama": "Drama",
    "Comedy": "Comédia",
    "Action": "Ação",
    "Horror": "Terror",
    "Science-Fiction": "Ficção Científica",
    "Crime": "Crime",
    "Thriller": "Suspense",
    "Romance": "Romance",
    "Adventure": "Aventura",
    "Fantasy": "Fantasia",
    "Mystery": "Mistério",
    "Family": "Família",
    "Supernatural": "Sobrenatural",
    "Music": "Música",
    "War": "Guerra",
    "History": "História",
    "Western": "Faroeste",
    "Medical": "Médico",
    "Legal": "Jurídico",
    "Sports": "Esportes",
    "Espionage": "Espionagem",
    "Anime": "Anime",
    "Food": "Culinária",
    "Nature": "Natureza",
    "Travel": "Viagem"
};

function traduzirGenero(genero) {
    return TRADUCAO_GENEROS[genero] || genero;
}

// Monta um bloco "Rótulo: [tag] [tag]" para os gêneros
function criarBlocoGeneros(rotulo, generos, classeExtra) {
    const bloco = document.createElement("div");
    bloco.className = "card-generos";

    const titulo = document.createElement("span");
    titulo.className = "card-generos-titulo";
    titulo.textContent = rotulo;
    bloco.appendChild(titulo);

    const lista = document.createElement("ul");
    lista.className = "lista-generos";

    if (generos.length === 0) {
        const vazio = document.createElement("li");
        vazio.className = "tag-genero tag-vazia";
        vazio.textContent = "Nenhum";
        lista.appendChild(vazio);
    } else {
        for (const genero of generos) {
            const item = document.createElement("li");
            item.className = `tag-genero ${classeExtra}`;
            item.textContent = traduzirGenero(genero);
            lista.appendChild(item);
        }
    }

    bloco.appendChild(lista);
    return bloco;
}

// Cria UM card (<article>) e adiciona em #resultados
export function renderizarCard(resultado) {
    const { serie, comuns, naoExplorados, percentual, classificacao, nivel } = resultado;

    const card = document.createElement("article");
    card.className = "card-serie";

    const capa = document.createElement("img");
    capa.className = "card-capa";
    capa.src = serie.imagem;
    capa.alt = `Capa da série ${serie.titulo}`;
    capa.loading = "lazy";
    card.appendChild(capa);

    const corpo = document.createElement("div");
    corpo.className = "card-corpo";

    const titulo = document.createElement("h3");
    titulo.className = "card-titulo";
    titulo.textContent = serie.titulo;
    corpo.appendChild(titulo);

    const info = document.createElement("p");
    info.className = "card-info";
    info.textContent = `Nota ${serie.nota} • ${serie.duracaoMinutos} min`;
    corpo.appendChild(info);

    const compat = document.createElement("p");
    compat.className = "card-compat";
    compat.textContent = `Compatibilidade: ${percentual}%`;
    corpo.appendChild(compat);

    const badge = document.createElement("span");
    badge.className = `badge ${nivel}`;
    badge.textContent = classificacao;
    corpo.appendChild(badge);

    corpo.appendChild(criarBlocoGeneros("Em comum", comuns, "tag-comum"));
    corpo.appendChild(criarBlocoGeneros("Ainda não explorados", naoExplorados, "tag-nao-explorado"));

    card.appendChild(corpo);
    document.querySelector("#resultados").appendChild(card);

    return card;
}

// Limpa a área de resultados e desenha todos os cards
export function renderizarResultados(recomendacoes) {
    const container = document.querySelector("#resultados");
    container.innerHTML = "";

    recomendacoes.forEach(resultado => renderizarCard(resultado));
}