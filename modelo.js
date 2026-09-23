// Tratamento e transformação dos dados do catálogo (RF05)

// Imagem de reserva embutida (SVG em data URI): não depende de nenhum site externo
const IMAGEM_PADRAO =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="210" height="295">
            <rect width="100%" height="100%" fill="#2b2b2b"/>
            <text x="50%" y="50%" fill="#888" font-family="Arial" font-size="16"
                  text-anchor="middle" dominant-baseline="middle">Sem capa</text>
        </svg>`
    );

/**
 * Recebe o array bruto da TVMaze e devolve as 8 melhores séries já padronizadas.
 * Retorna [] se os dados forem inválidos ou se nada sobrar após o filtro
 * (o script.js usa isso para mostrar o estado "vazio").
 */
export function tratarCatalogo(dadosBrutos) {
    // Proteção: se a API mandar um formato inesperado, devolve catálogo vazio
    if (!Array.isArray(dadosBrutos)) {
        return [];
    }

    return dadosBrutos
        // 1. FILTER: remove séries sem nota média ou sem gêneros cadastrados
        .filter(serie => {
            const temNota = serie.rating && typeof serie.rating.average === "number";
            const temGenero = Array.isArray(serie.genres) && serie.genres.length > 0;
            return temNota && temGenero;
        })
        // 2. SORT: da maior nota para a menor (copia antes com filter, então não altera o original)
        .sort((a, b) => b.rating.average - a.rating.average)
        // 3. SLICE: mantém apenas as 8 melhores
        .slice(0, 8)
        // 4. MAP: objeto limpo e padronizado para o nosso app
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