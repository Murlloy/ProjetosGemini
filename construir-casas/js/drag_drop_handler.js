import { gridManager } from './grid_manager.js';
import { PIECE_DEFINITIONS } from './piece_definitions.js';
import { GRID_CELL_SIZE } from './config.js';

let draggedPieceType = null;
let dragOffsetX, dragOffsetY;
let ghostElement = null;

function createGhostElement(pieceType) {
    const pieceDef = PIECE_DEFINITIONS[pieceType];
    const ghost = document.createElement('div');
    ghost.style.position = 'absolute';
    ghost.style.pointerEvents = 'none'; // Não interfere com eventos do mouse abaixo
    ghost.style.opacity = '0.6';
    ghost.style.zIndex = '1000';
    ghost.style.width = `${pieceDef.width * GRID_CELL_SIZE}px`;
    ghost.style.height = `${pieceDef.height * GRID_CELL_SIZE}px`;
    ghost.style.backgroundColor = pieceDef.color || 'lightgray';
    ghost.classList.add('placed-piece', pieceDef.cssClass); // Usar classes para estilo
    document.body.appendChild(ghost);
    return ghost;
}


export const dragDropHandler = {
    init() {
        const pieceLibrary = document.getElementById('piece-library');
        const constructionArea = document.getElementById('construction-area');

        pieceLibrary.addEventListener('dragstart', (event) => {
            if (event.target.classList.contains('library-piece-preview') || event.target.closest('.library-piece')) {
                const pieceElement = event.target.closest('.library-piece');
                draggedPieceType = pieceElement.dataset.pieceType;
                // event.dataTransfer.setData('text/plain', draggedPieceType); // Não estritamente necessário se gerenciamos estado
                // event.dataTransfer.effectAllowed = 'move';

                // Cria o fantasma para melhor feedback visual
                if (ghostElement) ghostElement.remove();
                ghostElement = createGhostElement(draggedPieceType);
                
                // Oculta a imagem de arrastar padrão do navegador
                const emptyImage = new Image();
                event.dataTransfer.setDragImage(emptyImage, 0, 0);

                // Calcula offset do mouse dentro do elemento arrastado (fantasma)
                const rect = event.target.getBoundingClientRect(); // Use o preview para o offset
                dragOffsetX = event.clientX - rect.left;
                dragOffsetY = event.clientY - rect.top;

                // Posiciona o fantasma inicial
                ghostElement.style.left = `${event.pageX - dragOffsetX}px`;
                ghostElement.style.top = `${event.pageY - dragOffsetY}px`;
            }
        });
        
        // Usar document para dragover e drop para pegar o evento mesmo que o mouse saia da constructionArea
        document.addEventListener('dragover', (event) => {
            event.preventDefault(); // Necessário para permitir o drop
            if (ghostElement) {
                ghostElement.style.left = `${event.pageX - dragOffsetX}px`;
                ghostElement.style.top = `${event.pageY - dragOffsetY}px`;

                const constructionAreaRect = constructionArea.getBoundingClientRect();
                const isOverConstructionArea = 
                    event.clientX >= constructionAreaRect.left &&
                    event.clientX <= constructionAreaRect.right &&
                    event.clientY >= constructionAreaRect.top &&
                    event.clientY <= constructionAreaRect.bottom;

                if (isOverConstructionArea) {
                    const { gridX, gridY } = gridManager.getGridCoordsFromMouse(event.clientX, event.clientY);
                    const pieceDef = PIECE_DEFINITIONS[draggedPieceType];
                    
                    // Snap visual do fantasma
                    ghostElement.style.left = `${constructionAreaRect.left + gridX * GRID_CELL_SIZE}px`;
                    ghostElement.style.top = `${constructionAreaRect.top + gridY * GRID_CELL_SIZE}px`;

                    if (gridManager.canPlacePieceAt(draggedPieceType, gridX, gridY, pieceDef.width, pieceDef.height)) {
                        ghostElement.style.borderColor = 'green';
                        ghostElement.style.outline = '2px solid green';
                    } else {
                        ghostElement.style.borderColor = 'red';
                        ghostElement.style.outline = '2px solid red';
                    }
                } else {
                     ghostElement.style.borderColor = 'transparent'; // Ou cor original
                     ghostElement.style.outline = 'none';
                }
            }
        });

        document.addEventListener('dragend', () => {
            if (ghostElement) {
                ghostElement.remove();
                ghostElement = null;
            }
            draggedPieceType = null;
        });

        constructionArea.addEventListener('drop', (event) => {
            event.preventDefault();
            if (draggedPieceType) {
                const { gridX, gridY } = gridManager.getGridCoordsFromMouse(event.clientX, event.clientY);
                gridManager.addPiece(draggedPieceType, gridX, gridY);
                // draggedPieceType = null; // Resetado no dragend
            }
            if (ghostElement) {
                ghostElement.remove();
                ghostElement = null;
            }
        });
    }
};

