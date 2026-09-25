// modelo.js - Dados, classes (POO) e closure do CineMatch Web

// =========================================================================
// RF05: Tratamento do catálogo com métodos de array
// =========================================================================

// Imagem de reserva embutida (SVG em data URI): não depende de site externo
const IMAGEM_PADRAO =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="210" height="295">
            <rect width="100%" height="100%" fill="#2b2b2b"/>
            <text x="50%" y="50%" fill="#888" font-family="Arial" font-size="16"
                  text-anchor="middle" dominant-baseline="middle">Sem capa</text>
        </svg>`
    );

export function tratarCatalogo(dadosBrutos, limite = 60) {
    if (!Array.isArray(dadosBrutos)) {
        return [];
    }

    return dadosBrutos
        .filter(serie => {
            const temNota = serie.rating && typeof serie.rating.average === "number";
            const temGenero = Array.isArray(serie.genres) && serie.genres.length > 0;
            return temNota && temGenero;
        })
        .sort((a, b) => b.rating.average - a.rating.average)
        .slice(0, limite)
        .map(serie => ({
            id: serie.id,
            titulo: serie.name,
            tipo: "Série",
            generos: serie.genres,
            nota: serie.rating.average,
            duracaoMinutos: serie.runtime || serie.averageRuntime || 45,
            imagem: serie.image && serie.image.medium ? serie.image.medium : IMAGEM_PADRAO
        }));
}

// =========================================================================
// RF06: Classes com herança e this
// =========================================================================

export class Conteudo {
    constructor({ id, titulo, tipo, generos, duracaoMinutos, imagem }) {
        this.id = id;
        this.titulo = titulo;
        this.tipo = tipo;
        this.generos = generos;
        this.duracaoMinutos = duracaoMinutos;
        this.imagem = imagem;
    }

    // RF07: mesmas faixas do CineMatch JS original (>= 80 Alta, >= 50 Média, resto Baixa)
    // Retorna o texto para exibir e o nível (sem acento) para usar como classe CSS
    classificar(percentual) {
        if (percentual >= 80) {
            return { texto: "Alta afinidade", nivel: "Alta" };
        } else if (percentual >= 50) {
            return { texto: "Média afinidade", nivel: "Media" };
        } else {
            return { texto: "Baixa afinidade", nivel: "Baixa" };
        }
    }

    // RF07: gêneros em comum / total de gêneros do conteúdo x 100
    calcularCompatibilidade(generosUsuario) {
        const comuns = this.generos.filter(genero => generosUsuario.includes(genero));

        // Laço explícito para montar a lista de gêneros não explorados
        const naoExplorados = [];
        for (const genero of this.generos) {
            if (!generosUsuario.includes(genero)) {
                naoExplorados.push(genero);
            }
        }

        const percentual = this.generos.length === 0
            ? 0
            : Math.round((comuns.length / this.generos.length) * 100);

        const { texto, nivel } = this.classificar(percentual);

        return {
            comuns,
            naoExplorados,
            percentual,
            classificacao: texto,
            nivel
        };
    }

    // Mesmo formato do exibirResumo() do CineMatch JS original
    exibirResumo() {
        return `${this.titulo} (${this.tipo}) - ${this.duracaoMinutos} min`;
    }
}

// Igual ao original, Serie herda de Conteudo e fixa o tipo via super().
// Onde o original acrescentava "temporadas" (a TVMaze não traz isso em /shows),
// a versão web acrescenta "nota", com exibirNota(), e sobrescreve exibirResumo()
export class Serie extends Conteudo {
    constructor(dados) {
        super({ ...dados, tipo: "Série" });
        this.nota = dados.nota;
    }

    exibirNota() {
        return `${this.titulo} tem nota ${this.nota}`;
    }

    exibirResumo() {
        return `${super.exibirResumo()} | Nota ${this.nota}`;
    }
}

// =========================================================================
// RF11: Closure - contador de recálculos da sessão
// =========================================================================

export function criarContador() {
    let total = 0; // variável privada: só é acessível pelas funções abaixo

    return {
        incrementar() {
            total++;
            return total;
        },
        obterTotal() {
            return total;
        }
    };
}