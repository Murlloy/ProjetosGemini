import { gridManager } from './grid_manager.js';
import { dragDropHandler } from './drag_drop_handler.js';
import { stabilityValidator } from './stability_validator.js';
import { uiController } from './ui_controller.js';

document.addEventListener('DOMContentLoaded', () => {
    uiController.init();
    gridManager.init();
    dragDropHandler.init();

    const testStabilityBtn = document.getElementById('test-stability-btn');
    testStabilityBtn.addEventListener('click', () => {
        stabilityValidator.testStability();
    });

    const toggleGridBtn = document.getElementById('toggle-grid-btn');
    toggleGridBtn.addEventListener('click', () => {
        gridManager.toggleGridLines();
    });

    // Exemplo: Botão para limpar tudo (para facilitar testes)
    const clearAllBtn = document.createElement('button');
    clearAllBtn.textContent = "Limpar Tudo";
    clearAllBtn.addEventListener('click', () => {
        gridManager.clearAllPieces();
    });
    document.getElementById('controls').appendChild(clearAllBtn);

    console.log("Construtor de Casas Inicializado!");
    uiController.updateHUD(new Map()); // Inicializa HUD
});