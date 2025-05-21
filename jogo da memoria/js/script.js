document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const startScreen = document.getElementById('start-screen');
    const endScreen = document.getElementById('end-screen');
    const startGameButton = document.getElementById('start-game-button');
    const playAgainButton = document.getElementById('play-again-button');
    const finalScoreDisplay = document.getElementById('final-score');
    const finalTimeDisplay = document.getElementById('final-time');
    const endMessageDisplay = document.getElementById('end-message');
    const endAnimationContainer = document.getElementById('end-animation-container');

    // Configurações do Jogo
    // Em vez de nomes de arquivos, usaremos emojis como "desenhos"
    const cardDesigns = [
        '🌟', '❤️', '🌙', '☀️',
        '🍎', '🚀', '🎉', '🧩'
        // Para 8 pares, precisamos de 8 designs únicos.
    ];
    // Se você quiser usar imagens, volte para algo como:
    // const cardImages = [
    //     'icon1.png', 'icon2.png', 'icon3.png', 'icon4.png',
    //     'icon5.png', 'icon6.png', 'icon7.png', 'icon8.png'
    // ];
    // const imagePath = 'images/';

    const gameDuration = 120; // 2 minutos em segundos
    const pointsPerMatch = 100;
    const pointsPerMismatch = -25;

    // Variáveis de Estado do Jogo
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let score = 0;
    let timeLeft = gameDuration;
    let timerInterval;
    let gameActive = false;
    let firstCardFlipped = false;

    // --- Funções do Jogo ---

    // 1. Inicializar e Embaralhar o Tabuleiro
    function initializeBoard() {
        gameBoard.innerHTML = '';
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        score = 0;
        timeLeft = gameDuration;
        firstCardFlipped = false;
        gameActive = true;

        updateScoreDisplay();
        updateTimerDisplay();

        // Duplica os designs para formar pares e embaralha
        const gameElements = [...cardDesigns, ...cardDesigns];
        shuffleArray(gameElements);

        gameElements.forEach(design => {
            const cardElement = createCardElement(design);
            gameBoard.appendChild(cardElement);
            cards.push(cardElement);
        });
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createCardElement(designContent) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.design = designContent; // Usamos 'design' para o conteúdo da carta

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');
        // O verso da carta (card-front) pode ter uma imagem de fundo definida no CSS

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-face', 'card-back');
        cardBack.textContent = designContent; // Coloca o emoji/desenho aqui
        // Estilos para o emoji (podem ser melhorados/movidos para CSS)
        // O CSS já tem display:flex, align-items:center, justify-content:center
        // e um font-size responsivo adicionado abaixo na seção CSS.

        card.appendChild(cardFront);
        card.appendChild(cardBack);

        card.addEventListener('click', () => handleCardClick(card));
        return card;
    }
    /*
    // Se você voltar a usar IMAGENS, a função createCardElement seria assim:
    function createCardElement(imageName) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = imageName; // Guarda o nome da imagem para comparação

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-face', 'card-back');
        const img = document.createElement('img');
        img.src = `${imagePath}${imageName}`; // imagePath definido no topo
        img.alt = imageName.split('.')[0];
        cardBack.appendChild(img);

        card.appendChild(cardFront);
        card.appendChild(cardBack);

        card.addEventListener('click', () => handleCardClick(card));
        return card;
    }
    */


    function handleCardClick(clickedCard) {
        if (!gameActive || clickedCard.classList.contains('flipped') || clickedCard.classList.contains('matched') || flippedCards.length >= 2) {
            return;
        }

        if (!firstCardFlipped) {
            startTimer();
            firstCardFlipped = true;
        }

        clickedCard.classList.add('flipped');
        flippedCards.push(clickedCard);

        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;
        const isMatch = card1.dataset.design === card2.dataset.design; // Compara 'design'

        if (isMatch) {
            score += pointsPerMatch;
            matchedPairs++;
            card1.classList.add('matched');
            card2.classList.add('matched');
            flippedCards = [];

            if (matchedPairs === cardDesigns.length) { // Compara com o número de designs únicos
                endGame(true);
            }
        } else {
            score += pointsPerMismatch;
            score = Math.max(0, score);
            gameActive = false;
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                gameActive = true;
            }, 1000);
        }
        updateScoreDisplay();
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = score;
    }

    function startTimer() {
        clearInterval(timerInterval);
        updateTimerDisplay();

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                endGame(false);
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function endGame(isWin) {
        gameActive = false;
        clearInterval(timerInterval);
        endScreen.classList.add('active');
        finalScoreDisplay.textContent = score;

        const timeUsed = gameDuration - timeLeft;
        const minutesUsed = Math.floor(timeUsed / 60);
        const secondsUsed = timeUsed % 60;
        finalTimeDisplay.textContent = `${String(minutesUsed).padStart(2, '0')}:${String(secondsUsed).padStart(2, '0')}`;

        endAnimationContainer.innerHTML = '';

        if (isWin) {
            endMessageDisplay.textContent = "Você Venceu!";
            endMessageDisplay.className = 'win';
            // Se quiser animação de vitória (ex: um GIF)
            // const winImg = document.createElement('img');
            // winImg.src = 'images/win.gif'; // Certifique-se que a imagem existe
            // winImg.alt = 'Vitória!';
            // endAnimationContainer.appendChild(winImg);
        } else {
            endMessageDisplay.textContent = timeLeft <= 0 ? "Tempo Esgotado!" : "Fim de Jogo!"; // Pode ser só "Você Perdeu!"
            endMessageDisplay.className = 'lose';
            // Se quiser animação de derrota
            // const loseImg = document.createElement('img');
            // loseImg.src = 'images/lose.gif'; // Certifique-se que a imagem existe
            // loseImg.alt = 'Derrota!';
            // endAnimationContainer.appendChild(loseImg);
        }
    }

    startGameButton.addEventListener('click', () => {
        startScreen.classList.remove('active');
        initializeBoard();
    });

    playAgainButton.addEventListener('click', () => {
        endScreen.classList.remove('active');
        initializeBoard();
    });

    if (!endScreen.classList.contains('active')) {
        startScreen.classList.add('active');
    }
});