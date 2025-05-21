document.addEventListener('DOMContentLoaded', () => {
    // --- Configuração tsParticles (Partículas Flutuantes) ---
    tsParticles.load("particle-container", {
        fpsLimit: 60,
        particles: {
            number: { value: 50, density: { enable: true, value_area: 800 } },
            color: { value: ["#ffffff", "#ffd700", "#A855F7"] },
            shape: { type: "circle" },
            opacity: { value: 0.3, random: true, anim: { enable: true, speed: 0.5, opacity_min: 0.1, sync: false } },
            size: { value: 2, random: true, anim: { enable: true, speed: 2, size_min: 0.5, sync: false } },
            move: {
                enable: true,
                speed: 0.8,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: { enable: false, rotateX: 600, rotateY: 1200 }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: false, mode: "repulse" }, // Desativado para não sobrecarregar
                onclick: { enable: false, mode: "push" },   // Desativado
                resize: true
            }
        },
        detectRetina: true,
    });

    // --- ScrollReveal ---
    const sr = ScrollReveal({
        distance: '50px',
        duration: 1000,
        easing: 'ease-in-out',
        reset: false // Só revela uma vez
    });

    sr.reveal('.scroll-reveal', { interval: 150, origin: 'bottom', viewFactor: 0.3 });
    // Para a história, revelar parágrafos individualmente
    sr.reveal('#story .story-scroll p[data-reveal]', { interval: 300, origin: 'left', delay: 200 });


    // --- Efeito de Cursor Brilhante nos Botões de Compra ---
    const buyButtons = document.querySelectorAll('.cta-button.gold-button, .plan-button');
    buyButtons.forEach(button => {
        button.addEventListener('mousemove', e => {
            // Este efeito é mais complexo de fazer bem, o CSS :hover já dá um bom resultado.
            // Podemos adicionar um brilho seguindo o mouse se necessário, mas por ora o CSS é suficiente.
        });
    });

    // --- Efeito de "Explosão Cósmica" ao Clicar ---
    const explosionContainer = document.getElementById('cosmic-explosion-container');
    function createCosmicExplosion(x, y) {
        for (let i = 0; i < 15; i++) { // Cria várias partículas
            const particle = document.createElement('div');
            particle.classList.add('cosmic-particle');
            
            const size = Math.random() * 10 + 5; // Tamanho entre 5px e 15px
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Posição inicial no clique
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            // Direção aleatória para a animação
            const angle = Math.random() * Math.PI * 2;
            particle.style.setProperty('--vx', Math.cos(angle));
            particle.style.setProperty('--vy', Math.sin(angle));

            explosionContainer.appendChild(particle);

            // Remove a partícula após a animação
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
        }
    }

    document.body.addEventListener('click', (e) => {
        // Verifica se o clique foi em um botão que deveria ter explosão
        if (e.target.matches('.cta-button, .plan-button')) {
            createCosmicExplosion(e.clientX, e.clientY);
        }
    });
    
    // --- Formulário e Script Visual de "Processando Energia" ---
    const form = document.getElementById('invisibleStoneForm');
    const processingDiv = document.getElementById('processing-animation');
    const processingStatus = document.getElementById('processing-status');
    const confirmationMessage = document.getElementById('confirmation-message');
    const buyNowHeroButton = document.getElementById('buyNowHero');
    const formSection = document.getElementById('form-section');

    if (buyNowHeroButton && formSection) {
        buyNowHeroButton.addEventListener('click', (e) => {
            e.preventDefault(); // Previne comportamento padrão se for um link
            createCosmicExplosion(e.clientX, e.clientY); // Adiciona explosão
            formSection.scrollIntoView({ behavior: 'smooth' });
            // Opcional: dar foco ao primeiro campo do formulário
            const firstInput = formSection.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        });
    }
    
    // Lógica para os botões de plano levarem ao formulário
    const planButtons = document.querySelectorAll('.plan-button');
    planButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            createCosmicExplosion(e.clientX, e.clientY);
            const planName = button.dataset.plan;
            // Poderíamos pré-selecionar o plano no formulário aqui se tivéssemos um campo para isso
            console.log(`Plano selecionado: ${planName}`);
            formSection.scrollIntoView({ behavior: 'smooth' });
            const firstInput = formSection.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        });
    });


    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;

            processingDiv.style.display = 'block';
            confirmationMessage.style.display = 'none';
            
            const statuses = [
                "Alinhando frequências quânticas...",
                "Canalizando energia do vácuo...",
                "Desmaterializando matéria escura...",
                "Consultando oráculos invisíveis...",
                "Tecendo fios de pura sorte..."
            ];
            let statusIndex = 0;

            processingStatus.textContent = statuses[statusIndex];
            const intervalId = setInterval(() => {
                statusIndex = (statusIndex + 1) % statuses.length;
                processingStatus.textContent = statuses[statusIndex];
            }, 1500); // Muda a cada 1.5 segundos

            // Simula o processamento
            await new Promise(resolve => setTimeout(resolve, 7000)); // 7 segundos de "processamento"

            clearInterval(intervalId);
            processingDiv.style.display = 'none';
            
            // E-mail de confirmação (simulado no console e na página)
            const emailContent = `
Olá ${name},

Sua Pedra Invisível da Sorte™ foi enviada com sucesso para ${email}!

Prepare-se para uma onda de sorte, foco e prosperidade que você (não) verá chegando.
Lembre-se: o poder está na sua crença (ou não, ela funciona de qualquer jeito).

Atenciosamente,
A Equipe da Pedra Invisível da Sorte™
(Departamento de Fenômenos Intangíveis)

P.S. Se não encontrar a pedra no seu e-mail, não se preocupe. É porque ela é invisível. 😉
            `;
            console.log("--- E-MAIL DE CONFIRMAÇÃO (SIMULADO) ---");
            console.log(emailContent);

            confirmationMessage.innerHTML = `Parabéns, ${name}! Sua Pedra Invisível foi "enviada" para ${email}. <br>Verifique seu console (F12) para o e-mail de confirmação simulado.`;
            confirmationMessage.style.display = 'block';
            form.reset();
        });
    }

    // --- Controle de Som Ambiente ---
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const ambientSound = document.getElementById('ambientSound');

    if (soundToggleBtn && ambientSound) {
        // Tentar dar autoplay suave se permitido pelo navegador, ou esperar interação
        ambientSound.volume = 0.1; // Volume baixo
        let soundEnabled = false;

        function toggleSound() {
            if (soundEnabled) {
                ambientSound.pause();
                soundToggleBtn.textContent = '🔇';
                soundEnabled = false;
            } else {
                ambientSound.play().catch(e => console.log("Autoplay bloqueado, aguardando interação do usuário.", e));
                soundToggleBtn.textContent = '🔊';
                soundEnabled = true;
            }
        }
        soundToggleBtn.addEventListener('click', toggleSound);
        
        // Opcional: tentar iniciar o som após a primeira interação do usuário em qualquer lugar
        // document.body.addEventListener('click', () => {
        //    if (!soundEnabled && ambientSound.paused) {
        //        ambientSound.play().catch(e => {});
        //        soundToggleBtn.textContent = '🔊';
        //        soundEnabled = true;
        //    }
        // }, { once: true }); // Apenas uma vez
    }

    // Smooth scroll para links internos (se houver algum)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Ignorar se for apenas "#" ou se for o botão do modo zen
            if (href === "#" || this.target === "_blank") return; 
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            if (targetElement) {
                 targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

}); // Fim do DOMContentLoaded