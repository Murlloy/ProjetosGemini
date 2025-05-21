// js/ui_controller.js
import { PIECE_DEFINITIONS } from './piece_definitions.js';
import { GRID_CELL_SIZE } from './config.js';

export const uiController = {
    init() {
        this.populatePieceLibrary();
    },

    populatePieceLibrary() {
        const library = document.getElementById('piece-library');
        
        // --- DEBUGGING ---
        console.log("Tentando popular a biblioteca de peças.");
        if (!library) {
            console.error("ERRO: Elemento #piece-library não encontrado no DOM!");
            return;
        }
        console.log("Elemento #piece-library encontrado:", library);
        
        if (!PIECE_DEFINITIONS || Object.keys(PIECE_DEFINITIONS).length === 0) {
            console.error("ERRO: PIECE_DEFINITIONS está vazio ou indefinido!");
            return;
        }
        console.log("PIECE_DEFINITIONS carregadas:", PIECE_DEFINITIONS);
        // --- FIM DEBUGGING ---

        library.innerHTML = ''; // Limpa antes de popular

        for (const typeKey in PIECE_DEFINITIONS) { // typeKey será 'foundation', 'wall_1x2', etc.
            const pieceDef = PIECE_DEFINITIONS[typeKey];
            
            // --- DEBUGGING ---
            console.log(`Criando peça na biblioteca: ${pieceDef.name} (ID: ${typeKey})`);
            // --- FIM DEBUGGING ---

            const pieceDiv = document.createElement('div');
            pieceDiv.classList.add('library-piece');
            pieceDiv.dataset.pieceType = typeKey; // Usar a chave do objeto (ID único da definição)

            const nameSpan = document.createElement('span');
            nameSpan.textContent = pieceDef.name;
            pieceDiv.appendChild(nameSpan);

            const previewDiv = document.createElement('div');
            previewDiv.classList.add('library-piece-preview');
            // Adiciona a classe CSS específica da peça para estilo (ex: .piece-wall)
            if (pieceDef.cssClass) {
                previewDiv.classList.add(pieceDef.cssClass);
            }
            // Aplica dimensões e cor para o preview
            // Usar um tamanho um pouco menor para a biblioteca
            const previewScale = 0.6;
            previewDiv.style.width = `${pieceDef.width * GRID_CELL_SIZE * previewScale}px`;
            previewDiv.style.height = `${pieceDef.height * GRID_CELL_SIZE * previewScale}px`;
            
            // A cor pode vir da classe CSS ou ser definida diretamente aqui como fallback
            if (!pieceDef.cssClass) { // Se não houver classe CSS específica, usa a cor definida
                previewDiv.style.backgroundColor = pieceDef.color || 'lightgray';
            } else {
                // Se tem cssClass, a cor já deve ser aplicada por ela.
                // Mas podemos definir aqui para garantir, se a classe não tiver background-color.
                 previewDiv.style.backgroundColor = pieceDef.color;
            }


            previewDiv.draggable = true; // Tornar o preview arrastável
            pieceDiv.appendChild(previewDiv);
            
            library.appendChild(pieceDiv);
        }
        console.log("Biblioteca de peças populada.");
    },

    // ... (resto do ui_controller.js permanece o mesmo)
    renderPlacedPiece(piece) {
        const pieceDef = PIECE_DEFINITIONS[piece.type]; // piece.type deve corresponder às chaves em PIECE_DEFINITIONS
        const constructionArea = document.getElementById('construction-area');
        const pieceElement = document.createElement('div');

        pieceElement.classList.add('placed-piece');
        if (pieceDef.cssClass) { // Adiciona a classe CSS principal da peça
            pieceElement.classList.add(pieceDef.cssClass);
        }
        pieceElement.dataset.id = piece.id;
        pieceElement.dataset.pieceTypeDefinition = piece.type; // Guarda o tipo da definição original

        pieceElement.style.left = `${piece.gridX * GRID_CELL_SIZE}px`;
        pieceElement.style.top = `${piece.gridY * GRID_CELL_SIZE}px`;
        pieceElement.style.width = `${piece.currentWidth * GRID_CELL_SIZE}px`;
        pieceElement.style.height = `${piece.currentHeight * GRID_CELL_SIZE}px`;
        
        // A cor deve vir da classe CSS. Se não, usa a cor da definição.
        if (!pieceDef.cssClass) {
            pieceElement.style.backgroundColor = pieceDef.color;
        } else {
            // Para garantir que a cor da definição sobreponha a cor padrão de .placed-piece se necessário,
            // e permita que a classe .piece-xxx defina a cor final.
            pieceElement.style.backgroundColor = pieceDef.color;
        }

        pieceElement.style.transform = `rotate(${piece.rotation || 0}deg)`;

        if (piece.isUnstable) {
            pieceElement.classList.add('unstable');
        }

        constructionArea.appendChild(pieceElement);
        return pieceElement;
    },

    updatePieceElement(piece) {
        if (!piece.element) return;
        const pieceDef = PIECE_DEFINITIONS[piece.type];
        piece.element.style.left = `${piece.gridX * GRID_CELL_SIZE}px`;
        piece.element.style.top = `${piece.gridY * GRID_CELL_SIZE}px`;
        piece.element.style.width = `${piece.currentWidth * GRID_CELL_SIZE}px`;
        piece.element.style.height = `${piece.currentHeight * GRID_CELL_SIZE}px`;
        piece.element.style.transform = `rotate(${piece.rotation || 0}deg)`;
        
        // Assegura que a classe CSS correta da definição está presente
        if (pieceDef.cssClass && !piece.element.classList.contains(pieceDef.cssClass)) {
            // Limpa classes de peça antigas se necessário, mas é mais complexo
            // Por agora, apenas adiciona.
            piece.element.classList.add(pieceDef.cssClass);
        }
        // E a cor
        if (!pieceDef.cssClass || piece.element.style.backgroundColor !== pieceDef.color) {
             piece.element.style.backgroundColor = pieceDef.color;
        }


        piece.element.classList.toggle('unstable', !!piece.isUnstable);
    },

    updateHUD(placedPiecesMap) { // Recebe o Map de peças
        const pieceCount = placedPiecesMap.size;
        let totalWeight = 0;
        placedPiecesMap.forEach(piece => {
            // Certifique-se de que piece.type é uma chave válida em PIECE_DEFINITIONS
            if (PIECE_DEFINITIONS[piece.type]) {
                totalWeight += PIECE_DEFINITIONS[piece.type].weight;
            } else {
                console.warn(`Definição não encontrada para peça tipo: ${piece.type} no HUD.`);
            }
        });

        document.getElementById('hud-piece-count').textContent = pieceCount;
        document.getElementById('hud-total-weight').textContent = totalWeight;
    },

    updateStabilityStatus(isStable, messages = []) {
        const statusEl = document.getElementById('hud-status');
        const messagesEl = document.getElementById('hud-messages');
        
        statusEl.textContent = isStable ? "Estável!" : "Instável!";
        statusEl.style.color = isStable ? "green" : "red";

        messagesEl.innerHTML = '';
        if (messages.length > 0) {
            const ul = document.createElement('ul');
            messages.forEach(msg => {
                const li = document.createElement('li');
                li.textContent = msg;
                ul.appendChild(li);
            });
            messagesEl.appendChild(ul);
        } else if (isStable && document.getElementById('hud-piece-count').textContent !== "0") { // Se estável e tem peças
            messagesEl.textContent = "Nenhum problema estrutural encontrado.";
        } else if (document.getElementById('hud-piece-count').textContent === "0") { // Se estável e sem peças
             messagesEl.textContent = "";
        }
    },
    
    clearStabilityMessages() {
        const statusEl = document.getElementById('hud-status');
        const messagesEl = document.getElementById('hud-messages');
        statusEl.textContent = "Pronto";
        statusEl.style.color = "inherit"; // Cor padrão do texto
        messagesEl.innerHTML = '';
    },

    showTemporaryMessage(message, type = "info") { // type: info, error, success
        const tipsEl = document.getElementById('hud-tips');
        const originalTip = "Selecione e arraste peças."; // Dica padrão
        tipsEl.textContent = message;
        tipsEl.style.color = type === "error" ? "red" : (type === "success" ? "green" : "blue");
        setTimeout(() => {
            tipsEl.textContent = originalTip;
            tipsEl.style.color = ""; // Cor padrão do texto
        }, 3000);
    }
};