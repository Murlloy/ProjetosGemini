document.addEventListener('DOMContentLoaded', () => {
    // --- Configurações e Constantes Globais ---
    const SOLAR_SYSTEM_ID = 'solar-system';
    const SIM_CONTAINER_ID = 'simulation-container';
    const DATA_URL = 'assets/planetas.json';

    // Escalas (ajuste conforme necessário para visualização)
    // 1 milhão de km = X px de raio de órbita
    const ORBIT_RADIUS_SCALE = 2.0; // Ex: 150M km (Terra) -> 75px de raio. Ajustar para caber.
    // 1000 km de diâmetro = Y px de diâmetro visual
    const PLANET_DIAMETER_SCALE = 1 / 2000; // Ex: 12742 km (Terra) -> ~6.3px.
    const MIN_PLANET_VISUAL_DIAMETER = 4; // px
    const MAX_PLANET_VISUAL_DIAMETER = 50; // px
    const SUN_VISUAL_DIAMETER = 5; // px
    const MOON_ORBIT_SCALE = 20; // Fator para aumentar visualmente a órbita da lua
    const MOON_DIAMETER_SCALE_FACTOR = 0.5; // Relativo ao planeta mãe visualmente

    // --- Estado da Simulação ---
    let state = {
        celestialBodiesData: [],
        celestialBodyElements: {}, // { 'nome': { el, orbitEl, (ringsEl) } }
        isRunning: true,
        timeScale: 1, // 1x, 2x, 5x, 10x
        currentTime: 0, // Em "dias terrestres" simulados
        camera: {
            x: 0, // Pan offset X (do centro do #solar-system)
            y: 0, // Pan offset Y
            zoom: 1,
            target: null, // null (heliocêntrico) ou nome do planeta
            isAnimating: false,
            animationStartTime: 0,
            animationDuration: 1000, // ms
            startX: 0, startY: 0, startZoom: 0,
            endX: 0, endY: 0, endZoom: 0,
        },
        mode: 'heliocentric', // 'heliocentric' ou 'planet_focus'
        focusedBody: null, // Objeto do planeta/sol focado
        isPanning: false,
        lastPanX: 0,
        lastPanY: 0,
        lastTimestamp: 0,
    };

    // --- Seletores de DOM ---
    const simContainer = document.getElementById(SIM_CONTAINER_ID);
    const solarSystemDiv = document.getElementById(SOLAR_SYSTEM_ID);
    const togglePauseBtn = document.getElementById('toggle-pause');
    const timeScaleSelect = document.getElementById('time-scale');
    const resetBtn = document.getElementById('reset-sim');
    const toggleModeBtn = document.getElementById('toggle-mode');
    const hudDiv = document.getElementById('hud');
    const tooltipDiv = document.getElementById('tooltip');

    // --- Funções de Utilitários e Cálculos ---
    function getScaledOrbitRadius(distanciaMilhoesKm) {
        return distanciaMilhoesKm * ORBIT_RADIUS_SCALE;
    }

    function getScaledDiameter(diametroKm) {
        const scaled = diametroKm * PLANET_DIAMETER_SCALE;
        return Math.max(MIN_PLANET_VISUAL_DIAMETER, Math.min(scaled, MAX_PLANET_VISUAL_DIAMETER));
    }

    function calculateOrbitalPosition(radius, periodDays, currentTime) {
        if (periodDays === 0) return { x: 0, y: 0 }; // Sol ou corpo estacionário
        const angle = (currentTime / periodDays) * 2 * Math.PI; // Radianos
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
        };
    }

    // Easing function for camera animation (ease-out cubic)
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // --- Funções de Criação e Atualização de DOM ---
    function createCelestialBodyElement(bodyData) {
        const bodyEl = document.createElement('div');
        bodyEl.id = bodyData.nome.toLowerCase().replace(/\s+/g, '-');
        bodyEl.className = `celestial-body ${bodyData.tipo}`;
        bodyEl.setAttribute('role', 'img');
        bodyEl.setAttribute('aria-label', bodyData.nome);

        let visualDiameter;
        if (bodyData.tipo === 'estrela') {
            visualDiameter = SUN_VISUAL_DIAMETER;
            bodyEl.classList.add('sun');
            bodyEl.style.transform = `translate3d(${-visualDiameter / 2}px, ${-visualDiameter / 2}px, 0)`;
        } else if (bodyData.tipo === 'lua') {
            const motherPlanet = state.celestialBodiesData.find(p => p.nome === bodyData.planetaMae);
            const motherPlanetEl = state.celestialBodyElements[motherPlanet.nome].el;
            visualDiameter = parseFloat(motherPlanetEl.style.width) * MOON_DIAMETER_SCALE_FACTOR;
             visualDiameter = Math.max(2, visualDiameter); // Min size for moon
        }
        else {
            visualDiameter = getScaledDiameter(bodyData.diametro);
        }

        bodyEl.style.width = `${visualDiameter}px`;
        bodyEl.style.height = `${visualDiameter}px`;
        bodyEl.style.backgroundColor = bodyData.cor; // Fallback se textura não carregar
        if (bodyData.textura) {
            bodyEl.style.backgroundImage = `url('${bodyData.textura}')`;
        }
        // bodyEl.textContent = bodyData.nome.substring(0,2); // Opcional: iniciais no planeta


        let orbitEl = null;
        if (bodyData.tipo === 'planeta' && bodyData.distanciaDoSol > 0) {
            orbitEl = document.createElement('div');
            orbitEl.className = 'planet-orbit';
            const orbitRadius = getScaledOrbitRadius(bodyData.distanciaDoSol);
            orbitEl.style.width = `${orbitRadius * 2}px`;
            orbitEl.style.height = `${orbitRadius * 2}px`;
            // Posicionado no centro do #solar-system, o planeta se moverá em relação a ele
            solarSystemDiv.appendChild(orbitEl);
        } else if (bodyData.tipo === 'lua') {
            // Órbita da lua é relativa ao planeta mãe, não desenhamos aqui, mas podemos
            // orbitEl para a lua seria dinâmico em torno do planeta mãe
        }

        // Anéis para Saturno
        let ringsEl = null;
        if (bodyData.aneis) {
            ringsEl = document.createElement('div');
            ringsEl.className = 'saturn-rings';
            const ringDiameter = visualDiameter * 2.5; // Ajuste o tamanho dos anéis
            ringsEl.style.width = `${ringDiameter}px`;
            ringsEl.style.height = `${ringDiameter * 0.7}px`; // Elíptico
             // O posicionamento dos anéis será junto com o planeta
        }


        if (bodyData.tipo !== 'lua') {
            solarSystemDiv.appendChild(bodyEl);
            if (ringsEl) solarSystemDiv.appendChild(ringsEl);
        } else {
            // A lua será filha do elemento do seu planeta mãe para facilitar o posicionamento relativo
            const motherPlanet = state.celestialBodiesData.find(p => p.nome === bodyData.planetaMae);
            if (motherPlanet && state.celestialBodyElements[motherPlanet.nome]) {
                state.celestialBodyElements[motherPlanet.nome].el.appendChild(bodyEl);
            }
        }


        return { el: bodyEl, orbitEl: orbitEl, ringsEl: ringsEl };
    }

    function updateHud(bodyData) {
        if (!bodyData) {
            hudDiv.classList.add('hidden');
            return;
        }
        hudDiv.classList.remove('hidden');
        document.getElementById('hud-nome').textContent = bodyData.nome;
        document.getElementById('hud-diametro').textContent = bodyData.diametro.toLocaleString();
        document.getElementById('hud-distancia').textContent = bodyData.distanciaDoSol ? bodyData.distanciaDoSol.toLocaleString() : 'N/A';
        document.getElementById('hud-periodo').textContent = bodyData.periodoOrbital ? bodyData.periodoOrbital.toLocaleString() : 'N/A';
        document.getElementById('hud-luas').textContent = bodyData.luas !== undefined ? bodyData.luas : (bodyData.tipo === 'lua' ? 'N/A' : '0');

        if (bodyData.periodoOrbital > 0) {
            const progress = ((state.currentTime / bodyData.periodoOrbital) % 1) * 100;
            document.getElementById('hud-progresso').textContent = progress.toFixed(1);
        } else {
            document.getElementById('hud-progresso').textContent = 'N/A';
        }

        const detailsDiv = document.getElementById('hud-planet-details');
        if (state.mode === 'planet_focus' && bodyData.infoDetalhada) {
            document.getElementById('hud-info-detalhada').textContent = bodyData.infoDetalhada;
            detailsDiv.style.display = 'block';
        } else {
            detailsDiv.style.display = 'none';
        }
    }

    function showTooltip(text, x, y) {
        tooltipDiv.textContent = text;
        tooltipDiv.style.left = `${x + 15}px`;
        tooltipDiv.style.top = `${y + 15}px`;
        tooltipDiv.classList.remove('hidden');
    }

    function hideTooltip() {
        tooltipDiv.classList.add('hidden');
    }


    // --- Lógica da Simulação e Animação ---
    function updateSimulation(deltaTime) {
        if (state.isRunning) {
            state.currentTime += deltaTime * state.timeScale;
        }

        // Aplica transformações da câmera ao contêiner do sistema solar
// O ponto (0,0) do solarSystemDiv está no centro da tela devido ao CSS (top: 50%, left: 50%).
// Queremos que o ponto do "mundo" (state.camera.x, state.camera.y) fique no centro da tela.
// Para isso, transladamos o solarSystemDiv de forma que este ponto do mundo se alinhe com o (0,0) do solarSystemDiv.
const cameraTranslateX = -state.camera.x * state.camera.zoom;
const cameraTranslateY = -state.camera.y * state.camera.zoom;
solarSystemDiv.style.transform = `translate3d(${cameraTranslateX}px, ${cameraTranslateY}px, 0) scale(${state.camera.zoom})`;

        state.celestialBodiesData.forEach(bodyData => {
            const bodyEls = state.celestialBodyElements[bodyData.nome];
            if (!bodyEls || !bodyEls.el) return;

            let baseX = 0, baseY = 0; // Coordenadas relativas ao centro do sistema solar ou planeta mãe

            if (bodyData.tipo === 'planeta') {
                const orbitRadius = getScaledOrbitRadius(bodyData.distanciaDoSol);
                const pos = calculateOrbitalPosition(orbitRadius, bodyData.periodoOrbital, state.currentTime);
                baseX = pos.x;
                baseY = pos.y;
                bodyEls.el.style.transform = `translate3d(${baseX - parseFloat(bodyEls.el.style.width)/2}px, ${baseY - parseFloat(bodyEls.el.style.height)/2}px, 0)`;
                // Em script.js, dentro de updateSimulation, para Saturno
if (bodyEls.ringsEl) {
    // Correção: Aplicar a translação para a posição de Saturno,
    // depois o auto-centramento dos anéis, depois a rotação.
    bodyEls.ringsEl.style.transform = `translate3d(${baseX}px, ${baseY}px, 0) translate(-50%, -50%) rotateX(60deg) rotateY(0deg)`;
}

            } else if (bodyData.tipo === 'lua') {
                const motherPlanetData = state.celestialBodiesData.find(p => p.nome === bodyData.planetaMae);
                if (motherPlanetData) {
                    // Órbita da lua é relativa ao planeta mãe
                    // Usar distanciaDoPlanetaMae, que está em milhões de km. Escalar para visualização.
                    const moonOrbitRadius = bodyData.distanciaDoPlanetaMae * MOON_ORBIT_SCALE;
                    const moonPos = calculateOrbitalPosition(moonOrbitRadius, bodyData.periodoOrbital, state.currentTime);
                    // Posição relativa ao centro do planeta mãe (que já está posicionado)
                    baseX = moonPos.x;
                    baseY = moonPos.y;
                     // A lua já é filha do elemento do planeta mãe, então transform é relativo
                    bodyEls.el.style.transform = `translate3d(${baseX - parseFloat(bodyEls.el.style.width)/2}px, ${baseY - parseFloat(bodyEls.el.style.height)/2}px, 0)`;
                }
            }
            // Sol fica no centro (0,0) do #solar-system
        });

        // Atualiza câmera se estiver animando
        if (state.camera.isAnimating) {
            const now = performance.now();
            const elapsed = now - state.camera.animationStartTime;
            let t = Math.min(1, elapsed / state.camera.animationDuration);
            t = easeOutCubic(t); // Aplicar easing

            state.camera.x = state.camera.startX + (state.camera.endX - state.camera.startX) * t;
            state.camera.y = state.camera.startY + (state.camera.endY - state.camera.startY) * t;
            state.camera.zoom = state.camera.startZoom + (state.camera.endZoom - state.camera.startZoom) * t;

            if (t >= 1) {
                state.camera.isAnimating = false;
                state.camera.x = state.camera.endX; // Garantir valor final exato
                state.camera.y = state.camera.endY;
                state.camera.zoom = state.camera.endZoom;
            }
        }
        // Aplica transformações da câmera ao contêiner do sistema solar
        // O centro de #solar-system é (0,0)
        // Pan: move o centro para state.camera.x, state.camera.y
        // Foco: centraliza o target. Se target for (tx, ty) no mundo, queremos que (tx,ty) seja o centro da tela.
        // A origem do transform do solarSystemDiv é top-left, mas seu conteúdo é relativo ao centro.
        // Queremos que o ponto (state.camera.x, state.camera.y) do *mundo* fique no centro da *tela*.
        // O centro do solarSystemDiv está em (width/2, height/2) da tela.
        // Então, o translate deve ser: (width/2 - state.camera.x*zoom, height/2 - state.camera.y*zoom)
        const centerX = simContainer.offsetWidth / 2;
        const centerY = simContainer.offsetHeight / 2;

        solarSystemDiv.style.transform =
            `translate3d(${centerX - state.camera.x * state.camera.zoom}px, ${centerY - state.camera.y * state.camera.zoom}px, 0) scale(${state.camera.zoom})`;

        // Atualiza HUD se houver um corpo focado
        if (state.focusedBody) {
            updateHud(state.focusedBody);
        }
    }

    function gameLoop(timestamp) {
        const deltaTime = state.lastTimestamp > 0 ? (timestamp - state.lastTimestamp) / 1000 * 24 : 0; // Convert ms to "days"
        state.lastTimestamp = timestamp;

        updateSimulation(deltaTime); // Passa o tempo decorrido em "dias"

        requestAnimationFrame(gameLoop);
    }

    // --- Funções de Controle da Câmera e Modo ---
    function focusOnBody(bodyData) {
        state.focusedBody = bodyData;
        state.mode = 'planet_focus';
        toggleModeBtn.textContent = 'Voltar ao Sol';
        toggleModeBtn.style.display = 'inline-block';

        const bodyEls = state.celestialBodyElements[bodyData.nome];
        if (!bodyEls || !bodyEls.el) return;

        // Posição atual do corpo no sistema solar (mundo)
        // Precisamos da posição absoluta no #solar-system
        let targetWorldX = 0;
        let targetWorldY = 0;

        if (bodyData.tipo === 'estrela') { // Sol
            // Sol está em (0,0) do #solar-system
        } else if (bodyData.tipo === 'planeta') {
            const orbitRadius = getScaledOrbitRadius(bodyData.distanciaDoSol);
            const pos = calculateOrbitalPosition(orbitRadius, bodyData.periodoOrbital, state.currentTime);
            targetWorldX = pos.x;
            targetWorldY = pos.y;
        } else if (bodyData.tipo === 'lua') {
            // Posição da lua é relativa à mãe. Precisamos da posição global da mãe.
            const motherPlanetData = state.celestialBodiesData.find(p => p.nome === bodyData.planetaMae);
            if (motherPlanetData) {
                const motherOrbitRadius = getScaledOrbitRadius(motherPlanetData.distanciaDoSol);
                const motherPos = calculateOrbitalPosition(motherOrbitRadius, motherPlanetData.periodoOrbital, state.currentTime);

                const moonOrbitRadius = bodyData.distanciaDoPlanetaMae * MOON_ORBIT_SCALE;
                const moonPos = calculateOrbitalPosition(moonOrbitRadius, bodyData.periodoOrbital, state.currentTime);
                targetWorldX = motherPos.x + moonPos.x;
                targetWorldY = motherPos.y + moonPos.y;
            }
        }


        // Iniciar animação da câmera
        state.camera.isAnimating = true;
        state.camera.animationStartTime = performance.now();
        state.camera.startX = state.camera.x;
        state.camera.startY = state.camera.y;
        state.camera.startZoom = state.camera.zoom;

        state.camera.endX = targetWorldX;
        state.camera.endY = targetWorldY;
        state.camera.endZoom = 5; // Zoom desejado para foco no planeta (ajustar)

        updateHud(bodyData); // Atualiza HUD imediatamente
    }

    function returnToSunView() {
        state.focusedBody = state.celestialBodiesData.find(b => b.tipo === 'estrela'); // Foca no sol
        state.mode = 'heliocentric';
        toggleModeBtn.style.display = 'none';

        // Animar câmera de volta para visão geral
        state.camera.isAnimating = true;
        state.camera.animationStartTime = performance.now();
        state.camera.startX = state.camera.x;
        state.camera.startY = state.camera.y;
        state.camera.startZoom = state.camera.zoom;

        state.camera.endX = 0; // Centro do sistema
        state.camera.endY = 0;
        state.camera.endZoom = 1; // Zoom padrão

        updateHud(state.focusedBody); // HUD para o Sol
    }

    function handleZoom(event) {
        event.preventDefault();
        if (state.camera.isAnimating) return;

        const zoomFactor = 0.1;
        const newZoom = state.camera.zoom * (1 - Math.sign(event.deltaY) * zoomFactor);
        state.camera.zoom = Math.max(0.1, Math.min(newZoom, 20)); // Limites de zoom
    }

    function startPan(clientX, clientY) {
        if (state.camera.isAnimating) return;
        state.isPanning = true;
        simContainer.style.cursor = 'grabbing';
        // Converter coordenadas da tela para coordenadas do mundo no zoom atual
        state.lastPanX = clientX;
        state.lastPanY = clientY;
    }

    function pan(clientX, clientY) {
        if (!state.isPanning || state.camera.isAnimating) return;
        const dx = clientX - state.lastPanX;
        const dy = clientY - state.lastPanY;

        // Movimento da câmera é inverso ao arrastar do mouse, e escalado pelo zoom
        state.camera.x -= dx / state.camera.zoom;
        state.camera.y -= dy / state.camera.zoom;

        state.lastPanX = clientX;
        state.lastPanY = clientY;
    }

    function endPan() {
        state.isPanning = false;
        simContainer.style.cursor = 'grab';
    }


    // --- Event Handlers ---
    function setupEventListeners() {
        togglePauseBtn.addEventListener('click', () => {
            state.isRunning = !state.isRunning;
            togglePauseBtn.textContent = state.isRunning ? 'Pausar' : 'Continuar';
            if (state.isRunning && state.lastTimestamp === 0) { // Se estava pausado no início
                state.lastTimestamp = performance.now() - 16; // Evita grande salto inicial
            } else if (!state.isRunning) {
                // Salvar o timestamp atual para calcular o deltaTime corretamente ao retomar
            }
        });

        timeScaleSelect.addEventListener('change', (e) => {
            state.timeScale = parseFloat(e.target.value);
        });

        resetBtn.addEventListener('click', () => {
            // Resetar estado para inicial
            state.isRunning = true;
            togglePauseBtn.textContent = 'Pausar';
            state.timeScale = 1;
            timeScaleSelect.value = "1";
            state.currentTime = 0;
            state.camera = { ...state.camera, x: 0, y: 0, zoom: 1, target: null, isAnimating: false };
            state.focusedBody = state.celestialBodiesData.find(b => b.tipo === 'estrela'); // Foca no Sol
            state.mode = 'heliocentric';
            toggleModeBtn.style.display = 'none';
            updateHud(state.focusedBody);
            // localStorage.removeItem('solarSystemSimState'); // Opcional: limpar estado salvo
        });

        toggleModeBtn.addEventListener('click', () => {
            if (state.mode === 'planet_focus') {
                returnToSunView();
            }
        });

        simContainer.addEventListener('wheel', handleZoom);
        simContainer.addEventListener('mousedown', (e) => startPan(e.clientX, e.clientY));
        simContainer.addEventListener('mousemove', (e) => pan(e.clientX, e.clientY));
        simContainer.addEventListener('mouseup', endPan);
        simContainer.addEventListener('mouseleave', endPan); // Para caso o mouse saia da área

        // Touch events para mobile
        let initialTouchDistance = null;
        simContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startPan(e.touches[0].clientX, e.touches[0].clientY);
            } else if (e.touches.length === 2) {
                // Zoom com pinch
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                initialTouchDistance = Math.sqrt(dx * dx + dy * dy);
            }
        });
        simContainer.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevenir scroll da página
            if (e.touches.length === 1) {
                pan(e.touches[0].clientX, e.touches[0].clientY);
            } else if (e.touches.length === 2 && initialTouchDistance) {
                 // Zoom com pinch
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const currentDistance = Math.sqrt(dx * dx + dy * dy);
                const zoomFactor = currentDistance / initialTouchDistance;
                
                const newZoom = state.camera.zoom * zoomFactor;
                state.camera.zoom = Math.max(0.1, Math.min(newZoom, 20));
                
                initialTouchDistance = currentDistance; // Update for next move
            }
        });
        simContainer.addEventListener('touchend', (e) => {
            endPan();
            initialTouchDistance = null;
        });


        // Eventos para cada corpo celestial (clique e hover)
        Object.values(state.celestialBodyElements).forEach(({ el }, index) => {
            const bodyData = state.celestialBodiesData[index]; // Assumindo mesma ordem
            if (el) {
                el.addEventListener('click', () => {
                    if (state.camera.isAnimating) return;
                    focusOnBody(bodyData);
                });
                el.addEventListener('mouseenter', (e) => {
                    if (state.camera.isAnimating) return;
                    showTooltip(bodyData.nome, e.clientX, e.clientY);
                    el.style.outline = '2px solid var(--hud-border)'; // Destaque visual
                });
                el.addEventListener('mousemove', (e) => { // Atualiza posição do tooltip
                     if (!tooltipDiv.classList.contains('hidden')) {
                        showTooltip(bodyData.nome, e.clientX, e.clientY);
                    }
                });
                el.addEventListener('mouseleave', () => {
                    hideTooltip();
                    el.style.outline = 'none';
                });
            }
        });
    }

    // --- Inicialização ---
    async function initialize() {
        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            state.celestialBodiesData = await response.json();

            state.celestialBodiesData.forEach(bodyData => {
                state.celestialBodyElements[bodyData.nome] = createCelestialBodyElement(bodyData);
            });

            // Definir foco inicial no Sol
            state.focusedBody = state.celestialBodiesData.find(b => b.tipo === 'estrela');
            updateHud(state.focusedBody);


            // Carregar estado salvo (opcional)
            // loadStateFromLocalStorage();

            setupEventListeners();
            requestAnimationFrame(gameLoop);

        } catch (error) {
            console.error("Falha ao inicializar a simulação:", error);
            solarSystemDiv.innerHTML = "<p style='color:red; text-align:center;'>Erro ao carregar dados dos planetas.</p>";
        }
    }

    // Opcional: Salvar e Carregar estado com LocalStorage
    // function saveStateToLocalStorage() {
    //     const minimalState = {
    //         currentTime: state.currentTime,
    //         timeScale: state.timeScale,
    //         camera: state.camera,
    //         mode: state.mode,
    //         focusedBodyName: state.focusedBody ? state.focusedBody.nome : null,
    //     };
    //     localStorage.setItem('solarSystemSimState', JSON.stringify(minimalState));
    // }
    // function loadStateFromLocalStorage() {
    //     const saved = localStorage.getItem('solarSystemSimState');
    //     if (saved) {
    //         const loadedState = JSON.parse(saved);
    //         state.currentTime = loadedState.currentTime || 0;
    //         state.timeScale = loadedState.timeScale || 1;
    //         timeScaleSelect.value = state.timeScale.toString();
    //         state.camera = { ...state.camera, ...loadedState.camera };
    //         state.mode = loadedState.mode || 'heliocentric';
    //         if (loadedState.focusedBodyName) {
    //             state.focusedBody = state.celestialBodiesData.find(b => b.nome === loadedState.focusedBodyName);
    //         } else {
    //             state.focusedBody = state.celestialBodiesData.find(b => b.tipo === 'estrela');
    //         }
    //         // Aplicar o modo carregado
    //         if (state.mode === 'planet_focus' && state.focusedBody && state.focusedBody.tipo !== 'estrela') {
    //             toggleModeBtn.textContent = 'Voltar ao Sol';
    //             toggleModeBtn.style.display = 'inline-block';
    //         } else {
    //             toggleModeBtn.style.display = 'none';
    //         }
    //         updateHud(state.focusedBody);
    //     }
    // }
    // window.addEventListener('beforeunload', saveStateToLocalStorage);


    initialize();
});