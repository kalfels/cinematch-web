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
// Melhoria opcional: tema dark/light
// =========================================================================

// Atualiza o ícone e o aria-label do botão conforme o tema ativo
export function atualizarBotaoTema(tema) {
    const botao = document.querySelector("#btn-tema");
    if (!botao) {
        return;
    }

    if (tema === "light") {
        botao.textContent = "☀️";
        botao.setAttribute("aria-label", "Alternar para tema escuro");
    } else {
        botao.textContent = "🌙";
        botao.setAttribute("aria-label", "Alternar para tema claro");
    }
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

// Quantas recomendações aparecem por página
const ITENS_POR_PAGINA = 8;

// Desenha apenas a "fatia" da página pedida
export function renderizarPagina(recomendacoes, pagina) {
    const container = document.querySelector("#resultados");
    container.innerHTML = "";

    const inicio = (pagina - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;

    recomendacoes.slice(inicio, fim).forEach(resultado => renderizarCard(resultado));
}

// Cria (ou atualiza) os botões Anterior/Próxima e o indicador "Página X de Y"
// aoTrocarPagina é o callback chamado quando o usuário clica em um botão (RF10-style)
export function renderizarPaginacao(totalItens, paginaAtual, aoTrocarPagina) {
    const totalPaginas = Math.max(1, Math.ceil(totalItens / ITENS_POR_PAGINA));

    let nav = document.querySelector("#paginacao");
    if (!nav) {
        nav = document.createElement("nav");
        nav.id = "paginacao";
        nav.className = "paginacao";
        nav.setAttribute("aria-label", "Navegação de páginas de recomendações");
        document.querySelector("#resultados").after(nav);
    }

    nav.innerHTML = "";

    // Com tudo cabendo em uma página só, não faz sentido mostrar os controles
    if (totalPaginas <= 1) {
        return;
    }

    const btnAnterior = document.createElement("button");
    btnAnterior.type = "button";
    btnAnterior.className = "btn-pagina";
    btnAnterior.textContent = "◀ Anterior";
    btnAnterior.disabled = paginaAtual === 1;
    btnAnterior.addEventListener("click", () => aoTrocarPagina(paginaAtual - 1));

    const indicador = document.createElement("span");
    indicador.className = "paginacao-indicador";
    indicador.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
    indicador.setAttribute("aria-live", "polite");

    const btnProxima = document.createElement("button");
    btnProxima.type = "button";
    btnProxima.className = "btn-pagina";
    btnProxima.textContent = "Próxima ▶";
    btnProxima.disabled = paginaAtual === totalPaginas;
    btnProxima.addEventListener("click", () => aoTrocarPagina(paginaAtual + 1));

    nav.append(btnAnterior, indicador, btnProxima);
}

// =========================================================================
// RF10: função usada como CALLBACK após o carregamento do catálogo
// =========================================================================

// Cria (ou reaproveita) o parágrafo de boas-vindas acima dos cards.
// Fica fora de #resultados, senão o innerHTML das buscas apagaria a mensagem.
export function exibirMensagemDeBoasVindas(nome) {
    let mensagem = document.querySelector("#mensagem-boas-vindas");

    if (!mensagem) {
        mensagem = document.createElement("p");
        mensagem.id = "mensagem-boas-vindas";
        mensagem.className = "boas-vindas";
        mensagem.setAttribute("role", "status"); // leitores de tela anunciam sem interromper
        document.querySelector("#resultados").before(mensagem);
    }

    mensagem.textContent = `Bem-vindo ao CineMatch, ${nome}! Estas são as séries que mais combinam com você.`;
}

// Remove a mensagem (usada ao começar uma nova busca, para não mostrar o nome anterior)
export function limparMensagemBoasVindas() {
    const mensagem = document.querySelector("#mensagem-boas-vindas");
    if (mensagem) {
        mensagem.remove();
    }
}