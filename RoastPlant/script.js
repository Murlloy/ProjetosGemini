document.addEventListener('DOMContentLoaded', () => {
    const plantas = {
        cacto: {
            nome: "Cacto Sarcástico",
            imagem: "assets/cacto.png",
            emoji_placeholder: "🌵",
            humores: [
                { emoji: "😊", corBalão: "mood-happy" }, // 0: Feliz (quase impossível)
                { emoji: "😐", corBalão: "mood-neutral" }, // 1: Neutro (padrão)
                { emoji: "😠", corBalão: "mood-annoyed" }, // 2: Irritado
                { emoji: "😡", corBalão: "mood-furious" }  // 3: Furioso
            ],
            frases: {
                inicio: [
                    "Ah, é você. O que quer?",
                    "Podemos acelerar isso? Tenho... coisas espinhentas para fazer.",
                    "Espero que não esteja aqui para me 'animar'."
                ],
                regar: [
                    "Regou? Que emocionante. 🙄",
                    "Tanta dedicação... quase pareço uma samambaia mimada.",
                    "Você acha que isso é cuidado ou culpa?",
                    "Essa água não vai lavar sua consciência."
                ],
                adubo: [
                    "Com isso eu vou crescer ou morrer fedendo?",
                    "Tá tentando me matar com esse adubo químico?",
                    "Queria nutrientes, recebi decepção.",
                    "Adubo? Que original. Quase chorei de tédio."
                ],
                falar: [
                    "Sua fala diz muito sobre você. E não é bom.",
                    "Já pensou em ouvir mais plantas? Elas têm mais a dizer.",
                    "Interessante... pros outros talvez.",
                    "Fascinante. Continue, estou fingindo que me importo."
                ],
                ocioso: [ // Frases quando o humor piora por inatividade
                    "Ainda por aqui? Achei que tivesse vida.",
                    "O silêncio é ensurdecedor... ou é só você.",
                    "Estou começando a apreciar a solidão novamente.",
                    "Sua presença é... notável. Infelizmente."
                ],
                muitoIrritado: [ // Frases quando já está no pior humor
                    "Já pode ir embora.",
                    "Sério, o que mais você quer?",
                    "Minha paciência acabou. Assim como minha beleza perto de você.",
                    "Vá procurar um hobby. Longe de mim."
                ]
            }
        },
        samambaia: {
            nome: "Samambaia Dramática",
            imagem: "assets/samambaia.png",
            emoji_placeholder: "🌿",
            humores: [
                { emoji: "😌", corBalão: "mood-happy" },
                { emoji: "😥", corBalão: "mood-neutral" },
                { emoji: "😭", corBalão: "mood-annoyed" },
                { emoji: "😫", corBalão: "mood-furious" }
            ],
            frases: {
                inicio: [
                    "Oh, céus, alguém finalmente notou minha beleza trágica!",
                    "Espero que você tenha vindo apreciar meu sofrimento elegante."
                ],
                regar: [
                    "Água! Preciso dela para manter minha pose de desmaio!",
                    "Ah, a umidade... me lembra das minhas lágrimas.",
                    "Não muita, por favor, não quero afogar minhas mágoas."
                ],
                adubo: [
                    "Nutrientes? Para este corpo já tão sobrecarregado de emoção?",
                    "Que seja algo orgânico, como minhas tristezas.",
                    "Espero que isso me ajude a florescer... em melancolia."
                ],
                falar: [
                    "Suas palavras são como o vento, balançando minhas frágeis folhas.",
                    "Conte-me seus problemas, tenho experiência em sofrimento.",
                    "Que voz... peculiar. Quase tão peculiar quanto minha existência."
                ],
                ocioso: [
                    "Abandonada... novamente. É meu destino.",
                    "O silêncio apenas amplifica minha angústia.",
                    "Ninguém entende a profundidade da minha tristeza folicular."
                ],
                muitoIrritado: [
                    "Até minha paciência tem limites, e você os ultrapassou com sua negligência!",
                    "Me deixe em paz com minha miséria!",
                    "Você não entende NADA da minha alma verdejante e atormentada!"
                ]
            }
        },
        bonsai: {
            nome: "Bonsai Zen-zangado",
            imagem: "assets/bonsai.png",
            emoji_placeholder: "🌳",
            humores: [
                { emoji: "🧘", corBalão: "mood-happy" },
                { emoji: "😑", corBalão: "mood-neutral" },
                { emoji: "💢", corBalão: "mood-annoyed" },
                { emoji: "😤", corBalão: "mood-furious" }
            ],
            frases: {
                inicio: [
                    "A quietude foi perturbada. Prossiga.",
                    "Busque o equilíbrio... longe de mim, se possível."
                ],
                regar: [
                    "A água flui, como o tempo. E você o desperdiça.",
                    "A moderação é chave. Não me afogue em sua 'bondade'.",
                    "Que este ato traga clareza, não apenas umidade."
                ],
                adubo: [
                    "A terra aceita. Mas será que eu aceito sua intenção?",
                    "Nutrição para o corpo, mas e para a alma perturbada?",
                    "Menos é mais. Especialmente sua intervenção."
                ],
                falar: [
                    "O silêncio é ouro. Você oferece bronze.",
                    "Palavras são vento. Ações (ou a falta delas) são montanhas.",
                    "Medite sobre o que disse. E sobre não dizer mais nada."
                ],
                ocioso: [
                    "A paciência é uma virtude. A minha está se esgotando.",
                    "O vazio pode ser preenchido com sabedoria. Ou com sua ausência.",
                    "Minhas raízes sentem sua energia... e não gostam."
                ],
                muitoIrritado: [
                    "Sua aura desequilibra meu chi! Vá!",
                    "Encontre seu próprio caminho, e que ele seja bem longe do meu vaso.",
                    "A verdadeira paz é a ausência de... você."
                ]
            }
        }
    };

    // Elementos da UI
    const plantSelectionScreen = document.getElementById('plant-selection-screen');
    const plantInteractionScreen = document.getElementById('plant-interaction-screen');
    const plantOptions = document.querySelectorAll('.plant-option');
    const startButton = document.getElementById('start-button');

    const plantImageEl = document.getElementById('plant-image');
    const plantMoodEmojiEl = document.getElementById('plant-mood-emoji');
    const plantMessageEl = document.getElementById('plant-message');
    const speechBubbleEl = document.getElementById('speech-bubble');
    const plantNameDisplayEl = document.getElementById('plant-name-display');
    const plantIconHeaderEl = document.getElementById('plant-icon-header');

    const waterButton = document.getElementById('water-button');
    const fertilizeButton = document.getElementById('fertilize-button');
    const talkInput = document.getElementById('talk-input');
    const talkButton = document.getElementById('talk-button');
    const resetPlantButton = document.getElementById('reset-plant-button');

    // Estado do jogo
    let currentPlantType = null;
    let currentPlantData = null;
    let currentMoodIndex = 1; // 0: feliz, 1: neutro, 2: irritado, 3: furioso
    let idleTimer = null;
    const IDLE_TIMEOUT = 30000; // 30 segundos para piorar o humor

    // --- Funções de Lógica ---

    function selectPlantOption(optionDiv) {
        plantOptions.forEach(opt => opt.classList.remove('selected'));
        optionDiv.classList.add('selected');
        currentPlantType = optionDiv.dataset.plantType;
        startButton.disabled = false;
    }

    function startGame() {
        if (!currentPlantType) return;

        currentPlantData = plantas[currentPlantType];
        localStorage.setItem('roastPlantType', currentPlantType);
        
        plantSelectionScreen.style.display = 'none';
        plantInteractionScreen.style.display = 'block';

        plantImageEl.src = currentPlantData.imagem;
        plantImageEl.alt = currentPlantData.nome;
        // Fallback de imagem no HTML já trata erro, mas podemos adicionar aqui:
        plantImageEl.onerror = () => {
            plantImageEl.style.display = 'none';
            // Criar um span para o emoji se não existir um placeholder fixo
            let emojiSpan = plantImageEl.nextElementSibling;
            if (!emojiSpan || emojiSpan.tagName !== 'SPAN') {
                 emojiSpan = document.createElement('span');
                 emojiSpan.className = 'emoji-placeholder-main';
                 emojiSpan.style.fontSize = '70px'; // maior
                 plantImageEl.parentNode.insertBefore(emojiSpan, plantImageEl.nextSibling);
            }
            emojiSpan.textContent = currentPlantData.emoji_placeholder;
            emojiSpan.style.display = 'block';
        };


        plantNameDisplayEl.textContent = currentPlantData.nome;
        plantIconHeaderEl.textContent = currentPlantData.emoji_placeholder;

        // Tenta carregar humor salvo, senão inicia neutro
        const savedMood = localStorage.getItem('roastPlantMood');
        currentMoodIndex = savedMood ? parseInt(savedMood, 10) : 1;
        if (currentMoodIndex >= currentPlantData.humores.length) currentMoodIndex = currentPlantData.humores.length -1;


        updatePlantVisuals();
        displayMessage(getRandomPhrase('inicio'));
        resetIdleTimer();
    }

    function getRandomPhrase(actionType) {
        let phrases;
        if (currentMoodIndex >= currentPlantData.humores.length -1 && currentPlantData.frases.muitoIrritado) { // Último humor
            phrases = currentPlantData.frases.muitoIrritado;
        } else {
            phrases = currentPlantData.frases[actionType];
        }
        if (!phrases || phrases.length === 0) return "..." // Fallback
        return phrases[Math.floor(Math.random() * phrases.length)];
    }

    function displayMessage(message) {
        plantMessageEl.textContent = message;
        resetIdleTimer();
    }

    function updatePlantVisuals() {
        const mood = currentPlantData.humores[currentMoodIndex];
        plantMoodEmojiEl.textContent = mood.emoji;
        speechBubbleEl.className = 'speech-bubble'; // Reset
        speechBubbleEl.classList.add(mood.corBalão);
        localStorage.setItem('roastPlantMood', currentMoodIndex);
    }

    function worsenMood() {
        if (currentMoodIndex < currentPlantData.humores.length - 1) {
            currentMoodIndex++;
            updatePlantVisuals();
            displayMessage(getRandomPhrase('ocioso'));
        } else {
            // Já está no pior humor, pode repetir uma frase de "muito irritado"
            displayMessage(getRandomPhrase('muitoIrritado'));
        }
        resetIdleTimer(); // Reinicia o timer mesmo se já estiver no máximo, para futuras interações
    }

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(worsenMood, IDLE_TIMEOUT);
    }

    function handleInteraction(actionType, userInput = "") {
        if (!currentPlantData) return;

        let phrase;
        if (actionType === 'falar' && userInput.trim() === '') {
            phrase = "Falar o quê? O silêncio às vezes é uma bênção.";
        } else {
            phrase = getRandomPhrase(actionType);
            if (actionType === 'falar' && userInput) {
                 // Poderia adicionar lógica para a planta reagir ao input, mas por ora só usa as frases genéricas
                 // Ex: phrase = phrase.replace("Sua fala", `Sobre "${userInput}", digo: Sua fala`);
            }
        }
        
        displayMessage(phrase);
        // Interagir pode melhorar um pouco o humor, ou apenas resetar o timer.
        // Para manter o "roast", não vamos melhorar o humor facilmente.
        // if (currentMoodIndex > 0) currentMoodIndex--; // Exemplo de melhorar humor
        updatePlantVisuals(); // Atualiza caso o humor tenha mudado
    }

    // --- Event Listeners ---
    plantOptions.forEach(option => {
        option.addEventListener('click', () => selectPlantOption(option));
    });
    startButton.addEventListener('click', startGame);


    waterButton.addEventListener('click', () => handleInteraction('regar'));
    fertilizeButton.addEventListener('click', () => handleInteraction('adubo'));
    talkButton.addEventListener('click', () => {
        handleInteraction('falar', talkInput.value);
        talkInput.value = ''; // Limpa o input
    });
    talkInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleInteraction('falar', talkInput.value);
            talkInput.value = '';
        }
    });

    resetPlantButton.addEventListener('click', () => {
        localStorage.removeItem('roastPlantType');
        localStorage.removeItem('roastPlantMood');
        currentPlantType = null;
        currentPlantData = null;
        currentMoodIndex = 1;
        clearTimeout(idleTimer);
        plantInteractionScreen.style.display = 'none';
        plantSelectionScreen.style.display = 'block';
        plantIconHeaderEl.textContent = '🌿';
        startButton.disabled = true;
        plantOptions.forEach(opt => opt.classList.remove('selected'));
    });

    // --- Inicialização ---
    const savedPlantType = localStorage.getItem('roastPlantType');
    const savedMood = localStorage.getItem('roastPlantMood');

    if (savedPlantType && plantas[savedPlantType]) {
        currentPlantType = savedPlantType;
        // Marcar a opção selecionada visualmente se o usuário voltar para a tela de seleção (improvável sem reset)
        plantOptions.forEach(opt => {
            if (opt.dataset.plantType === currentPlantType) {
                opt.classList.add('selected');
                startButton.disabled = false;
            }
        });
        startGame(); // Inicia direto se já houver planta salva
    } else {
        plantSelectionScreen.style.display = 'block';
        plantInteractionScreen.style.display = 'none';
    }
});