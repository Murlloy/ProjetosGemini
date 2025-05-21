document.addEventListener('DOMContentLoaded', () => {
    // Elementos da Barbie
    const barbieNomeDisplay = document.getElementById('barbieNomeDisplay');
    const barbieEmojiCabeca = document.getElementById('barbieEmojiCabeca');
    const barbieEmojiMaquiagem = document.getElementById('barbieEmojiMaquiagem');
    const barbieEmojiRoupa = document.getElementById('barbieEmojiRoupa');
    const barbieEmojiSapatos = document.getElementById('barbieEmojiSapatos');
    const barbieEmojiProfissao = document.getElementById('barbieEmojiProfissao');

    // Input do nome
    const barbieNomeInput = document.getElementById('barbieNomeInput');

    // Botões de opção
    const optionItems = document.querySelectorAll('.emoji-option');

    // Botão e container da imagem gerada
    const gerarImagemBtn = document.getElementById('gerarImagemBtn');
    const imagemGeradaContainer = document.getElementById('imagemGeradaContainer');
    const barbieLookCompletoDiv = document.getElementById('barbieLookCompleto'); // Div para capturar

    // Estado atual da Barbie
    let estadoBarbie = {
        nome: "Barbie",
        cabecaBase: "👱", // Emoji base para o cabelo/cabeça
        tomPele: "",     // Modificador de tom de pele (ex: "🏻")
        maquiagem: "",
        roupa: "👗",
        sapato: "",
        profissao: ""
    };

    // --- FUNÇÕES DE ATUALIZAÇÃO DA INTERFACE ---
    function atualizarNomeBarbie() {
        barbieNomeDisplay.textContent = estadoBarbie.nome || "Barbie";
    }

    function atualizarCabecaBarbie() {
        // Remove modificadores de gênero feminino/masculino explícitos se houver tom de pele
        // e o emoji base não for inerentemente de um gênero (ex: 👩‍🎤 vs 🧑‍🎤)
        // Esta lógica pode ficar complexa dependendo dos emojis base escolhidos.
        // Por simplicidade, vamos aplicar o tom de pele diretamente.
        // Se o emoji base já tem um tom (ex: 👱‍♀️), o modificador pode não funcionar como esperado
        // ou pode resultar em combinações estranhas. É melhor usar emojis base neutros
        // ou que sabidamente aceitam bem os modificadores.

        let cabecaFinal = estadoBarbie.cabecaBase;
        if (estadoBarbie.cabecaBase && estadoBarbie.cabecaBase !== '🚫') {
            // Tenta remover modificadores de tom de pele existentes antes de adicionar um novo
            // Isso é um pouco rudimentar. Uma solução mais robusta usaria regex para identificar e remover
            // todos os caracteres Fitzpatrick.
            const baseSemTomAntigo = estadoBarbie.cabecaBase
                .replace('🏻', '').replace('🏼', '').replace('🏽', '').replace('🏾', '').replace('🏿', '')
                .replace('♀️', '').replace('♂️', ''); // Remove também símbolos de gênero se presentes

            cabecaFinal = baseSemTomAntigo + estadoBarbie.tomPele;
        } else {
            cabecaFinal = '👩' + estadoBarbie.tomPele; // Rosto padrão se nenhum cabelo + tom
        }
        barbieEmojiCabeca.textContent = (estadoBarbie.cabecaBase === '🚫' || !estadoBarbie.cabecaBase) ? '👩' + estadoBarbie.tomPele : cabecaFinal;
    }

    function atualizarAcessoriosBarbie() {
        barbieEmojiMaquiagem.textContent = estadoBarbie.maquiagem === '🚫' ? '' : estadoBarbie.maquiagem;
        barbieEmojiRoupa.textContent = estadoBarbie.roupa === '🚫' ? '' : estadoBarbie.roupa;
        barbieEmojiSapatos.textContent = estadoBarbie.sapato === '🚫' ? '' : estadoBarbie.sapato;
        barbieEmojiProfissao.textContent = estadoBarbie.profissao === '🚫' ? '' : estadoBarbie.profissao;
    }

    function atualizarBarbieCompleta() {
        atualizarNomeBarbie();
        atualizarCabecaBarbie();
        atualizarAcessoriosBarbie();
    }

    // --- FUNÇÃO PARA GERENCIAR BOTÕES SELECIONADOS ---
    function updateSelectedButton(type, activeValue) {
        document.querySelectorAll(`.emoji-option[data-type="${type}"]`).forEach(btn => {
            btn.classList.remove('selected');
            const btnValue = type === 'pele' ? btn.dataset.tone : btn.textContent.trim();
            const isClearButton = btn.classList.contains('clear-item');

            if (isClearButton && (activeValue === '🚫' || activeValue === '')) {
                btn.classList.add('selected');
            } else if (!isClearButton && btnValue === activeValue) {
                btn.classList.add('selected');
            }
        });
    }


    // --- EVENT LISTENERS ---
    barbieNomeInput.addEventListener('input', (e) => {
        estadoBarbie.nome = e.target.value;
        atualizarNomeBarbie();
    });

    optionItems.forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            const isClearAction = item.classList.contains('clear-item');
            let value;

            if (type === 'pele') {
                value = item.dataset.tone;
                estadoBarbie.tomPele = value;
            } else {
                value = isClearAction ? '🚫' : item.textContent.trim();
                if (type === 'cabelo') estadoBarbie.cabecaBase = value;
                else if (type === 'maquiagem') estadoBarbie.maquiagem = value;
                else if (type === 'roupa') estadoBarbie.roupa = value;
                else if (type === 'sapato') estadoBarbie.sapato = value;
                else if (type === 'profissao') estadoBarbie.profissao = value;
            }
            
            atualizarBarbieCompleta();

            // Atualizar seleção visual do botão
            document.querySelectorAll(`.emoji-option[data-type="${type}"]`).forEach(sibling => {
                sibling.classList.remove('selected');
            });
            item.classList.add('selected');
        });
    });

    gerarImagemBtn.addEventListener('click', () => {
        if (typeof html2canvas === 'undefined') {
            alert("Erro: Biblioteca html2canvas não carregada.");
            return;
        }
        
        imagemGeradaContainer.innerHTML = '<h3>Gerando imagem...</h3>'; // Feedback
        
        html2canvas(barbieLookCompletoDiv, {
            backgroundColor: "#fff9fa", // Cor de fundo da div para a imagem
            useCORS: true // Se estivesse usando imagens externas
        }).then(canvas => {
            imagemGeradaContainer.innerHTML = `<h3>Seu Look Gerado:</h3>`;
            const imgElement = document.createElement('img');
            imgElement.src = canvas.toDataURL('image/png');
            imgElement.alt = `Look gerado para ${estadoBarbie.nome}`;
            imagemGeradaContainer.appendChild(imgElement);

            // Opcional: Botão de download
            const downloadLink = document.createElement('a');
            downloadLink.href = imgElement.src;
            downloadLink.download = `${estadoBarbie.nome.replace(/\s+/g, '_')}_look.png`;
            downloadLink.textContent = 'Baixar Imagem';
            downloadLink.style.display = 'block';
            downloadLink.style.marginTop = '10px';
            imagemGeradaContainer.appendChild(downloadLink);

        }).catch(err => {
            console.error("Erro ao gerar imagem com html2canvas:", err);
            imagemGeradaContainer.innerHTML = '<h3>Erro ao gerar imagem. Tente novamente.</h3>';
        });
    });

    // --- INICIALIZAÇÃO ---
    function inicializar() {
        barbieNomeInput.value = estadoBarbie.nome;
        atualizarBarbieCompleta();
        // Marcar botões iniciais como selecionados
        updateSelectedButton('pele', estadoBarbie.tomPele);
        updateSelectedButton('cabelo', estadoBarbie.cabecaBase);
        updateSelectedButton('maquiagem', estadoBarbie.maquiagem);
        updateSelectedButton('roupa', estadoBarbie.roupa);
        updateSelectedButton('sapato', estadoBarbie.sapato);
        updateSelectedButton('profissao', estadoBarbie.profissao);
    }

    inicializar();
});