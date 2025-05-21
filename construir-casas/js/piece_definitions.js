// Definições das peças
// width/height em unidades de grid
// weight em kg (para HUD)
// maxSupport: peso que esta peça pode suportar (não totalmente implementado na física atual, mas útil para expansão)
// isStructural: se a peça pode dar suporte a outras
// requiresSolidGround: se precisa estar diretamente no chão ou sobre uma fundação/peça estrutural
// canPlaceOn: array de tipos de peças sobre as quais esta peça pode ser colocada
// integrity: um valor abstrato para futuras regras mais complexas
// js/piece_definitions.js
export const PIECE_DEFINITIONS = {
    foundation: {
        id: "foundation",
        name: "Base/Fundação",
        width: 1,
        height: 1,
        weight: 10,
        maxSupport: 1000,
        color: "#808080", // Gray
        cssClass: "piece-foundation",
        isStructural: true,
        isFoundation: true,
        requiresSolidGround: true,
        canPlaceOn: []
    },
    wall_1x2: { // Nome mais específico
        id: "wall_1x2",
        name: "Parede (1x2)",
        width: 1,
        height: 2,
        weight: 5,
        maxSupport: 50,
        color: "#CD853F", // Peru
        cssClass: "piece-wall",
        isStructural: true,
        requiresSolidGround: true,
        canPlaceOn: ["foundation", "wall_1x2", "wall_2x1", "pillar"] // Pode ser colocada sobre outras paredes ou pilares
    },
    wall_2x1: { // Parede deitada
        id: "wall_2x1",
        name: "Parede (2x1)",
        width: 2,
        height: 1,
        weight: 5, // Mesmo material, mesmo peso por unidade de volume (aproximado)
        maxSupport: 50,
        color: "#D2B48C", // Tan (cor um pouco diferente para distinguir)
        cssClass: "piece-wall",
        isStructural: true,
        requiresSolidGround: true,
        canPlaceOn: ["foundation", "wall_1x2", "wall_2x1", "pillar"],
        canRotate: true // Essa parede pode ser rotacionada para virar uma 1x2
    },
    window_small: {
        id: "window_small",
        name: "Janela Pequena",
        width: 1,
        height: 1,
        weight: 2,
        maxSupport: 0,
        color: "#ADD8E6", // LightBlue
        cssClass: "piece-window",
        isStructural: false,
        requiresSolidGround: false,
        canPlaceOn: ["wall_1x2", "wall_2x1"], // Precisa ser colocada em uma parede
        requiresHost: true
    },
    window_large: {
        id: "window_large",
        name: "Janela Grande",
        width: 2, // Janela mais larga
        height: 1,
        weight: 3,
        maxSupport: 0,
        color: "#87CEEB", // SkyBlue (um pouco diferente)
        cssClass: "piece-window",
        isStructural: false,
        requiresSolidGround: false,
        canPlaceOn: ["wall_1x2", "wall_2x1"],
        requiresHost: true,
        canRotate: true // Pode rotacionar para ser uma janela alta 1x2
    },
    door: {
        id: "door",
        name: "Porta",
        width: 1,
        height: 2,
        weight: 3,
        maxSupport: 0,
        color: "#8B4513", // SaddleBrown
        cssClass: "piece-door",
        isStructural: false,
        requiresSolidGround: true,
        canPlaceOn: ["foundation", "wall_1x2", "wall_2x1"] // Portas geralmente no chão ou em aberturas de parede
    },
    roof_small_triangle: {
        id: "roof_small_triangle",
        name: "Telhado Triângulo P",
        width: 2, // Base do triângulo
        height: 1, // Altura do triângulo
        weight: 4,
        maxSupport: 0,
        color: "#B22222", // FireBrick
        cssClass: "piece-roof",
        isStructural: false,
        requiresSupportSides: 2,
        canPlaceOn: ["wall_1x2", "wall_2x1", "pillar"]
    },
    roof_medium_slope: {
        id: "roof_medium_slope",
        name: "Telhado Inclinado M",
        width: 3,
        height: 1, // Peça simples de telhado inclinado
        weight: 8,
        maxSupport: 0,
        color: "#A52A2A", // Brown
        cssClass: "piece-roof",
        isStructural: false,
        requiresSupportSides: 2, // Precisa de 2 paredes de suporte
        canPlaceOn: ["wall_1x2", "wall_2x1", "pillar"],
        canRotate: false // Rotação de telhados pode ser complexa visualmente/logicamente
    },
    pillar: {
        id: "pillar",
        name: "Pilar",
        width: 1,
        height: 1, // Pilar pode ser empilhado
        weight: 4,
        maxSupport: 60,
        color: "#A0522D", // Sienna
        cssClass: "piece-pillar", // Adicionar essa classe no CSS
        isStructural: true,
        requiresSolidGround: true,
        canPlaceOn: ["foundation", "wall_1x2", "wall_2x1", "pillar"]
    },
    beam: {
        id: "beam",
        name: "Viga",
        width: 3, // Viga horizontal
        height: 1,
        weight: 6,
        maxSupport: 40, // Vigas suportam, mas também precisam de suporte
        color: "#8B4513", // SaddleBrown (mesma cor da porta, pode mudar)
        cssClass: "piece-beam", // Adicionar essa classe no CSS
        isStructural: true,
        requiresSolidGround: false, // Vigas são para vãos
        canPlaceOn: ["wall_1x2", "pillar"], // Tipicamente sobre paredes ou pilares
        requiresSupportSides: 2 // Vigas precisam de apoio nas extremidades
    }
};