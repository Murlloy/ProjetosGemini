import { GRID_COLS, GRID_ROWS, GRID_CELL_SIZE } from './config.js';
import { PIECE_DEFINITIONS } from './piece_definitions.js';
import { uiController } from './ui_controller.js';

let gridData = []; // Array de objetos de peças colocadas (ou null)
let placedPieces = new Map(); // Map de id único para objeto da peça colocada
let nextPieceId = 0;
let showGridLines = true;

export const gridManager = {
    init() {
        const constructionArea = document.getElementById('construction-area');
        constructionArea.style.width = `${GRID_COLS * GRID_CELL_SIZE}px`;
        constructionArea.style.height = `${GRID_ROWS * GRID_CELL_SIZE}px`;
        constructionArea.style.gridTemplateColumns = `repeat(${GRID_COLS}, ${GRID_CELL_SIZE}px)`;
        constructionArea.style.gridTemplateRows = `repeat(${GRID_ROWS}, ${GRID_CELL_SIZE}px)`;

        gridData = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
        this.toggleGridLines(showGridLines);

        // Adicionar listener para seleção de peças no grid
        constructionArea.addEventListener('click', (event) => {
            if (event.target.classList.contains('placed-piece')) {
                this.selectPiece(event.target.dataset.id);
            } else {
                this.selectPiece(null); // Desselecionar se clicar fora
            }
        });

        document.addEventListener('keydown', (event) => {
            if (this.selectedPieceId) {
                if (event.key === 'r' || event.key === 'R') {
                    this.rotateSelectedPiece();
                } else if (event.key === 'Delete' || event.key === 'Backspace') {
                    this.removePiece(this.selectedPieceId);
                    this.selectPiece(null);
                }
            }
        });
    },

    selectedPieceId: null,

    selectPiece(pieceId) {
        if (this.selectedPieceId) {
            const oldSelected = placedPieces.get(this.selectedPieceId);
            if (oldSelected && oldSelected.element) {
                oldSelected.element.classList.remove('selected');
            }
        }
        this.selectedPieceId = pieceId;
        if (this.selectedPieceId) {
            const newSelected = placedPieces.get(this.selectedPieceId);
            if (newSelected && newSelected.element) {
                newSelected.element.classList.add('selected');
            }
        }
        console.log("Selected piece:", this.selectedPieceId);
    },

    rotateSelectedPiece() {
        if (!this.selectedPieceId) return;
        const piece = placedPieces.get(this.selectedPieceId);
        if (!piece || !PIECE_DEFINITIONS[piece.type].canRotate) return;

        const oldRotation = piece.rotation || 0;
        const newRotation = (oldRotation + 90) % 360; // Simples rotação de 90 graus

        const originalWidth = piece.currentWidth;
        const originalHeight = piece.currentHeight;

        // "Descoloca" a peça temporariamente para checar colisão
        this.removePieceFromGridData(piece.id);

        let newWidth = originalWidth;
        let newHeight = originalHeight;

        // Se rotação for 90 ou 270, inverte dimensões
        if (newRotation === 90 || newRotation === 270) {
            newWidth = PIECE_DEFINITIONS[piece.type].height;
            newHeight = PIECE_DEFINITIONS[piece.type].width;
        } else { // 0 ou 180
            newWidth = PIECE_DEFINITIONS[piece.type].width;
            newHeight = PIECE_DEFINITIONS[piece.type].height;
        }
        
        if (this.canPlacePieceAt(piece.type, piece.gridX, piece.gridY, newWidth, newHeight, piece.id)) {
            piece.rotation = newRotation;
            piece.currentWidth = newWidth;
            piece.currentHeight = newHeight;
            this.addPieceToGridData(piece); // Recoloca com novas dimensões/rotação
            uiController.updatePieceElement(piece);
            uiController.updateHUD(placedPieces); // Atualiza HUD se necessário
        } else {
            // Não pode rotacionar, volta ao estado anterior
            this.addPieceToGridData(piece); // Recoloca com dimensões antigas
            alert("Não é possível rotacionar: espaço ocupado ou fora dos limites.");
        }
    },

    toggleGridLines(forceState) {
        const constructionArea = document.getElementById('construction-area');
        if (typeof forceState === 'boolean') {
            showGridLines = forceState;
        } else {
            showGridLines = !showGridLines;
        }

        // Limpa divs de grid antigas
        constructionArea.querySelectorAll('.grid-cell-visual').forEach(cell => cell.remove());

        if (showGridLines) {
            constructionArea.classList.remove('grid-hidden');
            for (let r = 0; r < GRID_ROWS; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    const cellDiv = document.createElement('div');
                    cellDiv.classList.add('grid-cell-visual');
                    cellDiv.style.gridColumnStart = c + 1;
                    cellDiv.style.gridRowStart = r + 1;
                    constructionArea.appendChild(cellDiv);
                }
            }
        } else {
            constructionArea.classList.add('grid-hidden');
        }
    },

    getGridCoordsFromMouse(mouseX, mouseY) {
        const rect = document.getElementById('construction-area').getBoundingClientRect();
        const x = mouseX - rect.left;
        const y = mouseY - rect.top;

        const gridX = Math.floor(x / GRID_CELL_SIZE);
        const gridY = Math.floor(y / GRID_CELL_SIZE);

        return { gridX, gridY };
    },

    canPlacePieceAt(pieceType, gridX, gridY, pieceWidth, pieceHeight, ignorePieceId = null) {
        const pieceDef = PIECE_DEFINITIONS[pieceType];

        // 1. Checar limites do grid
        if (gridX < 0 || gridY < 0 || gridX + pieceWidth > GRID_COLS || gridY + pieceHeight > GRID_ROWS) {
            // console.warn("Tentativa de colocar fora dos limites.");
            return false;
        }

        // 2. Checar sobreposição
        for (let r = 0; r < pieceHeight; r++) {
            for (let c = 0; c < pieceWidth; c++) {
                const cellContent = gridData[gridY + r][gridX + c];
                if (cellContent && cellContent !== ignorePieceId) {
                    // console.warn("Tentativa de sobrepor peça.");
                    return false; // Célula já ocupada por outra peça
                }
            }
        }
        
        // 3. Checar se é fundação e está no chão
        if (pieceDef.isFoundation && gridY + pieceHeight < GRID_ROWS) {
             // console.warn("Fundação deve ser colocada no chão do grid (linha mais baixa).");
            //  return false; // Fundações apenas na última linha disponível
            // Ajuste: Fundação pode ser colocada em qualquer lugar, mas só é "válida" no chão
        }

        // 4. Peças que precisam de "host" (ex: janela em parede)
        if (pieceDef.requiresHost) {
            // Para janelas, simplificamos: ela ocupa o espaço. A validação de estar DENTRO de uma parede
            // seria mais complexa (checar se a parede existe ao redor). Por ora, apenas se o espaço está livre.
            // Uma validação mais robusta checaria se gridData[gridY][gridX] contém uma parede.
            // Para agora, vamos assumir que a validação de suporte cuidará disso.
        }

        return true;
    },

    addPiece(pieceType, gridX, gridY) {
        const pieceDef = PIECE_DEFINITIONS[pieceType];
        const pieceWidth = pieceDef.width;
        const pieceHeight = pieceDef.height;

        if (!this.canPlacePieceAt(pieceType, gridX, gridY, pieceWidth, pieceHeight)) {
            uiController.showTemporaryMessage("Não é possível colocar a peça aqui!", "error");
            return null;
        }

        const uniqueId = `piece-${nextPieceId++}`;
        const newPiece = {
            id: uniqueId,
            type: pieceType,
            gridX,
            gridY,
            initialWidth: pieceDef.width, // Largura base da definição
            initialHeight: pieceDef.height, // Altura base da definição
            currentWidth: pieceDef.width,   // Largura atual (pode mudar com rotação)
            currentHeight: pieceDef.height, // Altura atual (pode mudar com rotação)
            rotation: 0, // em graus
            weight: pieceDef.weight,
            element: null, // DOM element será criado por uiController
            isUnstable: false
        };

        placedPieces.set(uniqueId, newPiece);
        this.addPieceToGridData(newPiece);
        
        newPiece.element = uiController.renderPlacedPiece(newPiece);
        uiController.updateHUD(placedPieces);
        return newPiece;
    },

    addPieceToGridData(piece) {
        for (let r = 0; r < piece.currentHeight; r++) {
            for (let c = 0; c < piece.currentWidth; c++) {
                if (gridData[piece.gridY + r] && gridData[piece.gridY + r][piece.gridX + c] !== undefined) {
                    gridData[piece.gridY + r][piece.gridX + c] = piece.id;
                }
            }
        }
    },

    removePieceFromGridData(pieceId) {
        const piece = placedPieces.get(pieceId);
        if (!piece) return;

        for (let r = 0; r < piece.currentHeight; r++) {
            for (let c = 0; c < piece.currentWidth; c++) {
                if (gridData[piece.gridY + r] && gridData[piece.gridY + r][piece.gridX + c] === pieceId) {
                    gridData[piece.gridY + r][piece.gridX + c] = null;
                }
            }
        }
    },

    removePiece(pieceId) {
        const piece = placedPieces.get(pieceId);
        if (piece) {
            this.removePieceFromGridData(pieceId);
            if (piece.element) {
                piece.element.remove();
            }
            placedPieces.delete(pieceId);
            uiController.updateHUD(placedPieces);
            if (this.selectedPieceId === pieceId) {
                this.selectPiece(null);
            }
        }
    },

    getPieceAt(gridX, gridY) {
        if (gridY < 0 || gridY >= GRID_ROWS || gridX < 0 || gridX >= GRID_COLS) return null;
        const pieceId = gridData[gridY][gridX];
        return pieceId ? placedPieces.get(pieceId) : null;
    },

    getAllPlacedPieces() {
        return Array.from(placedPieces.values());
    },

    clearAllPieces() {
        placedPieces.forEach(piece => {
            if (piece.element) piece.element.remove();
        });
        placedPieces.clear();
        gridData = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
        nextPieceId = 0;
        this.selectPiece(null);
        uiController.updateHUD(placedPieces);
        uiController.clearStabilityMessages();
    },

    getGridData() {
        return gridData;
    }
};