document.addEventListener('DOMContentLoaded', () => {
    const brickNameInput = document.getElementById('brick-name');
    const brickNameResult = document.getElementById('brick-name-result');
    const soundBlop = document.getElementById('sound-blop');
    const soundCling = document.getElementById('sound-cling');
    const soundEpic = document.getElementById('sound-epic');

    // Personalização: Nome do Tijolo
    if (brickNameInput && brickNameResult) {
        brickNameInput.addEventListener('input', () => {
            const name = brickNameInput.value.trim();
            if (name) {
                brickNameResult.textContent = `Esse é o Tijolo ${name}. Ele é seu.`;
                if (soundBlop && name.length === 1 || name.endsWith(' ')) { // Toca som ao iniciar ou nova palavra
                    // soundBlop.currentTime = 0;
                    // soundBlop.play().catch(e => console.warn("Audio play failed:", e));
                }
            } else {
                brickNameResult.textContent = '';
            }
        });
    }

    // Carregar tijolos do LocalStorage (se houver)
    loadBricksFromStorage();

    // Toggle Dark Mode (Exemplo simples, pode ser um botão no header/footer)
    // Adicione um botão com id="toggle-dark-mode" no HTML para usar
    const toggleDarkModeButton = document.createElement('button');
    toggleDarkModeButton.textContent = '🌙/☀️';
    toggleDarkModeButton.style.position = 'fixed';
    toggleDarkModeButton.style.top = '20px';
    toggleDarkModeButton.style.right = '20px';
    toggleDarkModeButton.style.zIndex = '1001';
    toggleDarkModeButton.className = 'btn';
    document.body.appendChild(toggleDarkModeButton);

    toggleDarkModeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        // Salvar preferência
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    // Checar preferência de dark mode no load
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }

});

function scrollToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
}

// Modal 360
const brickModal = document.getElementById('brick-modal');
const modalBrickContainer = document.getElementById('modal-brick-container');

function show360Modal(brickType) {
    if (!brickModal || !modalBrickContainer) return;

    modalBrickContainer.innerHTML = ''; // Limpa conteúdo anterior
    const brick3D = document.createElement('div');
    brick3D.className = 'modal-brick-animated'; // Reutiliza a animação CSS
    
    // Adiciona faces ao tijolo do modal
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    faces.forEach(faceName => {
        const face = document.createElement('div');
        face.className = `face ${faceName}`;
        brick3D.appendChild(face);
    });
    
    // Define a cor do tijolo no modal
    let brickColor;
    switch (brickType) {
        case 'classic': brickColor = 'var(--color-brick-red)'; break;
        case 'obsidian': brickColor = 'var(--color-brick-obsidian)'; break;
        case 'solar': brickColor = 'var(--color-brick-solar)'; break;
        default: brickColor = 'var(--color-brick-red)';
    }
    // Aplica a cor a todas as faces
    Array.from(brick3D.children).forEach(face => {
        face.style.backgroundColor = brickColor;
    });

    modalBrickContainer.appendChild(brick3D);
    brickModal.style.display = 'flex';
    playSound('sound_cling');
}

function close360Modal() {
    if (brickModal) brickModal.style.display = 'none';
}

// Geração de Certificado (Preview HTML)
const certificateModal = document.getElementById('certificate-modal');
const certificateContent = document.getElementById('certificate-content');

function generateCertificatePreview() {
    if (!certificateModal || !certificateContent) return;
    const brickName = document.getElementById('brick-name').value.trim() || "Sem Nome";
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const fakeSha256 = 'SHA256-' + Array(64).fill(0).map(() => Math.random().toString(16)[2] || '0').join('');

    certificateContent.innerHTML = `
        <p>Este certificado atesta que</p>
        <p style="font-size: 1.5em; text-align: center; margin: 20px 0; color: var(--color-primary);"><strong>${brickName}</strong></p>
        <p>é um TIJOLO VIRTUAL™ de posse legítima e indiscutível.</p>
        <p><strong>Data de Aquisição:</strong> ${currentDate}</p>
        <p><strong>Código Único:</strong> <small>${fakeSha256}</small></p>
        <p><strong>Registro:</strong> Blockchain da Imaginação (Bloco #${Math.floor(Math.random() * 1000000)})</p>
        <p id="certificate-signature">Ass.: A Gerência do Vazio Construtivo</p>
    `;
    certificateModal.style.display = 'flex';
    playSound('sound_epic');
}

function closeCertificateModal() {
    if (certificateModal) certificateModal.style.display = 'none';
}

