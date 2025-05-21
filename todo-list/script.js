document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const emptyMessage = document.getElementById('emptyMessage');

    let tasks = []; // Array para armazenar as tarefas

    // Função para carregar tarefas do localStorage
    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
        renderTasks();
    }

    // Função para salvar tarefas no localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Função para renderizar as tarefas na tela
    function renderTasks() {
        taskList.innerHTML = ''; // Limpa a lista atual

        if (tasks.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            tasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.className = task.completed ? 'completed' : '';
                li.dataset.index = index; // Usar o índice como identificador simples

                const taskTextSpan = document.createElement('span');
                taskTextSpan.className = 'task-text';
                taskTextSpan.textContent = task.text;
                taskTextSpan.addEventListener('click', () => toggleTaskComplete(index));

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'task-actions';

                const completeBtn = document.createElement('button');
                completeBtn.className = 'complete-btn';
                completeBtn.innerHTML = task.completed ? '✓' : '◯'; // Check ou círculo
                completeBtn.title = task.completed ? "Marcar como não concluída" : "Marcar como concluída";
                completeBtn.addEventListener('click', () => toggleTaskComplete(index));

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '✕'; // X para deletar
                deleteBtn.title = "Excluir tarefa";
                deleteBtn.addEventListener('click', () => deleteTask(index));

                actionsDiv.appendChild(completeBtn);
                actionsDiv.appendChild(deleteBtn);

                li.appendChild(taskTextSpan);
                li.appendChild(actionsDiv);
                taskList.appendChild(li);
            });
        }
    }

    // Função para adicionar uma nova tarefa
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            alert('Por favor, digite uma tarefa!');
            return;
        }

        tasks.push({ text: taskText, completed: false });
        taskInput.value = ''; // Limpa o input
        saveTasks();
        renderTasks();
    }

    // Função para marcar/desmarcar tarefa como concluída
    function toggleTaskComplete(index) {
        if (tasks[index]) {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            renderTasks();
        }
    }

    // Função para excluir uma tarefa
    function deleteTask(index) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            tasks.splice(index, 1); // Remove a tarefa do array pelo índice
            saveTasks();
            renderTasks();
        }
    }

    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Carregar tarefas ao iniciar
    loadTasks();
});