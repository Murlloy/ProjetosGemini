document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const dinoEmojiDisplay = document.getElementById('dino-emoji'); // ALTERADO
    const dinoMessage = document.getElementById('dino-message');

    const hungerBar = document.getElementById('hunger-bar');
    const thirstBar = document.getElementById('thirst-bar');
    const happinessBar = document.getElementById('happiness-bar');

    const hungerValueDisplay = document.getElementById('hunger-value');
    const thirstValueDisplay = document.getElementById('thirst-value');
    const happinessValueDisplay = document.getElementById('happiness-value');

    const feedButton = document.getElementById('feed-button');
    const waterButton = document.getElementById('water-button');
    const playButton = document.getElementById('play-button');
    const restartButton = document.getElementById('restart-button');

    // Emojis do Dinossauro (escolha os seus favoritos!)
    const dinoEmojis = { // ALTERADO
        happy: '🦖',     // T-Rex (ou 🦕 Sauropod)
        neutral: '😐',   // Pode ser um emoji de dinossauro diferente ou uma face
        sad: '🥺',       // Ou 😥
        dead: '💀'       // Ou 👻 ou 😵
    };

    // Estado do Dinossauro
    let stats = {
        hunger: 100,
        thirst: 100,
        happiness: 100
    };

    let isGameOver = false;
    let gameInterval;

    const MAX_STAT = 100;
    const MIN_STAT = 0;

    // Funções de atualização
    function updateStatsDisplay() {
        hungerBar.style.width = stats.hunger + '%';
        thirstBar.style.width = stats.thirst + '%';
        happinessBar.style.width = stats.happiness + '%';

        hungerValueDisplay.textContent = Math.round(stats.hunger);
        thirstValueDisplay.textContent = Math.round(stats.thirst);
        happinessValueDisplay.textContent = Math.round(stats.happiness);

        updateBarColor(hungerBar, stats.hunger);
        updateBarColor(thirstBar, stats.thirst);
        updateBarColor(happinessBar, stats.happiness);

        updateDinoMood();
    }

    function updateBarColor(barElement, value) {
        if (value < 30) {
            barElement.style.backgroundColor = '#f44336'; // Vermelho
        } else if (value < 70) {
            barElement.style.backgroundColor = '#ffeb3b'; // Amarelo
        } else {
            barElement.style.backgroundColor = '#4caf50'; // Verde
        }
    }

    function updateDinoMood() {
        if (isGameOver) {
            dinoEmojiDisplay.textContent = dinoEmojis.dead; // ALTERADO
            return;
        }

        const averageStat = (stats.hunger + stats.thirst + stats.happiness) / 3;
        if (averageStat < 35 || stats.hunger < 20 || stats.thirst < 20 || stats.happiness < 20) {
            dinoEmojiDisplay.textContent = dinoEmojis.sad; // ALTERADO
        } else if (averageStat < 70) {
            dinoEmojiDisplay.textContent = dinoEmojis.neutral; // ALTERADO
        } else {
            dinoEmojiDisplay.textContent = dinoEmojis.happy; // ALTERADO
        }
    }

    function displayMessage(message, duration = 2000) {
        dinoMessage.textContent = message;
        if (duration > 0) {
            setTimeout(() => {
                if (!isGameOver) dinoMessage.textContent = "Como posso te ajudar?";
            }, duration);
        }
    }

    // Ações do jogador
    feedButton.addEventListener('click', () => {
        if (isGameOver) return;
        stats.hunger = Math.min(MAX_STAT, stats.hunger + 25);
        stats.happiness = Math.min(MAX_STAT, stats.happiness + 5);
        displayMessage("Yum! Que delícia!");
        updateStatsDisplay();
    });

    waterButton.addEventListener('click', () => {
        if (isGameOver) return;
        stats.thirst = Math.min(MAX_STAT, stats.thirst + 25);
        stats.happiness = Math.min(MAX_STAT, stats.happiness + 5);
        displayMessage("Ahhh! Refrescante!");
        updateStatsDisplay();
    });

    playButton.addEventListener('click', () => {
        if (isGameOver) return;
        stats.happiness = Math.min(MAX_STAT, stats.happiness + 20);
        stats.hunger = Math.max(MIN_STAT, stats.hunger - 5);
        stats.thirst = Math.max(MIN_STAT, stats.thirst - 5);
        displayMessage("Isso foi divertido!");
        updateStatsDisplay();
    });

    restartButton.addEventListener('click', startGame);

    // Lógica do jogo (passagem do tempo)
    function decreaseStats() {
        if (isGameOver) return;

        stats.hunger = Math.max(MIN_STAT, stats.hunger - 2);
        stats.thirst = Math.max(MIN_STAT, stats.thirst - 3);
        stats.happiness = Math.max(MIN_STAT, stats.happiness - 1.5);

        updateStatsDisplay();
        checkGameOver();
    }

    function checkGameOver() {
        if (stats.hunger <= MIN_STAT || stats.thirst <= MIN_STAT || stats.happiness <= MIN_STAT) {
            isGameOver = true;
            clearInterval(gameInterval);
            dinoEmojiDisplay.textContent = dinoEmojis.dead; // ALTERADO
            let reason = "";
            if(stats.hunger <= MIN_STAT) reason = "de fome";
            else if(stats.thirst <= MIN_STAT) reason = "de sede";
            else reason = "de tristeza";

            displayMessage(`Oh não! O dinossauro não sobreviveu ${reason}...`, 0);
            disableButtons();
            restartButton.style.display = 'block';
        }
    }

    function disableButtons() {
        feedButton.disabled = true;
        waterButton.disabled = true;
        playButton.disabled = true;
    }

    function enableButtons() {
        feedButton.disabled = false;
        waterButton.disabled = false;
        playButton.disabled = false;
    }

    // Iniciar o jogo
    function startGame() {
        isGameOver = false;
        stats = {
            hunger: 80,
            thirst: 75,
            happiness: 70
        };
        dinoEmojiDisplay.textContent = dinoEmojis.happy; // ALTERADO
        displayMessage("Olá! Cuide bem de mim!");
        enableButtons();
        restartButton.style.display = 'none';
        updateStatsDisplay();

        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(decreaseStats, 2000);
    }

    startGame();
});