function downloadCertificate() {
    // Simulação. Para PDF real, usar jsPDF ou pdf-lib
    alert("Seu certificado (.PDF simulado) seria baixado agora. Imagine que ele está lindo!");
    // Exemplo com jsPDF (precisaria incluir a lib):
    // const { jsPDF } = window.jspdf;
    // const doc = new jsPDF();
    // const content = certificateContent.innerText; // Simplificado, ideal é renderizar HTML
    // doc.text(content, 10, 10);
    // doc.save(`Certificado_Tijolo_${document.getElementById('brick-name').value || 'SemNome'}.pdf`);
    closeCertificateModal();
}

// Presentear
const giftDeliveryAnimation = document.getElementById('gift-delivery-animation');
const giftSentMessage = document.getElementById('gift-sent-message');

function sendGift() {
    const recipientName = document.getElementById('recipient-name').value;
    const recipientEmail = document.getElementById('recipient-email').value;

    if (!recipientName || !recipientEmail) {
        alert("Por favor, preencha o nome e e-mail do presenteado.");
        return;
    }
    if (!giftDeliveryAnimation || !giftSentMessage) return;

    giftDeliveryAnimation.classList.remove('gift-delivery-animation-hidden');
    giftDeliveryAnimation.classList.add('gift-delivery-animation-visible');
    
    // Animação simulada
    const deliveryBox = giftDeliveryAnimation.querySelector('.delivery-box');
    if (deliveryBox) deliveryBox.style.animation = 'none'; // Reset animation
    setTimeout(() => {
      if (deliveryBox) deliveryBox.style.animation = ''; // Re-apply animation
    }, 10);


    setTimeout(() => {
        giftSentMessage.textContent = `Um Tijolo Virtual foi enviado para ${recipientName}! E com ele, a promessa de nada.`;
        playSound('sound_cling');
        // Aqui, em um app real, você faria uma chamada AJAX para um backend
        // para realmente enviar um e-mail.
    }, 2000); // Simula tempo de "envio"

    // Limpar formulário após um tempo
    setTimeout(() => {
        document.getElementById('recipient-name').value = '';
        document.getElementById('recipient-email').value = '';
        giftDeliveryAnimation.classList.remove('gift-delivery-animation-visible');
        giftDeliveryAnimation.classList.add('gift-delivery-animation-hidden');
        giftSentMessage.textContent = '';
    }, 7000);
}

// LocalStorage para "Meus Tijolos"
function saveBrickToStorage(brickData) {
    let bricks = JSON.parse(localStorage.getItem('virtualBricks')) || [];
    bricks.push(brickData);
    localStorage.setItem('virtualBricks', JSON.stringify(bricks));
    console.log("Tijolo salvo:", brickData);
    // Poderia adicionar uma seção "Meus Tijolos" e atualizar a UI aqui
}

function loadBricksFromStorage() {
    let bricks = JSON.parse(localStorage.getItem('virtualBricks')) || [];
    console.log("Tijolos carregados:", bricks);
    // Popular a UI se houver uma seção "Meus Tijolos"
}

// Seleção de Plano (exemplo de interação)
function selectPlan(planName) {
    alert(`Você selecionou o plano: ${planName}! Prepare-se para construir... nada de concreto.`);
    // Lógica de "compra":
    let numBricks = 0;
    if (planName === 'Solo') numBricks = 1;
    if (planName === 'Muro') numBricks = 4;
    if (planName === 'Fundacao') numBricks = 10;

    for (let i = 0; i < numBricks; i++) {
        const brickData = {
            id: `brick-${Date.now()}-${i}`,
            name: `Meu Tijolo ${planName} #${i+1}`,
            type: planName === 'Fundacao' && i === numBricks -1 ? 'Voador' : 'Clássico', // Último da fundação é voador
            timestamp: new Date().toISOString()
        };
        saveBrickToStorage(brickData);
    }
    playSound('sound_epic');
    // Aqui você redirecionaria para um checkout ou daria mais instruções.
}

// Funções de áudio
function playSound(soundId) {
    const soundElement = document.getElementById(soundId);
    if (soundElement) {
        soundElement.currentTime = 0; // Permite tocar repetidamente
        soundElement.play().catch(e => console.warn("Audio play failed for " + soundId + ":", e));
    }
}


// Fechar modais ao clicar fora
window.onclick = function(event) {
    if (event.target == brickModal) {
        close360Modal();
    }
    if (event.target == certificateModal) {
        closeCertificateModal();
    }
}