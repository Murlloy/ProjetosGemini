document.addEventListener('DOMContentLoaded', () => {
    const thaisEmojiElement = document.getElementById('thais-emoji');
    const currentWeightElement = document.getElementById('current-weight');
    const weightDisplayElement = document.getElementById('weight-display');
    const burgerButtons = document.querySelectorAll('.burger-button');
    const burgerAnimationArea = document.getElementById('burger-animation-area');

    let currentWeight = 150.0; // Peso inicial fictício
    const baseEmoji = '💁‍♀️'; // Emoji padrão
    const eatingEmoji = '😋'; // Emoji comendo
    const slightlyFullerEmoji = '😊'; // Emoji um pouco mais cheia
    const fullerEmoji = '🥰'; // Emoji bem mais cheia
    const veryFullEmoji = '🤩'; // Emoji super cheia

    function updateWeightDisplay() {
        currentWeightElement.textContent = currentWeight.toFixed(1);
        weightDisplayElement.classList.add('updated');
        setTimeout(() => {
            weightDisplayElement.classList.remove('updated');
        }, 500); // Duração da animação flash
    }

    function updateThaisEmoji() {
        let newEmoji = baseEmoji;
        if (currentWeight >= 250) {
            newEmoji = veryFullEmoji;
            thaisEmojiElement.style.fontSize = '130px';
        } else if (currentWeight >= 200) {
            newEmoji = fullerEmoji;
            thaisEmojiElement.style.fontSize = '120px';
        } else if (currentWeight >= 175) {
            newEmoji = slightlyFullerEmoji;
            thaisEmojiElement.style.fontSize = '110px';
        } else {
            newEmoji = baseEmoji;
            thaisEmojiElement.style.fontSize = '100px';
        }
        thaisEmojiElement.textContent = newEmoji;
    }

    function animateBurgerToEmoji(button) {
        const burgerClone = document.createElement('span');
        burgerClone.textContent = '🍔'; // Ou poderia pegar o emoji do botão se fossem diferentes
        burgerClone.className = 'flying-burger';
        
        // Define a cor do hambúrguer voador baseado na cor do botão
        if (button.classList.contains('white')) burgerClone.style.color = '#777'; // Ajustar para ser visível
        else if (button.classList.contains('yellow')) burgerClone.style.color = '#DAA520'; // Amarelo escuro
        else if (button.classList.contains('orange')) burgerClone.style.color = '#FF4500'; // Laranja avermelhado
        else if (button.classList.contains('purple-neon')) burgerClone.style.color = '#8A2BE2';

        const buttonRect = button.getBoundingClientRect();
        const emojiRect = thaisEmojiElement.getBoundingClientRect();

        // Posição inicial do hambúrguer (centro do botão)
        const startX = buttonRect.left + buttonRect.width / 2;
        const startY = buttonRect.top + buttonRect.height / 2;

        burgerClone.style.left = `${startX}px`;
        burgerClone.style.top = `${startY}px`;

        // Calcular a trajetória para o centro do emoji
        // O emoji está dentro de #thais-emoji-container, que está centralizado
        // O #burger-animation-area é fixed, então precisamos de coordenadas relativas à viewport
        const targetCenterX = emojiRect.left + emojiRect.width / 2;
        const targetCenterY = emojiRect.top + emojiRect.height / 2;
        
        const deltaX = targetCenterX - startX;
        const deltaY = targetCenterY - startY;

        burgerClone.style.setProperty('--target-x', `${deltaX}px`);
        burgerClone.style.setProperty('--target-y', `${deltaY}px`);
        
        burgerAnimationArea.appendChild(burgerClone);

        // Remover o hambúrguer voador após a animação
        setTimeout(() => {
            burgerClone.remove();
        }, 700); // Duração da animação fly-to-emoji
    }


    burgerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const weightIncrease = parseFloat(button.dataset.weight);
            currentWeight += weightIncrease;

            // Animação do hambúrguer voando
            animateBurgerToEmoji(button);

            // Animação de "comer" no emoji principal
            thaisEmojiElement.classList.remove('emoji-eating'); // Garante que reinicia se clicar rápido
            void thaisEmojiElement.offsetWidth; // Truque para forçar reflow e reiniciar animação CSS
            thaisEmojiElement.textContent = eatingEmoji;
            thaisEmojiElement.classList.add('emoji-eating');
            thaisEmojiElement.style.animation = 'none'; // Remove o idle-bob temporariamente
            thaisEmojiElement.offsetHeight; /* trigger reflow */
            thaisEmojiElement.style.animation = null; 

            // Após a animação de comer, atualiza o peso e o emoji normal
            setTimeout(() => {
                updateWeightDisplay();
                updateThaisEmoji(); // O emoji será atualizado conforme o novo peso
                thaisEmojiElement.classList.remove('emoji-eating');
            }, 500); // Tempo da animação de comer
        });
    });

    // Inicialização
    updateWeightDisplay();
    updateThaisEmoji();
});