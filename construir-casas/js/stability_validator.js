import { gridManager } from './grid_manager.js';
import { PIECE_DEFINITIONS } from './piece_definitions.js';
import { GRID_ROWS, GRID_COLS, MAX_WALL_HEIGHT_SUPPORT } from './config.js';
import { uiController } from './ui_controller.js';

export const stabilityValidator = {
    testStability() {
        const pieces = gridManager.getAllPlacedPieces();
        let overallStable = true;
        let messages = [];

        // Resetar status de instabilidade
        pieces.forEach(p => {
            p.isUnstable = false;
            p.unstableReason = "";
            if (p.element) p.element.classList.remove('unstable', 'potentially-unstable');
        });

        if (pieces.length === 0) {
            messages.push("Nenhuma peça construída.");
            uiController.updateStabilityStatus(true, messages);
            return true;
        }

        // Ordenar peças de baixo para cima, esquerda para direita para processar suportes primeiro
        pieces.sort((a, b) => {
            if (a.gridY + a.currentHeight !== b.gridY + b.currentHeight) {
                return (b.gridY + b.currentHeight) - (a.gridY + a.currentHeight); // Mais baixo primeiro
            }
            return a.gridX - b.gridX;
        });
        
        pieces.forEach(piece => {
            const pieceDef = PIECE_DEFINITIONS[piece.type];
            let currentPieceStable = true;
            let unstableReason = "";

            // 1. Checar suporte abaixo (FUNDAMENTAL)
            if (piece.gridY + piece.currentHeight < GRID_ROWS) { // Não está no chão do grid
                let hasDirectSupport = false;
                if (pieceDef.requiresSolidGround || pieceDef.isStructural || pieceDef.type === 'door') { // Peças que precisam de apoio sólido
                    for (let c = 0; c < piece.currentWidth; c++) {
                        const supportingPiece = gridManager.getPieceAt(piece.gridX + c, piece.gridY + piece.currentHeight);
                        if (supportingPiece && PIECE_DEFINITIONS[supportingPiece.type].isStructural) {
                            if (!supportingPiece.isUnstable) { // Só conta se a peça de suporte for estável
                                hasDirectSupport = true;
                                break;
                            }
                        }
                    }
                    if (!hasDirectSupport) {
                        currentPieceStable = false;
                        unstableReason = `Peça '${pieceDef.name}' (${piece.id}) está flutuando ou sobre suporte instável.`;
                    }
                }
            } else { // Está no chão do grid, considerado apoiado
                // Se for fundação, ok. Se for parede, ok.
            }

            // 2. Janelas não podem sustentar peso e devem estar em paredes
            if (pieceDef.type === 'window') {
                // Checar se há peças diretamente acima da janela
                for (let c = 0; c < piece.currentWidth; c++) {
                    const pieceAbove = gridManager.getPieceAt(piece.gridX + c, piece.gridY - 1);
                    if (pieceAbove) {
                        currentPieceStable = false;
                        unstableReason = `Janela (${piece.id}) não pode sustentar peças acima.`;
                        break;
                    }
                }
                // Checar se está em uma parede (simplificado: se tem algo dos lados ou abaixo que seja parede)
                // Uma validação mais complexa checaria se as células que a janela ocupa *deveriam* ser uma parede.
                // Por ora, se ela passou no teste de 'flutuar', e está sobre uma parede (checkado em 'canPlaceOn' no futuro), ok.
            }
            
            // 3. Telhados precisam de paredes de suporte nas laterais
            if (pieceDef.type === 'roof' && currentPieceStable) { // Só checa telhado se ele não estiver flutuando
                const requiredSupports = pieceDef.requiresSupportSides || 2;
                let supportCount = 0;
                // Checa suporte na extremidade esquerda
                const leftSupport = gridManager.getPieceAt(piece.gridX -1, piece.gridY + piece.currentHeight -1 ); // Verifica se tem parede no canto inferior esquerdo
                const effectiveLeftSupport = gridManager.getPieceAt(piece.gridX, piece.gridY + piece.currentHeight -1); // A propria celula abaixo da ponta esquerda
                
                if ((effectiveLeftSupport && PIECE_DEFINITIONS[effectiveLeftSupport.type].isStructural && !effectiveLeftSupport.isUnstable) ||
                    (leftSupport && PIECE_DEFINITIONS[leftSupport.type].isStructural && !leftSupport.isUnstable && leftSupport.gridY + PIECE_DEFINITIONS[leftSupport.type].height === piece.gridY + piece.currentHeight)) {
                     supportCount++;
                }

                // Checa suporte na extremidade direita
                const rightSupport = gridManager.getPieceAt(piece.gridX + piece.currentWidth, piece.gridY + piece.currentHeight-1); // Verifica se tem parede no canto inferior direito
                const effectiveRightSupport = gridManager.getPieceAt(piece.gridX + piece.currentWidth -1, piece.gridY + piece.currentHeight -1); // A propria celula abaixo da ponta direita

                if ((effectiveRightSupport && PIECE_DEFINITIONS[effectiveRightSupport.type].isStructural && !effectiveRightSupport.isUnstable) ||
                    (rightSupport && PIECE_DEFINITIONS[rightSupport.type].isStructural && !rightSupport.isUnstable && rightSupport.gridY + PIECE_DEFINITIONS[rightSupport.type].height === piece.gridY + piece.currentHeight)) {
                    supportCount++;
                }

                if (supportCount < requiredSupports) {
                    currentPieceStable = false;
                    unstableReason = `Telhado (${piece.id}) não tem ${requiredSupports} paredes de suporte estáveis. Encontrado(s): ${supportCount}.`;
                }
            }

            // 4. Paredes não podem sustentar mais de X blocos acima (simplificado para altura total da pilha de paredes)
            if (pieceDef.type === 'wall' && currentPieceStable) {
                let wallStackHeight = 0;
                let currentWall = piece;
                while(currentWall && PIECE_DEFINITIONS[currentWall.type].type === 'wall') {
                    wallStackHeight += currentWall.currentHeight; // Assumindo altura em unidades
                    const wallBelow = gridManager.getPieceAt(currentWall.gridX, currentWall.gridY + currentWall.currentHeight);
                    if(wallBelow && PIECE_DEFINITIONS[wallBelow.type].type === 'wall'){
                        currentWall = wallBelow;
                    } else {
                        break; // Atingiu base ou outra peça
                    }
                }
                // Esta lógica está um pouco invertida. Deveríamos checar de cima para baixo o peso.
                // Simplificação: Limitar a altura de uma coluna de paredes.
                // Vamos contar quantas paredes estão *diretamente* acima desta, e se esta parede está muito alta na pilha.
                let heightAboveFoundation = 0;
                let basePiece = piece;
                let iterations = 0; // Safety break
                while(basePiece && PIECE_DEFINITIONS[basePiece.type].type === 'wall' && iterations < GRID_ROWS) {
                    const pieceBelow = gridManager.getPieceAt(basePiece.gridX, basePiece.gridY + basePiece.currentHeight);
                    if (pieceBelow && PIECE_DEFINITIONS[pieceBelow.type].type === 'wall') {
                        heightAboveFoundation += PIECE_DEFINITIONS[pieceBelow.type].height;
                        basePiece = pieceBelow;
                    } else if (pieceBelow && PIECE_DEFINITIONS[pieceBelow.type].isFoundation) {
                        break; // Chegou na fundação
                    } else if (!pieceBelow && (basePiece.gridY + basePiece.currentHeight === GRID_ROWS)) {
                        break; // Chegou no chão
                    }
                     else {
                        // Flutuando ou sobre algo não estrutural (já deveria ter sido pego)
                        // Ou a pilha não começa com fundação/chão.
                        // Para esta regra, focamos na altura da pilha de paredes.
                        break; 
                    }
                    iterations++;
                }
                
                // A altura da parede atual na pilha (contando de baixo para cima)
                let currentWallStackLevel = 0;
                let p = piece;
                while(p) {
                    const pDef = PIECE_DEFINITIONS[p.type];
                    if (pDef.type === 'wall') currentWallStackLevel++; else break;
                    // Pega a parede abaixo desta. Se for fundação ou chão, para.
                    let supported = false;
                    for(let c_support = 0; c_support < p.currentWidth; c_support++) {
                        const under = gridManager.getPieceAt(p.gridX + c_support, p.gridY + p.currentHeight);
                        if (under && PIECE_DEFINITIONS[under.type].type === 'wall') {
                            p = under;
                            supported = true;
                            break;
                        }
                    }
                    if (!supported) p = null; // Sai do loop
                }


                if (currentWallStackLevel > MAX_WALL_HEIGHT_SUPPORT) {
                    // Este é o número de paredes empilhadas, não a altura total em unidades.
                    // Ex: Se MAX_WALL_HEIGHT_SUPPORT = 2, pode ter fundação + parede1 + parede2.
                    // A terceira parede (nível 3) seria instável.
                    // currentPieceStable = false;
                    // unstableReason = `Parede (${piece.id}) excede a altura máxima de empilhamento de ${MAX_WALL_HEIGHT_SUPPORT} paredes.`;
                    // Esta regra é complexa de implementar corretamente sem um cálculo de carga mais robusto.
                    // Por ora, vamos focar no apoio direto e telhados.
                }
            }

            // 5. Checar se uma peça que requer "host" (ex: janela) está corretamente colocada
            if (pieceDef.requiresHost && currentPieceStable) {
                // Exemplo para janela: deve estar numa parede.
                // Checa se as células que a janela ocupa estariam ocupadas por uma parede válida se a janela não estivesse lá.
                // Isso é mais complicado. Por agora, assumimos que `canPlacePieceAt` e o suporte básico cuidam disso.
                // Uma validação melhor: a janela está em uma célula onde uma parede poderia estar,
                // e essa parede tem suporte.
                let hostFound = false;
                // A janela deve estar 'dentro' de uma parede
                // Uma forma simples é checar se abaixo dela há uma parede que poderia suportá-la
                const pieceBelow = gridManager.getPieceAt(piece.gridX, piece.gridY + piece.currentHeight);
                if (pieceBelow && PIECE_DEFINITIONS[pieceBelow.type].type === 'wall' && !pieceBelow.isUnstable) {
                    hostFound = true;
                }
                // Ou se faz parte de uma parede maior (janela no meio de uma parede 2x2, por ex)
                // Esta lógica é simplificada. Idealmente, a janela substitui parte de uma parede.
                if (!hostFound && pieceDef.id === 'window') {
                    // Tenta ver se tem parede em volta
                    const left = gridManager.getPieceAt(piece.gridX -1, piece.gridY);
                    const right = gridManager.getPieceAt(piece.gridX + piece.currentWidth, piece.gridY);
                    if ((left && PIECE_DEFINITIONS[left.type].type === 'wall') || (right && PIECE_DEFINITIONS[right.type].type === 'wall')) {
                        hostFound = true;
                    }
                }


                if (!hostFound && pieceDef.id === 'window') { // Aplicar apenas para janelas por enquanto
                   // currentPieceStable = false;
                   // unstableReason = `Peça '${pieceDef.name}' (${piece.id}) requer uma peça hospedeira válida (ex: parede).`;
                }
            }


            if (!currentPieceStable) {
                piece.isUnstable = true;
                piece.unstableReason = unstableReason;
                if (piece.element) piece.element.classList.add('unstable');
                messages.push(unstableReason);
                overallStable = false;
            }
        });
        
        // Segunda passada: propagar instabilidade (se A suporta B e A cai, B também cai)
        // Isso é complexo. Uma forma mais simples é que se uma peça de suporte está marcada como instável,
        // as peças acima dela que dependem dela também se tornam instáveis.
        // A ordenação já ajuda um pouco, mas uma propagação explícita seria melhor.
        // Por simplicidade, a checagem de `!supportingPiece.isUnstable` já faz uma propagação implícita.

        uiController.updateStabilityStatus(overallStable, messages);
        return overallStable;
    }
};