document.addEventListener('DOMContentLoaded', () => {
    // Elementos da UI
    const screens = {
        auth: document.getElementById('auth-screen'),
        main: document.getElementById('main-app')
    };
    const appSections = document.querySelectorAll('.app-section');
    const navButtons = document.querySelectorAll('.nav-btn');

    // Autenticação
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const registerUsernameInput = document.getElementById('register-username');
    const breadTypeInput = document.getElementById('bread-type');
    const initialStatusInput = document.getElementById('initial-status');
    const loginUsernameInput = document.getElementById('login-username');
    const showLoginLink = document.getElementById('show-login-link');
    const showRegisterLink = document.getElementById('show-register-link');
    const logoutBtn = document.getElementById('logout-btn');
    const navUsernameDisplay = document.getElementById('nav-username-display');
    const navUserAvatar = document.getElementById('nav-user-avatar');

    // Tema
    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    // Feed
    const newPostContentInput = document.getElementById('new-post-content');
    const submitPostBtn = document.getElementById('submit-post-btn');
    const feedContainer = document.getElementById('feed-container');
    const loadMorePostsBtn = document.getElementById('load-more-posts-btn');

    // Perfil
    const profileAvatarBaseImg = document.getElementById('profile-avatar-base-img');
    const profileAvatarDisplay = document.getElementById('profile-avatar-display');
    const profileUsernameDisplay = document.getElementById('profile-username-display');
    const profileBreadTypeDisplay = document.getElementById('profile-bread-type-display');
    const profileStatusDisplay = document.getElementById('profile-status-display');
    const profileBioInput = document.getElementById('profile-bio');
    const saveBioBtn = document.getElementById('save-bio-btn');
    const profilePostsContainer = document.getElementById('profile-posts-container');

    // Loja
    const storeItemsContainer = document.getElementById('store-items-container');
    const userSugarCrystalsStore = document.getElementById('user-sugar-crystals-store');

    // Mini Game
    const dipInMilkBtn = document.getElementById('dip-in-milk-btn');
    const gameResultText = document.getElementById('game-result-text');
    const userSugarCrystalsGame = document.getElementById('user-sugar-crystals-game');

    // Notificações e Som
    const notificationToast = document.getElementById('fake-notification-toast');
    const notificationText = document.getElementById('fake-notification-text');
    const crocSound = document.getElementById('croc-sound-effect');

    // Estado da Aplicação
    let currentUser = null;
    let allPosts = [];
    let displayedPostsCount = 0;
    const POSTS_PER_LOAD = 5;

    const BREAD_AVATARS = {
        pao_de_forma: 'assets/images/pao_de_forma.webp',
        pao_integral: 'assets/images/pao_integral.png',
        brioche: 'assets/images/brioche.png',
        panetone: 'assets/images/panetone.png',
        pao_embolorado: 'assets/images/pao_embolorado.png'
    };

    const SHOP_ITEMS_DATA = [
        { id: 'oculos_escuros', name: 'Óculos Escuros 😎', price: 50, image: 'assets/images/oculos_escuros.png', css: { top: '25%', left: '20%', width: '60%', transform: 'rotate(-5deg)' } },
        { id: 'chapeu_chef', name: 'Chapéu de Chef 👨‍🍳', price: 70, image: 'assets/images/chapeu_chef.png', css: { top: '-10%', left: '25%', width: '50%' } },
        { id: 'presunto_queijo', name: 'Presunto+Queijo 🥪', price: 100, image: 'assets/images/presunto_queijo.png', css: { top: '30%', left: '10%', width: '80%', height: '40%', objectFit: 'cover' } },
        { id: 'mofo_neon', name: 'Mofo Neon ✨', price: 150, image: 'assets/images/mofo_neon.png', css: { opacity: '0.5', width: '100%', height: '100%'} },
        { id: 'roupa_rabanada', name: 'Roupa de Rabanada 🎄', price: 200, image: 'assets/images/roupa_rabanada.png', css: { width: '100%', height: '100%', objectFit: 'cover'} },
    ];

    // --- FUNÇÕES UTILITÁRIAS ---
    function playCrocSound() { try { crocSound.currentTime = 0; crocSound.play(); } catch(e) { /*ignore*/ } }
    function showToast(message) {
        notificationText.textContent = message;
        notificationToast.classList.add('show');
        setTimeout(() => notificationToast.classList.remove('show'), 3000);
    }

    function switchScreen(screenName) {
        playCrocSound();
        Object.values(screens).forEach(s => s.classList.remove('active'));
        if (screens[screenName]) screens[screenName].classList.add('active');
    }

    function switchAppSection(targetId) {
        playCrocSound();
        appSections.forEach(section => section.classList.remove('active-section'));
        navButtons.forEach(btn => btn.classList.remove('active-nav'));

        const targetSection = document.getElementById(targetId);
        const targetButton = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
        if (targetSection) targetSection.classList.add('active-section');
        if (targetButton) targetButton.classList.add('active-nav');

        // Ações específicas ao mudar de seção
        if (targetId === 'profile-screen' && currentUser) renderProfileScreen();
        if (targetId === 'store-screen' && currentUser) renderStoreScreen();
        if (targetId === 'game-screen' && currentUser) updateSugarCrystalsDisplay();
        if (targetId === 'home-feed-screen' && currentUser) { // Recarregar feed se voltar
             if (allPosts.length === 0) loadPosts(); // Carrega posts se não foram carregados ainda
             renderFeed(true); // true para resetar e re-renderizar do início
        }
    }

    // --- LOCALSTORAGE ---
    function saveUserData() {
        if (currentUser) {
            localStorage.setItem('breadBookUser', JSON.stringify(currentUser));
            // Salvar dados específicos do usuário (para múltiplos usuários "fake" no mesmo browser)
            localStorage.setItem(`breadBookUser_${currentUser.username}`, JSON.stringify(currentUser));
        }
    }
    function loadUserData() {
        const storedUser = localStorage.getItem('breadBookUser');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            return true;
        }
        return false;
    }
    function savePostsData() { localStorage.setItem('breadBookPosts', JSON.stringify(allPosts)); }
    function loadPostsData() {
        const storedPosts = localStorage.getItem('breadBookPosts');
        if (storedPosts) {
            allPosts = JSON.parse(storedPosts);
        } else {
            // Gerar posts iniciais se não houver
            allPosts = generateInitialFakePosts();
            savePostsData();
        }
    }

    // --- TEMA ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggleBtn.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-theme');
            themeToggleBtn.textContent = '🌙';
        }
        localStorage.setItem('breadBookTheme', theme);
    }
    themeToggleBtn.addEventListener('click', () => {
        playCrocSound();
        const currentTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
        applyTheme(currentTheme);
    });

    // --- AUTENTICAÇÃO ---
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); playCrocSound(); loginForm.style.display = 'block'; registerForm.style.display = 'none'; });
    showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); playCrocSound(); registerForm.style.display = 'block'; loginForm.style.display = 'none'; });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        playCrocSound();
        let username = registerUsernameInput.value.trim();
        if (!username.startsWith('@')) username = '@' + username;

        if (localStorage.getItem(`breadBookUser_${username}`)) {
            showToast("Essa fatia já existe na padaria! Tente outro nome.");
            return;
        }
        
        let breadType = breadTypeInput.value;
        let status = initialStatusInput.value;
        let avatar = BREAD_AVATARS[breadType];

        // Chance rara de ser pão embolorado
        if (Math.random() < 0.1 && breadType !== 'pao_embolorado') { // 10% chance
            breadType = 'pao_embolorado';
            status = 'Bolorento';
            avatar = BREAD_AVATARS.pao_embolorado;
            showToast("Oh não! Parece que você ficou um pouco... embolorado! Que raridade!");
        }

        currentUser = {
            username: username,
            breadType: breadType,
            status: status,
            avatar: avatar,
            bio: "Acabou de sair do forno (ou da despensa)!",
            accessories: [], // IDs dos itens equipados
            ownedItems: [], // IDs dos itens comprados
            sugarCrystals: 20, // Cristais iniciais
            myPostsIds: [] // IDs dos posts do usuário
        };
        saveUserData();
        initializeApp();
        showToast(`Bem-vindo(a) à fornada, ${currentUser.username}!`);
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        playCrocSound();
        let username = loginUsernameInput.value.trim();
        if (!username.startsWith('@') && username.length > 0) username = '@' + username;

        const storedUser = localStorage.getItem(`breadBookUser_${username}`);
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            saveUserData(); // Salva como usuário logado principal
            initializeApp();
            showToast(`De volta ao miolo, ${currentUser.username}!`);
        } else {
            showToast("Fatia não encontrada. Verifique o nome ou crie uma nova.");
        }
    });

    logoutBtn.addEventListener('click', () => {
        playCrocSound();
        currentUser = null;
        localStorage.removeItem('breadBookUser');
        allPosts = []; // Limpa posts da memória para o próximo login
        displayedPostsCount = 0;
        switchScreen('auth');
        loginForm.reset();
        registerForm.reset();
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        showToast("Até a próxima fornada!");
    });

    // --- POSTS ---
    function generateInitialFakePosts() {
        return [
            { id: Date.now() + 1, author: '@Brotinho96', authorAvatar: BREAD_AVATARS.pao_de_forma, content: 'Hoje levei um susto com a torradeira. Ainda tremendo. 😬', comments: 13, reactions: { butter: 25, toast: 5, honey: 2, rot: 0 }, timestamp: Date.now() - 100000 },
            { id: Date.now() + 2, author: '@CascaDourada', authorAvatar: BREAD_AVATARS.brioche, content: 'A vida é curta, coma a sobremesa primeiro... ou me coma, se eu for um brioche recheado! 😉', comments: 8, reactions: { butter: 30, toast: 2, honey: 15, rot: 1 }, timestamp: Date.now() - 200000 },
            { id: Date.now() + 3, author: '@IntegralmenteZen', authorAvatar: BREAD_AVATARS.pao_integral, content: 'Meditando sobre a impermanência da crocância. #mindfulBread', comments: 5, reactions: { butter: 18, toast: 1, honey: 7, rot: 0 }, timestamp: Date.now() - 300000 },
            { id: Date.now() + 4, author: '@PanetoneFestivo', authorAvatar: BREAD_AVATARS.panetone, content: 'Contando os dias para o Natal! Alguém mais sonha em ser rabanada? ✨🎄', comments: 22, reactions: { butter: 40, toast: 3, honey: 25, rot: 0 }, timestamp: Date.now() - 400000 },
            { id: Date.now() + 5, author: '@MofoFilosofico', authorAvatar: BREAD_AVATARS.pao_embolorado, content: 'A beleza está no efêmero. E no penicillium. 🧐 #PensamentoProfundo', comments: 3, reactions: { butter: 5, toast: 10, honey: 1, rot: 8 }, timestamp: Date.now() - 500000 }
        ].sort((a, b) => b.timestamp - a.timestamp);
    }

    function createPostElement(post) {
        const postCard = document.createElement('article');
        postCard.classList.add('post-card');
        postCard.dataset.postId = post.id;

        const authorIsCurrentUser = currentUser && post.author === currentUser.username;
        const authorAvatarSrc = authorIsCurrentUser ? currentUser.avatar : (post.authorAvatar || BREAD_AVATARS.pao_de_forma);

        postCard.innerHTML = `
            <div class="author">
                <img src="${authorAvatarSrc}" alt="${post.author}">
                <span>${post.author}</span>
            </div>
            <p class="content">${post.content.replace(/\n/g, '<br>')}</p>
            <div class="actions">
                <button class="butter-btn" data-reaction="butter">🧈 <span class="count">${post.reactions.butter}</span></button>
                <button class="toast-btn" data-reaction="toast">🔥 <span class="count">${post.reactions.toast}</span></button>
                <button class="honey-btn" data-reaction="honey">🍯 <span class="count">${post.reactions.honey}</span></button>
                <button class="rot-btn" data-reaction="rot">🦠 <span class="count">${post.reactions.rot}</span></button>
            </div>
            <div class="comments-info">💬 ${post.comments} comentários (simulado)</div>
        `;

        postCard.querySelectorAll('.actions button').forEach(button => {
            button.addEventListener('click', (e) => {
                if (!currentUser) { showToast("Você precisa estar logado para reagir!"); return; }
                playCrocSound();
                const reactionType = e.currentTarget.dataset.reaction;
                const targetPost = allPosts.find(p => p.id === post.id);
                if (targetPost) {
                    // Simplesmente incrementa. Não impede múltiplas reações do mesmo usuário neste protótipo.
                    targetPost.reactions[reactionType]++;
                    e.currentTarget.querySelector('.count').textContent = targetPost.reactions[reactionType];
                    savePostsData();
                    if (reactionType === 'toast' && targetPost.author !== currentUser.username) {
                        showToast(`${currentUser.username} torrou o post de ${targetPost.author}! 🔥`);
                    }
                     if (reactionType === 'butter' && targetPost.author !== currentUser.username) {
                        showToast(`${currentUser.username} passou manteiga no post de ${targetPost.author}! 🧈`);
                    }
                }
            });
        });
        return postCard;
    }

    function renderFeed(reset = false) {
        if (reset) {
            feedContainer.innerHTML = '';
            displayedPostsCount = 0;
        }
        const postsToDisplay = allPosts.slice(displayedPostsCount, displayedPostsCount + POSTS_PER_LOAD);
        postsToDisplay.forEach(post => feedContainer.appendChild(createPostElement(post)));
        displayedPostsCount += postsToDisplay.length;
        loadMorePostsBtn.style.display = displayedPostsCount < allPosts.length ? 'block' : 'none';
    }
    loadMorePostsBtn.addEventListener('click', () => { playCrocSound(); renderFeed(); });

    submitPostBtn.addEventListener('click', () => {
        playCrocSound();
        const content = newPostContentInput.value.trim();
        if (content && currentUser) {
            const newPost = {
                id: Date.now(),
                author: currentUser.username,
                authorAvatar: currentUser.avatar,
                content: content,
                comments: 0,
                reactions: { butter: 0, toast: 0, honey: 0, rot: 0 },
                timestamp: Date.now()
            };
            allPosts.unshift(newPost); // Adiciona no início
            currentUser.myPostsIds.unshift(newPost.id);
            savePostsData();
            saveUserData();
            renderFeed(true); // Reseta e re-renderiza o feed
            newPostContentInput.value = '';
            showToast("Sua fatia foi publicada no miolo!");

            setTimeout(() => { // Notificação falsa de interação
                const randomFriend = ['@Miolinho42', '@CascaFeliz', '@FermentoAmigo'][Math.floor(Math.random() * 3)];
                showToast(`${randomFriend} comentou: 'ficou crocante 😳'`);
            }, 5000);
        }
    });

    // --- PERFIL ---
    function renderProfileScreen() {
        profileUsernameDisplay.textContent = currentUser.username;
        profileBreadTypeDisplay.textContent = currentUser.breadType.replace(/_/g, ' '); // Ex: pao_de_forma -> pao de forma
        profileStatusDisplay.textContent = currentUser.status;
        profileBioInput.value = currentUser.bio;
        profileAvatarBaseImg.src = currentUser.avatar;

        // Limpar acessórios antigos
        profileAvatarDisplay.querySelectorAll('.avatar-accessory').forEach(acc => acc.remove());
        // Adicionar acessórios atuais
        currentUser.accessories.forEach(accId => {
            const itemData = SHOP_ITEMS_DATA.find(item => item.id === accId);
            if (itemData) {
                const accImg = document.createElement('img');
                accImg.src = itemData.image;
                accImg.alt = itemData.name;
                accImg.classList.add('avatar-accessory');
                Object.assign(accImg.style, itemData.css); // Aplica estilos de posicionamento
                profileAvatarDisplay.appendChild(accImg);
            }
        });
        
        // Renderizar posts do usuário no perfil
        profilePostsContainer.innerHTML = '';
        const userPosts = allPosts.filter(p => p.author === currentUser.username)
                                  .sort((a,b) => b.timestamp - a.timestamp);
        if (userPosts.length === 0) {
            profilePostsContainer.innerHTML = "<p>Você ainda não publicou nenhuma fatia.</p>";
        } else {
            userPosts.forEach(post => profilePostsContainer.appendChild(createPostElement(post)));
        }
    }
    saveBioBtn.addEventListener('click', () => {
        playCrocSound();
        currentUser.bio = profileBioInput.value;
        saveUserData();
        showToast("Sua bio bizarra foi atualizada!");
    });

    // --- LOJA ---
    function renderStoreScreen() {
        storeItemsContainer.innerHTML = '';
        userSugarCrystalsStore.textContent = currentUser.sugarCrystals;
        SHOP_ITEMS_DATA.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('store-item');
            const isOwned = currentUser.ownedItems.includes(item.id);
            const canAfford = currentUser.sugarCrystals >= item.price;
            const isEquipped = currentUser.accessories.includes(item.id);

            itemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h4>${item.name}</h4>
                <p>Preço: ${item.price} 🍬</p>
                <button data-item-id="${item.id}" ${isOwned || !canAfford ? 'disabled' : ''}>
                    ${isOwned ? 'Adquirido' : (canAfford ? 'Comprar' : 'Insuficiente')}
                </button>
                ${isOwned ? `<button data-equip-id="${item.id}" class="equip-btn">${isEquipped ? 'Desequipar' : 'Equipar'}</button>` : ''}
            `;
            storeItemsContainer.appendChild(itemDiv);
        });

        // Event listeners para botões de comprar
        storeItemsContainer.querySelectorAll('button[data-item-id]').forEach(button => {
            button.addEventListener('click', (e) => {
                if (e.target.classList.contains('equip-btn')) return; // Não é compra
                playCrocSound();
                const itemId = e.target.dataset.itemId;
                const item = SHOP_ITEMS_DATA.find(i => i.id === itemId);
                if (item && !currentUser.ownedItems.includes(itemId) && currentUser.sugarCrystals >= item.price) {
                    currentUser.sugarCrystals -= item.price;
                    currentUser.ownedItems.push(itemId);
                    // Equipar automaticamente ao comprar (opcional)
                    if (!currentUser.accessories.includes(itemId)) currentUser.accessories.push(itemId); 
                    saveUserData();
                    renderStoreScreen(); // Re-renderiza a loja
                    renderProfileScreen(); // Atualiza avatar no perfil
                    updateSugarCrystalsDisplay();
                    showToast(`${item.name} comprado e equipado!`);
                }
            });
        });
        // Event listeners para botões de equipar/desequipar
        storeItemsContainer.querySelectorAll('button.equip-btn[data-equip-id]').forEach(button => {
            button.addEventListener('click', (e) => {
                playCrocSound();
                const itemId = e.target.dataset.equipId;
                const itemIndex = currentUser.accessories.indexOf(itemId);
                if (itemIndex > -1) { // Se está equipado, desequipa
                    currentUser.accessories.splice(itemIndex, 1);
                    showToast(`${SHOP_ITEMS_DATA.find(i=>i.id === itemId).name} desequipado.`);
                } else { // Se não está equipado, equipa (limite de acessórios pode ser implementado aqui)
                    currentUser.accessories.push(itemId);
                     showToast(`${SHOP_ITEMS_DATA.find(i=>i.id === itemId).name} equipado!`);
                }
                saveUserData();
                renderStoreScreen();
                renderProfileScreen();
            });
        });
    }

    // --- MINI GAME ---
    function updateSugarCrystalsDisplay() {
        if (currentUser) {
            userSugarCrystalsStore.textContent = currentUser.sugarCrystals;
            userSugarCrystalsGame.textContent = currentUser.sugarCrystals;
        }
    }
    dipInMilkBtn.addEventListener('click', () => {
        playCrocSound();
        if (currentUser) {
            const crystalsEarned = Math.floor(Math.random() * 10) + 1; // 1-10 cristais
            currentUser.sugarCrystals += crystalsEarned;
            saveUserData();
            updateSugarCrystalsDisplay();
            gameResultText.textContent = `Você mergulhou no leite e ganhou ${crystalsEarned} Cristais de Açúcar! 🍬`;
            dipInMilkBtn.textContent = "Mergulhar de Novo! 🥛";
            setTimeout(() => gameResultText.textContent = '', 3000);
        }
    });

    // --- INICIALIZAÇÃO DA APLICAÇÃO ---
    function initializeApp() {
        navUsernameDisplay.textContent = currentUser.username;
        navUserAvatar.src = currentUser.avatar;
        loadPostsData(); // Carrega todos os posts (fakes e do usuário)
        switchScreen('main');
        switchAppSection('home-feed-screen'); // Começa no feed
        updateSugarCrystalsDisplay();
        
        // Fake notification periódica
        setInterval(() => {
            if(currentUser && document.visibilityState === "visible") { // Só se logado e aba visível
                const randomMessages = [
                    `@Miolinho42 passou manteiga no seu post!`,
                    `@CascaGrossa te adicionou à torrada! (não implementado de verdade)`,
                    `Sua fatia de pão está ficando popular!`,
                    `Alerta de mofo! Verifique seu status. (brincadeira)`
                ];
                const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
                showToast(randomMsg);
            }
        }, 90000); // A cada 1 minuto e meio
    }

    // Setup inicial
    const savedTheme = localStorage.getItem('breadBookTheme') || 'light';
    applyTheme(savedTheme);
    navButtons.forEach(button => button.addEventListener('click', (e) => switchAppSection(e.currentTarget.dataset.target)));

    if (loadUserData()) {
        initializeApp();
    } else {
        switchScreen('auth');
    }
});