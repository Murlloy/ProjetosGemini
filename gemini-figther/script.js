document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const arena = document.getElementById('arena');
    const player1Element = document.getElementById('player1');
    const player2Element = document.getElementById('player2');
    const player1HealthBar = document.getElementById('player1-health');
    const player2HealthBar = document.getElementById('player2-health');
    const timerElement = document.getElementById('timer');
    const gameOverMessageElement = document.getElementById('game-over-message');
    const winnerMessageElement = document.getElementById('winner-message');

    const sfx = {
        punch: document.getElementById('sfx-punch'),
        kick: document.getElementById('sfx-kick'),
        hurt: document.getElementById('sfx-hurt')
    };

    function playSound(soundName) {
        if (sfx[soundName]) {
            sfx[soundName].currentTime = 0;
            sfx[soundName].play().catch(error => console.warn("SFX play error:", error));
        }
    }

    const GAME_WIDTH = arena.offsetWidth;
    // AJUSTE ESTAS DIMENSÕES PARA CORRESPONDER AO CSS E AOS SEUS SPRITES
    const CHARACTER_SPRITE_WIDTH = 80;
    const CHARACTER_SPRITE_HEIGHT = 120;
    const MOVE_SPEED = 2.5;
    const INITIAL_HP = 100;
    const GAME_DURATION_SECONDS = 159;

    let gameTimer = GAME_DURATION_SECONDS;
    let timerInterval;
    let gameIsOver = false;

    const players = {
        player1: {
            id: 'player1',
            element: player1Element,
            healthBar: player1HealthBar,
            x: 100,
            health: INITIAL_HP,
            direction: 'right',
            state: 'idle', // 'idle', 'walk', 'punch', 'kick', 'hurt', 'ko'
            isAttacking: false,
            attackType: null,
            attackHitbox: null,
            isInvulnerable: false,
            invulnerabilityTimer: 0,
            keys: {},
            controls: { left: 'a', right: 'd', punch: 'g', kick: 'h' },
            spriteBase: 'assets/sprites/player1_' // Caminho base para os sprites
        },
        player2: {
            id: 'player2',
            element: player2Element,
            healthBar: player2HealthBar,
            x: GAME_WIDTH - 100 - CHARACTER_SPRITE_WIDTH,
            health: INITIAL_HP,
            direction: 'left',
            state: 'idle',
            isAttacking: false,
            attackType: null,
            attackHitbox: null,
            isInvulnerable: false,
            invulnerabilityTimer: 0,
            keys: {},
            controls: { left: 'ArrowLeft', right: 'ArrowRight', punch: 'k', kick: 'l' },
            spriteBase: 'assets/sprites/player2_'
        }
    };

    function updatePlayerSprite(player) {
        let stateForSprite = player.state;
        if (player.state.startsWith('attack-')) {
            stateForSprite = player.state.substring(7); // ex: 'attack-punch' -> 'punch'
        }
        const spriteUrl = `${player.spriteBase}${stateForSprite}.png`;
        player.element.style.backgroundImage = `url('${spriteUrl}')`;

        // Limpar classes de estado antigas que eram usadas para cor de fallback
        player.element.classList.remove('idle', 'walk', 'attack-punch', 'attack-kick');
        // Adicionar classe de estado atual (para 'hurt' e 'ko' que têm estilos CSS além do sprite)
        if (player.state === 'hurt' || player.state === 'ko') {
            player.element.classList.add(player.state);
        } else {
             player.element.classList.remove('hurt', 'ko'); // Garante que não fiquem presas
        }
    }


    function initGame() {
        gameIsOver = false;
        gameOverMessageElement.style.display = 'none';
        gameTimer = GAME_DURATION_SECONDS;
        timerElement.textContent = gameTimer;

        Object.values(players).forEach(player => {
            player.health = INITIAL_HP;
            player.state = 'idle';
            player.isAttacking = false;
            player.isInvulnerable = false;
            player.invulnerabilityTimer = 0;
            player.attackHitbox = null;
            
            player.element.classList.remove('ko', 'hurt'); // Limpa classes de KO e Hurt
            player.element.style.opacity = 1;
            
            if (player.id === 'player1') {
                player.x = 100;
                player.direction = 'right';
            } else {
                player.x = GAME_WIDTH - 100 - CHARACTER_SPRITE_WIDTH;
                player.direction = 'left';
            }
            player.element.style.transform = player.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)';

            updatePlayerPosition(player);
            updateHealthBar(player);
            updatePlayerSprite(player); // Define o sprite inicial (idle)
        });
        
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 1000);

        requestAnimationFrame(gameLoop);
    }
    
    window.resetGame = initGame;

    function updatePlayerPosition(player) {
        player.element.style.left = `${player.x}px`;
    }

    function updateHealthBar(player) {
        const healthPercentage = Math.max(0, (player.health / INITIAL_HP) * 100);
        player.healthBar.style.width = `${healthPercentage}%`;
        if (healthPercentage > 60) player.healthBar.style.backgroundColor = 'green';
        else if (healthPercentage > 30) player.healthBar.style.backgroundColor = 'yellow';
        else player.healthBar.style.backgroundColor = 'red';
    }

    function handleInput(player) {
        if (gameIsOver || player.state === 'ko' || player.isAttacking || player.state === 'hurt') return;

        let moved = false;
        if (player.keys[player.controls.left]) {
            player.x -= MOVE_SPEED;
            moved = true;
        }
        if (player.keys[player.controls.right]) {
            player.x += MOVE_SPEED;
            moved = true;
        }

        player.x = Math.max(0, Math.min(player.x, GAME_WIDTH - CHARACTER_SPRITE_WIDTH));

        if (moved && player.state !== 'walk') {
            player.state = 'walk';
            updatePlayerSprite(player);
        } else if (!moved && player.state === 'walk') {
            player.state = 'idle';
            updatePlayerSprite(player);
        }


        if (player.keys[player.controls.punch] && !player.isAttacking) {
            performAttack(player, 'punch');
        }
        if (player.keys[player.controls.kick] && !player.isAttacking) {
            performAttack(player, 'kick');
        }
    }

    function performAttack(player, type) {
        if (gameIsOver || player.state === 'ko' || player.isAttacking) return;

        player.isAttacking = true;
        player.attackType = type;
        player.state = `attack-${type}`;
        updatePlayerSprite(player);
        playSound(type);

        const attackDuration = (type === 'punch') ? 300 : 500;
        const hitboxWidth = (type === 'punch') ? CHARACTER_SPRITE_WIDTH * 0.7 : CHARACTER_SPRITE_WIDTH * 1.1;
        const hitboxHeight = CHARACTER_SPRITE_HEIGHT * 0.3;
        const hitboxOffsetY = CHARACTER_SPRITE_HEIGHT * 0.35;

        let hitboxX;
        if (player.direction === 'right') {
            hitboxX = player.x + CHARACTER_SPRITE_WIDTH * 0.6;
        } else {
            hitboxX = player.x + CHARACTER_SPRITE_WIDTH * 0.4 - hitboxWidth;
        }
        
        player.attackHitbox = {
            x: hitboxX,
            y: arena.offsetHeight - CHARACTER_SPRITE_HEIGHT + hitboxOffsetY,
            width: hitboxWidth,
            height: hitboxHeight
        };

        setTimeout(() => {
            player.isAttacking = false;
            player.attackHitbox = null;
            // Só volta para idle se não estiver em KO ou hurt
            if (player.state.startsWith('attack-') && player.state !== 'ko' && player.state !== 'hurt') {
                player.state = 'idle';
                updatePlayerSprite(player);
            }
        }, attackDuration);
    }

    function checkCollision(rect1, rect2) {
        if (!rect1 || !rect2) return false;
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    function handleCollisions() {
        if (gameIsOver) return;
        const p1 = players.player1;
        const p2 = players.player2;

        const getBodyHitbox = (player) => ({
            x: player.x,
            y: arena.offsetHeight - CHARACTER_SPRITE_HEIGHT,
            width: CHARACTER_SPRITE_WIDTH,
            height: CHARACTER_SPRITE_HEIGHT
        });

        if (p1.isAttacking && p1.attackHitbox) {
            if (checkCollision(p1.attackHitbox, getBodyHitbox(p2)) && !p2.isInvulnerable && p2.state !== 'ko') {
                takeDamage(p2, p1.attackType === 'punch' ? 10 : 15);
                p1.attackHitbox = null; 
            }
        }

        if (p2.isAttacking && p2.attackHitbox) {
            if (checkCollision(p2.attackHitbox, getBodyHitbox(p1)) && !p1.isInvulnerable && p1.state !== 'ko') {
                takeDamage(p1, p2.attackType === 'punch' ? 10 : 15);
                p2.attackHitbox = null; 
            }
        }
    }

    function takeDamage(player, amount) {
        if (gameIsOver || player.state === 'ko' || player.isInvulnerable) return;

        player.health -= amount;
        updateHealthBar(player);
        playSound('hurt');

        if (player.health <= 0) {
            player.health = 0; // Garante que não fique negativo na barra
            player.state = 'ko';
            updatePlayerSprite(player); // Aplica sprite de KO e classe 'ko'
            checkGameOver();
        } else {
            player.state = 'hurt';
            updatePlayerSprite(player); // Aplica sprite de hurt e classe 'hurt'
            player.isInvulnerable = true;
            // A invulnerabilidade dura 30 frames (0.5s a 60fps), mas o estado hurt é mais curto visualmente
            player.invulnerabilityTimer = 30; 
            
            setTimeout(() => {
                // Só volta para idle se AINDA estiver em hurt e não KO e não atacando
                if (player.state === 'hurt' && player.health > 0 && !player.isAttacking) {
                     player.state = 'idle';
                     updatePlayerSprite(player);
                }
                 // A classe 'hurt' será removida por updatePlayerSprite ao mudar de estado
            }, 400); // Duração do estado 'hurt' visual antes de voltar para idle (se não for KO)
        }
    }

    function updateStates() {
        if (gameIsOver) return;
        Object.values(players).forEach(player => {
            if (player.state === 'ko') {
                // Garante que o sprite de KO e a classe 'ko' permaneçam
                if (!player.element.classList.contains('ko')) {
                    updatePlayerSprite(player);
                }
                return;
            }

            if (player.isInvulnerable) {
                player.invulnerabilityTimer--;
                if (player.invulnerabilityTimer <= 0) {
                    player.isInvulnerable = false;
                    // Se o estado 'hurt' terminou e o jogador está invulnerável,
                    // mas ainda não voltou para 'idle' (ex: terminou timer de hurt),
                    // força a volta para 'idle' aqui se não estiver atacando.
                    if (player.state === 'hurt' && !player.isAttacking) {
                        player.state = 'idle';
                        updatePlayerSprite(player);
                    }
                }
            }

            const opponent = (player.id === 'player1') ? players.player2 : players.player1;
            if (opponent.state !== 'ko') { // Não virar se o oponente estiver KO
                if (player.x < opponent.x && player.direction === 'left') {
                    player.direction = 'right';
                    player.element.style.transform = 'scaleX(1)';
                } else if (player.x > opponent.x && player.direction === 'right') {
                    player.direction = 'left';
                    player.element.style.transform = 'scaleX(-1)';
                }
            }
            // updatePlayerSprite é chamado quando o estado muda (em handleInput, performAttack, takeDamage)
        });
    }

    function updateTimer() {
        if (gameIsOver) return;
        gameTimer--;
        timerElement.textContent = gameTimer;
        if (gameTimer <= 0) {
            endGameByTimeout();
        }
    }

    function checkGameOver() {
        if (gameIsOver) return;

        const p1 = players.player1;
        const p2 = players.player2;

        if (p1.health <= 0 || p2.health <= 0) {
            gameIsOver = true;
            clearInterval(timerInterval);
            let winnerText;
            if (p1.health <= 0 && p2.health <= 0) {
                winnerText = "Empate! (Double KO)";
            } else if (p1.health <= 0) {
                winnerText = "Player 2 Venceu!";
                if (p2.state !== 'ko') { p2.state = 'idle'; updatePlayerSprite(p2); } // Pose de vitória
            } else { // p2.health <= 0
                winnerText = "Player 1 Venceu!";
                if (p1.state !== 'ko') { p1.state = 'idle'; updatePlayerSprite(p1); } // Pose de vitória
            }
            showGameOverMessage(winnerText);
        }
    }
    
    function endGameByTimeout() {
        if (gameIsOver) return;
        gameIsOver = true;
        clearInterval(timerInterval);
        
        let winnerText;
        if (players.player1.health > players.player2.health) {
            winnerText = "Player 1 Venceu por Tempo!";
             if (players.player1.state !== 'ko') { players.player1.state = 'idle'; updatePlayerSprite(players.player1); }
        } else if (players.player2.health > players.player1.health) {
            winnerText = "Player 2 Venceu por Tempo!";
            if (players.player2.state !== 'ko') { players.player2.state = 'idle'; updatePlayerSprite(players.player2); }
        } else {
            winnerText = "Empate por Tempo!";
            if (players.player1.state !== 'ko') { players.player1.state = 'idle'; updatePlayerSprite(players.player1); }
            if (players.player2.state !== 'ko') { players.player2.state = 'idle'; updatePlayerSprite(players.player2); }
        }
        showGameOverMessage(winnerText);
    }

    function showGameOverMessage(message) {
        winnerMessageElement.textContent = message;
        gameOverMessageElement.style.display = 'flex'; // Usar flex para melhor centralização vertical do conteúdo
        gameOverMessageElement.style.flexDirection = 'column';
        gameOverMessageElement.style.justifyContent = 'center';
        gameOverMessageElement.style.alignItems = 'center';
    }

    function gameLoop(timestamp) {
        if (gameIsOver && (players.player1.state !== 'ko' && players.player2.state !== 'ko')) {
            // Se o jogo acabou por tempo e ninguém está KO, para o loop
            return;
        }
        // Continua o loop um pouco mais se alguém está KO para a animação terminar
        if (gameIsOver && players.player1.state === 'ko' && players.player2.state === 'ko') {
             // Ou se ambos estão KO
        }


        handleInput(players.player1);
        handleInput(players.player2);
        
        updateStates(); 
        
        handleCollisions(); 

        updatePlayerPosition(players.player1);
        updatePlayerPosition(players.player2);

        if (!gameIsOver) { // Só checa game over se o jogo não acabou ainda por tempo
           checkGameOver();
        }
        
        requestAnimationFrame(gameLoop);
    }

    document.addEventListener('keydown', (event) => {
        Object.values(players).forEach(player => {
            if (Object.values(player.controls).includes(event.key.toLowerCase())) {
                player.keys[event.key.toLowerCase()] = true;
            }
        });
    });

    document.addEventListener('keyup', (event) => {
        Object.values(players).forEach(player => {
            if (Object.values(player.controls).includes(event.key.toLowerCase())) {
                player.keys[event.key.toLowerCase()] = false;
                 // Se estava andando e soltou a tecla de movimento, volta para idle
                if (!gameIsOver && player.state === 'walk' && (event.key.toLowerCase() === player.controls.left || event.key.toLowerCase() === player.controls.right)) {
                    // Verifica se a outra tecla de movimento também não está pressionada
                    const otherMoveKey = event.key.toLowerCase() === player.controls.left ? player.controls.right : player.controls.left;
                    if (!player.keys[otherMoveKey]) {
                        player.state = 'idle';
                        updatePlayerSprite(player);
                    }
                }
            }
        });
    });

    initGame();
});