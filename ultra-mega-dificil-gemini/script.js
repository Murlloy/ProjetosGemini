// script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Carregado. Iniciando script.js...");

    // --- STATE MANAGEMENT ---
    let appData = {
        user: null,
        projects: [],
        history: []
    };

    const APP_STORAGE_KEY = 'projectManagerApp';

    function loadData() {
        console.log("loadData: Carregando dados do localStorage...");
        const storedData = localStorage.getItem(APP_STORAGE_KEY);
        if (storedData) {
            try {
                appData = JSON.parse(storedData);
                console.log("loadData: Dados carregados:", appData);
            } catch (e) {
                console.error("loadData: Erro ao parsear dados do localStorage. Resetando.", e);
                localStorage.removeItem(APP_STORAGE_KEY); // Remove dados corrompidos
                appData = { user: null, projects: [], history: [] };
            }
        } else {
            console.log("loadData: Nenhum dado encontrado. Inicializando com padrão.");
            appData = { user: null, projects: [], history: [] };
        }
        if (!appData.history) appData.history = [];
        if (!appData.projects) appData.projects = []; // Garantir que projects exista
    }

    function saveData() {
        try {
            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appData));
            console.log("saveData: Dados salvos no localStorage.");
        } catch (e) {
            console.error("saveData: Erro ao salvar dados no localStorage.", e);
            alert("Erro ao salvar dados. O localStorage pode estar cheio ou indisponível.");
        }
    }

    function addLogEntry(action, details = {}) {
        const entry = {
            date: new Date().toISOString(),
            action,
            details,
            user: appData.user || 'System'
        };
        appData.history.unshift(entry);
        if (appData.history.length > 100) {
            appData.history.pop();
        }
        // saveData() será chamado pela função que invoca addLogEntry
    }

    // --- UI ELEMENTS ---
    const appContent = document.getElementById('app-content');
    const themeToggleButton = document.getElementById('theme-toggle');
    const offlineStatusElement = document.getElementById('offline-status');

    // Modals
    const projectModal = document.getElementById('project-modal');
    const taskModal = document.getElementById('task-modal');
    const loginModal = document.getElementById('login-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');

    // Forms
    const projectForm = document.getElementById('project-form');
    const taskForm = document.getElementById('task-form');
    const loginForm = document.getElementById('login-form');

    // Verificação de elementos essenciais
    if (!appContent || !themeToggleButton || !projectModal || !taskModal || !loginModal || !modalBackdrop || !projectForm || !taskForm || !loginForm) {
        console.error("Erro crítico: Um ou mais elementos essenciais do DOM não foram encontrados. Verifique os IDs no HTML.");
        alert("Erro crítico na inicialização da página. Verifique o console para detalhes.");
        return; // Impede a execução do resto do script se elementos chave faltarem
    }
    console.log("UI Elements: Elementos do DOM selecionados com sucesso.");


    // --- UTILITIES ---
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    function formatDate(isoString) {
        if (!isoString) return 'N/A';
        try {
            return new Date(isoString).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
        } catch (e) { return 'Data inválida'; }
    }
    function formatDateTime(isoString) {
        if (!isoString) return 'N/A';
        try {
            return new Date(isoString).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        } catch (e) { return 'Data/hora inválida'; }
    }

    // --- THEME TOGGLE ---
    function toggleTheme() {
        console.log("toggleTheme: Função chamada.");
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeToggleButton.textContent = isDarkMode ? '🌙' : '☀️';
        themeToggleButton.setAttribute('aria-label', isDarkMode ? 'Alternar para tema claro' : 'Alternar para tema escuro');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        console.log("toggleTheme: Tema alterado para", isDarkMode ? 'dark' : 'light');
    }

    function applyStoredTheme() {
        console.log("applyStoredTheme: Aplicando tema salvo.");
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleButton.textContent = '🌙';
            themeToggleButton.setAttribute('aria-label', 'Alternar para tema claro');
            console.log("applyStoredTheme: Tema escuro aplicado.");
        } else {
            document.body.classList.remove('dark-mode'); // Garantir que não esteja em dark mode
            themeToggleButton.textContent = '☀️';
            themeToggleButton.setAttribute('aria-label', 'Alternar para tema escuro');
            console.log("applyStoredTheme: Tema claro aplicado.");
        }
    }

    // --- MODAL HANDLING ---
    function openModal(modalElement) {
        if (!modalElement) {
            console.error("openModal: Tentativa de abrir modal nulo.");
            return;
        }
        console.log("openModal: Abrindo modal - ", modalElement.id);
        modalBackdrop.style.display = 'block';
        modalElement.style.display = 'block';
        modalElement.setAttribute('aria-hidden', 'false');
        const firstFocusable = modalElement.querySelector('input, select, textarea, button');
        if (firstFocusable) firstFocusable.focus();
    }

    function closeModal(modalElement) {
        if (!modalElement) {
            console.error("closeModal: Tentativa de fechar modal nulo.");
            return;
        }
        console.log("closeModal: Fechando modal - ", modalElement.id);
        modalBackdrop.style.display = 'none';
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
    }
    function closeAllModals() {
        console.log("closeAllModals: Fechando todos os modals.");
        [projectModal, taskModal, loginModal].forEach(modal => {
            if (modal && modal.style.display !== 'none') closeModal(modal);
        });
    }
    
    // --- LOGIN (Optional Extra) ---
    function showLogin() {
        console.log("showLogin: Verificando status do login. Usuário:", appData.user);
        if (!appData.user) {
            openModal(loginModal);
        } else {
            handleRouteChange();
        }
    }

    // --- ROUTING ---
    function handleRouteChange() {
        console.log("handleRouteChange: Rota alterada. Hash atual:", window.location.hash);
        if (!appData.user && window.location.hash !== '') { // Não permite navegação sem login, exceto para a "página" de login implícita
            console.log("handleRouteChange: Usuário não logado. Redirecionando para login.");
            showLogin();
            return;
        }

        const hash = window.location.hash || '#/dashboard'; // Default to dashboard if hash is empty
        appContent.innerHTML = '';

        document.querySelectorAll('header nav a').forEach(a => a.classList.remove('active'));
        // Tenta encontrar o link exato primeiro, depois um link base (ex: #/project para #/project/1)
        let activeLink = document.querySelector(`header nav a[href="${hash}"]`);
        if (!activeLink && hash.includes('/')) {
            const baseHref = hash.substring(0, hash.lastIndexOf('/'));
             if(hash.startsWith('#/project/')) { // Especificamente para projetos
                activeLink = document.querySelector(`header nav a[href="#/dashboard"]`); // Ativa Dashboard se estiver em um projeto
            }
        }
         // Se ainda não encontrou e está na dashboard por default hash vazio, marca dashboard
        if (!activeLink && (hash === '#/dashboard' || hash === '')) {
            activeLink = document.querySelector(`header nav a[href="#/dashboard"]`);
        }
        if(activeLink) activeLink.classList.add('active');


        console.log("handleRouteChange: Processando hash:", hash);
        if (hash.startsWith('#/project/')) {
            const projectId = hash.split('/')[2];
            console.log("handleRouteChange: Renderizando página do projeto ID:", projectId);
            renderProjectPage(projectId);
        } else if (hash === '#/stats') {
            console.log("handleRouteChange: Renderizando página de estatísticas.");
            renderStatsHistoryPage();
        } else if (hash === '#/dashboard' || hash === '') { // Default to dashboard
            console.log("handleRouteChange: Renderizando dashboard.");
             if (window.location.hash !== '#/dashboard' && hash === '') { // Se hash estava vazio, define para dashboard
                window.location.hash = '#/dashboard'; // Isso vai re-trigger handleRouteChange, mas é ok.
                return; // Sai para evitar renderização duplicada imediata. A nova chamada fará o render.
            }
            renderDashboardPage();
        } else {
            console.warn("handleRouteChange: Rota não reconhecida:", hash, "Redirecionando para dashboard.");
            window.location.hash = '#/dashboard'; // Redireciona para uma rota conhecida
        }
    }


    // --- PAGE RENDERERS (MANTENHA AS FUNÇÕES COMO ESTAVAM, APENAS ADICIONEI LOGS) ---

    // 1. DASHBOARD PAGE
    function renderDashboardPage() {
        console.log("renderDashboardPage: Iniciando renderização.");
        appContent.innerHTML = `
            <section aria-labelledby="dashboard-title">
                <h2 id="dashboard-title" class="page-title">Dashboard de Projetos</h2>
                <button id="create-project-btn" class="btn-primary" aria-label="Criar novo projeto">Criar Novo Projeto</button>
                <div class="project-list" id="project-list-container">
                    <!-- Project cards will be inserted here -->
                </div>
            </section>
        `;

        const projectListContainer = document.getElementById('project-list-container');
        if (!projectListContainer) {
            console.error("renderDashboardPage: project-list-container não encontrado!");
            return;
        }

        if (appData.projects.length === 0) {
            projectListContainer.innerHTML = '<p>Nenhum projeto encontrado. Crie um novo projeto para começar!</p>';
        } else {
            appData.projects.forEach(project => {
                const projectCard = document.createElement('article');
                projectCard.className = 'project-card';
                projectCard.setAttribute('tabindex', '0');
                projectCard.innerHTML = `
                    <h3>${project.name}</h3>
                    <p>${project.description || 'Sem descrição.'}</p>
                    <small>Criado em: ${formatDate(project.createdAt)}</small>
                    <div class="project-card-actions">
                        <a href="#/project/${project.id}" class="button btn-secondary btn-sm view-project-link" data-project-id="${project.id}">Ver Projeto</a>
                        <button class="btn-danger btn-sm delete-project-btn" data-project-id="${project.id}" aria-label="Excluir projeto ${project.name}">Excluir</button>
                    </div>
                `;
                projectListContainer.appendChild(projectCard);
                projectCard.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const viewLink = projectCard.querySelector('.view-project-link');
                        if (viewLink) viewLink.click(); // Simula o clique no link
                    }
                });
            });
        }

        const createProjectBtn = document.getElementById('create-project-btn');
        if (createProjectBtn) {
            createProjectBtn.addEventListener('click', () => {
                console.log("Dashboard: Botão 'Criar Novo Projeto' clicado.");
                projectForm.reset();
                document.getElementById('project-modal-title').textContent = 'Criar Novo Projeto';
                openModal(projectModal);
            });
        } else {
            console.error("renderDashboardPage: create-project-btn não encontrado!");
        }


        projectListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-project-btn')) {
                const projectId = e.target.dataset.projectId;
                console.log("Dashboard: Botão 'Excluir Projeto' clicado para ID:", projectId);
                if (confirm('Tem certeza que deseja excluir este projeto e todas as suas tarefas?')) {
                    deleteProject(projectId);
                }
            }
            // Navegação por clique no link já é tratada pelo hashchange
        });
        console.log("renderDashboardPage: Renderização completa.");
    }

    // 2. PROJECT VIEW PAGE
    let currentProjectId = null;
    let currentFilters = { searchTerm: '', priority: 'todos', status: 'todos', dueDate: '' };

    function renderProjectPage(projectId) {
        console.log(`renderProjectPage: Iniciando renderização para projeto ID ${projectId}`);
        currentProjectId = projectId;
        const project = appData.projects.find(p => p.id === projectId);

        if (!project) {
            console.error(`renderProjectPage: Projeto com ID ${projectId} não encontrado.`);
            appContent.innerHTML = '<p class="error">Projeto não encontrado.</p> <a href="#/dashboard">Voltar para Dashboard</a>';
            return;
        }

        appContent.innerHTML = `
            <section aria-labelledby="project-title-${project.id}">
                <div class="project-header">
                    <h2 id="project-title-${project.id}" class="page-title">${project.name}</h2>
                    <p>${project.description || 'Sem descrição.'}</p>
                    <p><small>Criado em: ${formatDate(project.createdAt)}</small></p>
                    <button id="export-project-btn" class="btn-secondary btn-sm" aria-label="Exportar projeto como JSON">Exportar JSON</button>
                </div>

                <div class="project-actions">
                    <button id="create-task-btn" class="btn-primary" aria-label="Criar nova tarefa neste projeto">Nova Tarefa</button>
                    <div class="filter-controls">
                        <input type="search" id="task-search" placeholder="Buscar tarefas por título..." aria-label="Buscar tarefas por título" value="${currentFilters.searchTerm}">
                        <select id="filter-priority" aria-label="Filtrar por prioridade">
                            <option value="todos" ${currentFilters.priority === 'todos' ? 'selected' : ''}>Prioridade (Todas)</option>
                            <option value="Alta" ${currentFilters.priority === 'Alta' ? 'selected' : ''}>Alta</option>
                            <option value="Média" ${currentFilters.priority === 'Média' ? 'selected' : ''}>Média</option>
                            <option value="Baixa" ${currentFilters.priority === 'Baixa' ? 'selected' : ''}>Baixa</option>
                        </select>
                        <select id="filter-status" aria-label="Filtrar por status">
                            <option value="todos" ${currentFilters.status === 'todos' ? 'selected' : ''}>Status (Todos)</option>
                            <option value="A Fazer" ${currentFilters.status === 'A Fazer' ? 'selected' : ''}>A Fazer</option>
                            <option value="Em Progresso" ${currentFilters.status === 'Em Progresso' ? 'selected' : ''}>Em Progresso</option>
                            <option value="Concluído" ${currentFilters.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
                        </select>
                        <input type="date" id="filter-due-date" aria-label="Filtrar por data de vencimento" value="${currentFilters.dueDate}">
                        <button id="clear-filters-btn" class="btn-secondary btn-sm">Limpar Filtros</button>
                    </div>
                </div>

                <div class="task-columns">
                    <div class="task-column" data-status="A Fazer" id="column-todo" aria-labelledby="column-todo-title">
                        <h3 id="column-todo-title">A Fazer</h3>
                        <div class="task-list" data-status="A Fazer"></div>
                    </div>
                    <div class="task-column" data-status="Em Progresso" id="column-progress" aria-labelledby="column-progress-title">
                        <h3 id="column-progress-title">Em Progresso</h3>
                        <div class="task-list" data-status="Em Progresso"></div>
                    </div>
                    <div class="task-column" data-status="Concluído" id="column-done" aria-labelledby="column-done-title">
                        <h3 id="column-done-title">Concluído</h3>
                        <div class="task-list" data-status="Concluído"></div>
                    </div>
                </div>
            </section>
        `;

        renderTasksForProject(project);
        setupDragAndDrop();

        document.getElementById('create-task-btn').addEventListener('click', () => {
            console.log("Project View: Botão 'Nova Tarefa' clicado.");
            taskForm.reset();
            document.getElementById('task-modal-title').textContent = 'Criar Nova Tarefa';
            document.getElementById('task-project-id').value = project.id;
            document.getElementById('task-id').value = '';
            document.getElementById('task-status-modal').value = 'A Fazer';
            openModal(taskModal);
        });

        document.getElementById('export-project-btn').addEventListener('click', () => exportProject(project.id));

        document.getElementById('task-search').addEventListener('input', (e) => {
            currentFilters.searchTerm = e.target.value.toLowerCase();
            renderTasksForProject(project);
        });
        document.getElementById('filter-priority').addEventListener('change', (e) => {
            currentFilters.priority = e.target.value;
            renderTasksForProject(project);
        });
        document.getElementById('filter-status').addEventListener('change', (e) => {
            currentFilters.status = e.target.value;
            renderTasksForProject(project);
        });
        document.getElementById('filter-due-date').addEventListener('change', (e) => {
            currentFilters.dueDate = e.target.value;
            renderTasksForProject(project);
        });
        document.getElementById('clear-filters-btn').addEventListener('click', () => {
            currentFilters = { searchTerm: '', priority: 'todos', status: 'todos', dueDate: '' };
            document.getElementById('task-search').value = '';
            document.getElementById('filter-priority').value = 'todos';
            document.getElementById('filter-status').value = 'todos';
            document.getElementById('filter-due-date').value = '';
            renderTasksForProject(project);
        });
        console.log(`renderProjectPage: Renderização completa para projeto ID ${projectId}`);
    }

    function renderTasksForProject(project) {
        console.log(`renderTasksForProject: Renderizando tarefas para o projeto "${project.name}"`);
        document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');

        if (!project.tasks || project.tasks.length === 0) {
            console.log(`renderTasksForProject: Nenhuma tarefa para o projeto "${project.name}"`);
            return;
        }

        let filteredTasks = project.tasks.filter(task => {
            const searchMatch = !currentFilters.searchTerm || task.title.toLowerCase().includes(currentFilters.searchTerm);
            const priorityMatch = currentFilters.priority === 'todos' || task.priority === currentFilters.priority;
            const statusMatch = currentFilters.status === 'todos' || task.status === currentFilters.status;
            const dueDateMatch = !currentFilters.dueDate || (task.dueDate && task.dueDate.startsWith(currentFilters.dueDate));
            return searchMatch && priorityMatch && statusMatch && dueDateMatch;
        });

        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task, project.id);
            const column = document.querySelector(`.task-list[data-status="${task.status}"]`);
            if (column) {
                column.appendChild(taskElement);
            } else {
                console.warn(`renderTasksForProject: Coluna para status "${task.status}" não encontrada. Usando "A Fazer".`);
                const fallbackColumn = document.querySelector(`.task-list[data-status="A Fazer"]`);
                if (fallbackColumn) fallbackColumn.appendChild(taskElement);
            }
        });
    }

    function createTaskElement(task, projectId) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.draggable = true;
        taskCard.dataset.taskId = task.id;
        taskCard.dataset.projectId = projectId;
        taskCard.setAttribute('tabindex', '0');
        taskCard.setAttribute('aria-labelledby', `task-title-${task.id}`);
        taskCard.setAttribute('aria-describedby', `task-desc-${task.id} task-due-${task.id} task-priority-${task.id}`);

        taskCard.innerHTML = `
            <h4 id="task-title-${task.id}">${task.title}</h4>
            <p id="task-desc-${task.id}" style="white-space: pre-wrap;">${task.description || 'Sem descrição.'}</p>
            <small id="task-due-${task.id}">Vencimento: ${task.dueDate ? formatDate(task.dueDate) : 'N/A'}</small>
            <small id="task-priority-${task.id}" class="task-priority-display">
                Prioridade: <span class="task-priority priority-${task.priority.replace(/\s+/g, '')}">${task.priority}</span>
            </small>
            <div class="task-actions">
                <button class="edit-task-btn btn-secondary btn-sm" data-task-id="${task.id}" data-project-id="${projectId}" aria-label="Editar tarefa ${task.title}">Editar</button>
                <button class="delete-task-btn btn-danger btn-sm" data-task-id="${task.id}" data-project-id="${projectId}" aria-label="Excluir tarefa ${task.title}">Excluir</button>
            </div>
        `;
        // Corrigir nome da classe de prioridade para não ter espaços
        const prioritySpan = taskCard.querySelector('.task-priority');
        if (prioritySpan) {
           prioritySpan.classList.remove('priority-Média'); // Remove se tiver espaço
           prioritySpan.classList.add(`priority-${task.priority.replace(/\s+/g, '')}`);
        }


        taskCard.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const editBtn = taskCard.querySelector('.edit-task-btn');
                if (editBtn) editBtn.click();
            }
        });
        
        taskCard.querySelector('.edit-task-btn').addEventListener('click', () => {
            console.log(`Task Element: Botão 'Editar Tarefa' clicado para ID ${task.id}`);
            const project = appData.projects.find(p => p.id === projectId);
            if (!project) { console.error("Edit task: Project not found"); return; }
            const taskToEdit = project.tasks.find(t => t.id === task.id);
            if(taskToEdit) {
                document.getElementById('task-modal-title').textContent = 'Editar Tarefa';
                document.getElementById('task-project-id').value = projectId;
                document.getElementById('task-id').value = taskToEdit.id;
                document.getElementById('task-title').value = taskToEdit.title;
                document.getElementById('task-description').value = taskToEdit.description || '';
                document.getElementById('task-due-date').value = taskToEdit.dueDate || '';
                document.getElementById('task-priority').value = taskToEdit.priority;
                document.getElementById('task-status-modal').value = taskToEdit.status;
                openModal(taskModal);
            }
        });

        taskCard.querySelector('.delete-task-btn').addEventListener('click', () => {
            console.log(`Task Element: Botão 'Excluir Tarefa' clicado para ID ${task.id}`);
            if (confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) {
                deleteTask(projectId, task.id);
            }
        });
        return taskCard;
    }

    // 3. STATS & HISTORY PAGE
    function renderStatsHistoryPage() {
        console.log("renderStatsHistoryPage: Iniciando renderização.");
        const allTasks = appData.projects.reduce((acc, project) => acc.concat(project.tasks), []);
        
        const tasksByStatus = {
            'A Fazer': allTasks.filter(t => t.status === 'A Fazer').length,
            'Em Progresso': allTasks.filter(t => t.status === 'Em Progresso').length,
            'Concluído': allTasks.filter(t => t.status === 'Concluído').length
        };
        const totalTasks = allTasks.length;
        const completedTasks = tasksByStatus['Concluído'] || 0;
        const productivityRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0.0";

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0,0,0,0);

        const completedLast7DaysData = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const dateString = d.toISOString().split('T')[0];
            completedLast7DaysData[dateString] = 0;
        }
        
        appData.history.forEach(log => {
            if (log.action === 'Task status updated' && log.details.newStatus === 'Concluído') {
                const completionDate = new Date(log.date);
                if (completionDate >= sevenDaysAgo) {
                    const dateString = completionDate.toISOString().split('T')[0];
                    if (completedLast7DaysData.hasOwnProperty(dateString)) {
                        completedLast7DaysData[dateString]++;
                    }
                }
            }
        });

        appContent.innerHTML = `
            <section aria-labelledby="stats-title">
                <h2 id="stats-title" class="page-title">Estatísticas e Histórico</h2>
                <div class="stats-grid">
                    <div class="stat-card"><h3 id="stat-total-tasks-label">Total de Tarefas</h3><p class="value">${totalTasks}</p></div>
                    <div class="stat-card"><h3 id="stat-completed-tasks-label">Tarefas Concluídas</h3><p class="value">${completedTasks}</p></div>
                    <div class="stat-card"><h3 id="stat-inprogress-tasks-label">Em Progresso</h3><p class="value">${tasksByStatus['Em Progresso'] || 0}</p></div>
                    <div class="stat-card"><h3 id="stat-todo-tasks-label">A Fazer</h3><p class="value">${tasksByStatus['A Fazer'] || 0}</p></div>
                    <div class="stat-card"><h3 id="stat-productivity-label">Produtividade</h3><p class="value">${productivityRate}%</p></div>
                </div>
                <div class="chart-container">
                    <h3>Tarefas Concluídas (Últimos 7 Dias)</h3>
                    <div class="bar-chart" id="completed-tasks-chart" role="figure" aria-label="Gráfico de tarefas concluídas"></div>
                </div>
                <div class="history-log">
                    <h3>Histórico de Alterações</h3>
                    <ul id="history-list" aria-live="polite"></ul>
                </div>
            </section>
        `;

        const chartElement = document.getElementById('completed-tasks-chart');
        if (chartElement) {
            const chartData = Object.entries(completedLast7DaysData).sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));
            const maxValue = Math.max(1, ...chartData.map(([, value]) => value));
            chartData.forEach(([date, count]) => {
                const bar = document.createElement('div');
                bar.className = 'bar';
                const barHeight = (count / maxValue) * 100;
                bar.style.height = `${barHeight}%`;
                bar.setAttribute('aria-valuenow', count);
                bar.setAttribute('aria-valuetext', `${count} tarefas em ${formatDate(date)}`);
                
                const valueLabel = document.createElement('span');
                valueLabel.className = 'value-label';
                valueLabel.textContent = count;
                if (barHeight < 10 && count > 0) valueLabel.style.top = "-5px";
                 else if (count === 0) valueLabel.style.visibility = "hidden";


                const dateLabel = document.createElement('span');
                dateLabel.className = 'label';
                dateLabel.textContent = formatDate(date).substring(0,5);

                bar.appendChild(valueLabel);
                bar.appendChild(dateLabel);
                chartElement.appendChild(bar);
            });
        }

        const historyList = document.getElementById('history-list');
        if (historyList) {
            if (appData.history.length === 0) {
                historyList.innerHTML = '<li>Nenhuma atividade registrada.</li>';
            } else {
                appData.history.forEach(log => {
                    const li = document.createElement('li');
                    let detailsText = '';
                    if (log.details) {
                        if (log.details.projectName) detailsText += ` Projeto: "${log.details.projectName}"`;
                        if (log.details.taskTitle) detailsText += ` Tarefa: "${log.details.taskTitle}"`;
                        if (log.details.oldStatus && log.details.newStatus) {
                             detailsText += ` de "${log.details.oldStatus}" para "${log.details.newStatus}"`;
                        }
                    }
                    li.innerHTML = `<span class="timestamp">${formatDateTime(log.date)}</span> <strong>${log.action}</strong> ${detailsText} (<em>${log.user}</em>)`;
                    historyList.appendChild(li);
                });
            }
        }
        console.log("renderStatsHistoryPage: Renderização completa.");
    }

    // --- CRUD OPERATIONS ---
    // Projects
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("Project Form: Submetido.");
        const name = document.getElementById('project-name').value.trim();
        const description = document.getElementById('project-description').value.trim();

        if (!name) {
            alert('O nome do projeto é obrigatório.');
            return;
        }
        const newProject = { id: generateId(), name, description, createdAt: new Date().toISOString(), tasks: [] };
        appData.projects.push(newProject);
        addLogEntry('Project created', { projectName: name });
        saveData();
        closeModal(projectModal);
        renderDashboardPage();
    });

    function deleteProject(projectId) {
        console.log(`deleteProject: Excluindo projeto ID ${projectId}`);
        const projectIndex = appData.projects.findIndex(p => p.id === projectId);
        if (projectIndex > -1) {
            const projectName = appData.projects[projectIndex].name;
            appData.projects.splice(projectIndex, 1);
            addLogEntry('Project deleted', { projectName });
            saveData();
            if (window.location.hash === `#/project/${projectId}`) {
                window.location.hash = '#/dashboard';
            } else if (window.location.hash === '#/dashboard') { // Se já estiver no dashboard, apenas re-renderiza
                renderDashboardPage();
            }
            // Se estiver em outra página (stats), não precisa fazer nada além de salvar
        }
    }

    function exportProject(projectId) {
        const project = appData.projects.find(p => p.id === projectId);
        if (project) {
            const filename = `project_${project.name.replace(/\s+/g, '_')}_${project.id}.json`;
            const jsonStr = JSON.stringify(project, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addLogEntry('Project exported', { projectName: project.name });
            saveData(); // Salvar o log
        }
    }

    // Tasks
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("Task Form: Submetido.");
        const projectId = document.getElementById('task-project-id').value;
        const taskId = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const dueDate = document.getElementById('task-due-date').value;
        const priority = document.getElementById('task-priority').value;
        const status = document.getElementById('task-status-modal').value;

        if (!title) { alert('O título da tarefa é obrigatório.'); return; }
        const project = appData.projects.find(p => p.id === projectId);
        if (!project) { alert('Projeto não encontrado!'); return; }

        if (taskId) { // Editing
            const task = project.tasks.find(t => t.id === taskId);
            if (task) {
                const oldStatus = task.status;
                Object.assign(task, { title, description, dueDate, priority, status });
                task.history = task.history || [];
                task.history.push({ date: new Date().toISOString(), action: 'Tarefa atualizada' });
                addLogEntry('Task updated', { projectName: project.name, taskTitle: title });
                if (oldStatus !== status) {
                    addLogEntry('Task status updated', { projectName: project.name, taskTitle: title, oldStatus, newStatus: status });
                }
            }
        } else { // Creating
            const newTask = { id: generateId(), title, description, dueDate, priority, status, createdAt: new Date().toISOString(), history: [{ date: new Date().toISOString(), action: 'Tarefa criada' }] };
            if(!project.tasks) project.tasks = []; // Garantir que tasks array exista
            project.tasks.push(newTask);
            addLogEntry('Task created', { projectName: project.name, taskTitle: title });
        }
        saveData();
        closeModal(taskModal);
        renderProjectPage(projectId);
    });

    function deleteTask(projectId, taskId) {
        console.log(`deleteTask: Excluindo tarefa ID ${taskId} do projeto ID ${projectId}`);
        const project = appData.projects.find(p => p.id === projectId);
        if (project && project.tasks) {
            const taskIndex = project.tasks.findIndex(t => t.id === taskId);
            if (taskIndex > -1) {
                const taskTitle = project.tasks[taskIndex].title;
                project.tasks.splice(taskIndex, 1);
                addLogEntry('Task deleted', { projectName: project.name, taskTitle });
                saveData();
                renderProjectPage(projectId);
            }
        }
    }

    // --- DRAG AND DROP ---
    let draggedTaskElement = null;

    function setupDragAndDrop() {
        console.log("setupDragAndDrop: Configurando drag and drop.");
        const taskCards = document.querySelectorAll('.task-card');
        const taskLists = document.querySelectorAll('.task-list');

        taskCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                draggedTaskElement = e.target; // e.target é o elemento que está sendo arrastado
                e.dataTransfer.setData('text/plain', draggedTaskElement.dataset.taskId);
                setTimeout(() => { // Para que a classe seja aplicada após o início do arraste
                    if(draggedTaskElement) draggedTaskElement.classList.add('dragging');
                }, 0);
                console.log("DragStart:", draggedTaskElement.dataset.taskId);
            });

            card.addEventListener('dragend', () => {
                if (draggedTaskElement) {
                    draggedTaskElement.classList.remove('dragging');
                }
                console.log("DragEnd:", draggedTaskElement ? draggedTaskElement.dataset.taskId : 'null');
                draggedTaskElement = null; // Limpa a referência
            });
        });

        taskLists.forEach(list => {
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                list.classList.add('drag-over-target'); // Feedback visual
            });
            list.addEventListener('dragleave', (e) => {
                list.classList.remove('drag-over-target');
            });
            list.addEventListener('drop', (e) => {
                e.preventDefault();
                list.classList.remove('drag-over-target');
                if (!draggedTaskElement) {
                    console.warn("Drop: draggedTaskElement é nulo.");
                    return;
                }

                const targetColumnElement = e.target.closest('.task-column'); // Garante que pegamos a coluna
                if (!targetColumnElement) {
                     console.warn("Drop: targetColumnElement não encontrado.");
                     return;
                }
                const newStatus = targetColumnElement.dataset.status;
                const taskId = draggedTaskElement.dataset.taskId;
                const projectId = draggedTaskElement.dataset.projectId;

                console.log(`Drop: Task ID ${taskId} (Projeto ${projectId}) para Status ${newStatus}`);

                const project = appData.projects.find(p => p.id === projectId);
                if (project && project.tasks) {
                    const task = project.tasks.find(t => t.id === taskId);
                    if (task && task.status !== newStatus) {
                        const oldStatus = task.status;
                        task.status = newStatus;
                        task.history = task.history || [];
                        task.history.push({ date: new Date().toISOString(), action: `Movida para ${newStatus}` });
                        addLogEntry('Task status updated', { projectName: project.name, taskTitle: task.title, oldStatus, newStatus });
                        saveData();
                        renderProjectPage(projectId); // Re-renderiza a página do projeto
                    } else if (task && task.status === newStatus) {
                        // Apenas move visualmente se for na mesma coluna (para ordenação visual, se implementado)
                        // No nosso caso, como não temos ordenação persistente na coluna, não faz nada se o status for o mesmo.
                        // A re-renderização do renderProjectPage já cuidará de colocar no lugar certo.
                        console.log("Drop: Tarefa movida para a mesma coluna. Status não alterado.");
                    }
                } else {
                    console.error("Drop: Projeto ou tarefas do projeto não encontrados.");
                }
            });
        });
    }
    // Adicione esta classe ao seu CSS para feedback visual no drag-over:
    // .task-list.drag-over-target { background-color: rgba(0,0,0,0.1); }


    // --- OFFLINE DETECTION ---
    function updateOnlineStatus() {
        if (navigator.onLine) {
            offlineStatusElement.style.display = 'none';
        } else {
            offlineStatusElement.style.display = 'block';
        }
        console.log("updateOnlineStatus: Online =", navigator.onLine);
    }

    // --- INITIALIZATION ---
    function initApp() {
        console.log("initApp: Iniciando aplicação...");
        loadData();
        applyStoredTheme();

        if (themeToggleButton) {
             themeToggleButton.addEventListener('click', toggleTheme);
             console.log("initApp: Event listener para themeToggleButton adicionado.");
        } else {
            console.error("initApp: themeToggleButton não encontrado, listener não adicionado.");
        }

        window.addEventListener('hashchange', handleRouteChange);
        console.log("initApp: Event listener para hashchange adicionado.");
        
        // Modal listeners
        modalBackdrop.addEventListener('click', closeAllModals);
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) closeModal(modal);
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });
        console.log("initApp: Event listeners para modals adicionados.");


        // Offline detection listeners
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();

        // Login form listener
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Login Form: Submetido.");
            const username = document.getElementById('username').value.trim();
            if (username) {
                appData.user = username;
                addLogEntry('User logged in', { username });
                saveData(); // Salva o usuário e o log
                closeModal(loginModal);
                console.log("Login bem-sucedido. Usuário:", username);
                handleRouteChange(); // Chama o roteamento após o login
            } else {
                alert('Por favor, insira um nome de usuário.');
            }
        });
        console.log("initApp: Event listener para loginForm adicionado.");

        showLogin(); // Verifica se precisa mostrar login ou carregar a rota inicial
        console.log("initApp: Inicialização completa.");
    }

    // --- START THE APP ---
    initApp();

}); // Fim do DOMContentLoaded