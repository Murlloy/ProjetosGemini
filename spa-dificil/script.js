document.addEventListener('DOMContentLoaded', () => {
    const habitInput = document.getElementById('habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitsList = document.getElementById('habits-list');
    // const currentDateEl = document.getElementById('current-date'); // REMOVIDO ou comentado
    const viewedDateDisplayEl = document.getElementById('viewed-date-display'); // NOVO
    const themeToggleBtn = document.getElementById('theme-toggle');
    const chartEl = document.querySelector('.chart');
    const prevDayBtn = document.getElementById('prev-day-btn'); // NOVO
    const nextDayBtn = document.getElementById('next-day-btn'); // NOVO

    let habits = [];
    let dailyRecords = [];
    let viewedDate; //  Será inicializado em loadData ou ao definir pela primeira vez

    // --- UTILITY FUNCTIONS ---
    function getTodayDateString() {
        const today = new Date();
        return formatDate(today);
    }

    function formatDate(date) { // Nova função para formatar qualquer objeto Date
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function parseDateString(dateString) { // Para converter string YYYY-MM-DD para objeto Date
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day); // Mês é 0-indexado em Date
    }

    function getDayOfWeek(dateString) {
        const date = parseDateString(dateString);
        return date.getDay();
    }
    
    function getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    // --- DATE NAVIGATION ---
    function changeViewedDate(offset) {
        const currentDateObj = parseDateString(viewedDate);
        currentDateObj.setDate(currentDateObj.getDate() + offset);
        viewedDate = formatDate(currentDateObj);
        
        updateNavigationButtons();
        renderAll();
    }

    function updateNavigationButtons() {
        const todayStr = getTodayDateString();
        nextDayBtn.disabled = (viewedDate === todayStr);
        // prevDayBtn não tem limite por enquanto, pode ser adicionado se necessário
    }


    // --- LOCALSTORAGE FUNCTIONS ---
    function loadData() {
        const storedHabits = localStorage.getItem('habits');
        const storedRecords = localStorage.getItem('dailyRecords');
        const storedTheme = localStorage.getItem('theme');
        const storedViewedDate = localStorage.getItem('viewedDate'); // Opcional: salvar último dia visualizado

        if (storedHabits) habits = JSON.parse(storedHabits);
        if (storedRecords) dailyRecords = JSON.parse(storedRecords);
        
        // Define o viewedDate: usa o salvo, ou o dia de hoje como padrão
        viewedDate = storedViewedDate || getTodayDateString(); 
        // Garantir que viewedDate não seja um dia futuro, se for o caso, resetar para hoje
        if (parseDateString(viewedDate) > new Date(getTodayDateString() + 'T23:59:59')) {
            viewedDate = getTodayDateString();
        }


        if (storedTheme) {
            document.body.setAttribute('data-theme', storedTheme);
            themeToggleBtn.textContent = storedTheme === 'dark' ? '☀️' : '🌙';
        } else {
            document.body.setAttribute('data-theme', 'light');
            themeToggleBtn.textContent = '🌙';
        }
        updateNavigationButtons();
        renderAll();
    }

    function saveData() {
        localStorage.setItem('habits', JSON.stringify(habits));
        localStorage.setItem('dailyRecords', JSON.stringify(dailyRecords));
        localStorage.setItem('viewedDate', viewedDate); // Opcional: salvar último dia visualizado
    }

    // --- THEME TOGGLE --- (sem alterações)
    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        themeToggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', newTheme);
    }

    // --- HABIT FUNCTIONS ---
    function addHabit() {
        const habitName = habitInput.value.trim();
        if (habitName === '') {
            alert('Por favor, insira um nome para o hábito.');
            return;
        }
        const newHabit = {
            id: Date.now(),
            name: habitName,
        };
        habits.push(newHabit);
        habitInput.value = '';
        saveData();
        renderHabitsList(); 
        animateElement(addHabitBtn, 'pulse');
    }
    
    function animateElement(element, animationClass) {
        element.classList.add(animationClass);
        setTimeout(() => element.classList.remove(animationClass), 300);
    }
    // Adicione no CSS se não existir:
    // @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
    // button.pulse { animation: pulse 0.3s ease-in-out; }


    function deleteHabit(habitId) {
        const habitItem = document.querySelector(`li[data-id="${habitId}"]`);
        if (habitItem) {
            habitItem.classList.add('removing');
            setTimeout(() => {
                habits = habits.filter(h => h.id !== habitId);
                dailyRecords = dailyRecords.filter(r => r.habitId !== habitId);
                saveData();
                renderAll();
            }, 300);
        }
    }

    function toggleHabitDone(habitId, dateForRecord, checkbox) { // 'dateForRecord' é o 'viewedDate'
        // Não permitir marcar/desmarcar hábitos para dias futuros (além do dia real de hoje)
        const todayReal = getTodayDateString();
        if (parseDateString(dateForRecord) > parseDateString(todayReal)) {
            alert("Não é possível marcar/desmarcar hábitos para datas futuras.");
            checkbox.checked = !checkbox.checked; // Reverte a ação do checkbox
            return;
        }

        const recordIndex = dailyRecords.findIndex(r => r.habitId === habitId && r.date === dateForRecord);
        if (recordIndex > -1) {
            dailyRecords.splice(recordIndex, 1);
            // animateCheckbox(checkbox, false); // Animação CSS já cuida
        } else {
            dailyRecords.push({ habitId, date: dateForRecord });
            // animateCheckbox(checkbox, true); // Animação CSS já cuida
        }
        saveData();
        renderHabitsList(); // Atualiza stats e checkbox
        renderChart();    // Atualiza gráfico para a semana do viewedDate
    }

    // function animateCheckbox(checkbox, isChecking) { /* ... */ } // Mantida se usada

    // --- RENDERING FUNCTIONS ---
    function renderHabitsList() {
        habitsList.innerHTML = '';
        // Atualiza o display da data visualizada
        const dateObj = parseDateString(viewedDate);
        const todayRealStr = getTodayDateString();
        let dateLabel = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (viewedDate === todayRealStr) {
            dateLabel = `Hoje (${dateLabel})`;
        } else if (formatDate(new Date(new Date(todayRealStr).setDate(parseDateString(todayRealStr).getDate() - 1))) === viewedDate) {
            dateLabel = `Ontem (${dateLabel})`;
        }
        viewedDateDisplayEl.textContent = dateLabel;


        if (habits.length === 0) {
            habitsList.innerHTML = "<p>Nenhum hábito cadastrado ainda. Que tal adicionar um?</p>";
            return;
        }

        const isFutureDate = parseDateString(viewedDate) > parseDateString(getTodayDateString());

        habits.forEach(habit => {
            const li = document.createElement('li');
            li.setAttribute('data-id', habit.id);

            const isDoneOnViewedDate = dailyRecords.some(r => r.habitId === habit.id && r.date === viewedDate);

            const daysDoneCount = dailyRecords.filter(r => r.habitId === habit.id).length;
            
            const currentViewedMonth = dateObj.getMonth() + 1;
            const currentViewedYear = dateObj.getFullYear();
            const daysInCurrentViewedMonth = getDaysInMonth(currentViewedYear, currentViewedMonth);

            const doneThisMonthCount = dailyRecords.filter(r => 
                r.habitId === habit.id &&
                new Date(r.date + 'T00:00:00').getMonth() + 1 === currentViewedMonth && // Use T00:00:00 para evitar problemas de fuso com r.date
                new Date(r.date + 'T00:00:00').getFullYear() === currentViewedYear
            ).length;
            const monthlyCompletion = daysInCurrentViewedMonth > 0 ? ((doneThisMonthCount / daysInCurrentViewedMonth) * 100).toFixed(0) : 0;

            li.innerHTML = `
                <div class="habit-info">
                    <input type="checkbox" class="habit-checkbox" 
                           ${isDoneOnViewedDate ? 'checked' : ''} 
                           ${isFutureDate ? 'disabled' : ''}> 
                    <span class="habit-name">${habit.name}</span>
                    <div class="habit-stats">
                        Total Feito: ${daysDoneCount} | ${monthlyCompletion}% em ${dateObj.toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})}
                    </div>
                </div>
                <button class="delete-habit-btn">Excluir</button>
            `;

            const checkbox = li.querySelector('.habit-checkbox');
            checkbox.addEventListener('change', (e) => {
                toggleHabitDone(habit.id, viewedDate, e.target);
                li.style.transform = 'scale(1.02)';
                setTimeout(() => li.style.transform = 'scale(1)', 150);
            });
            li.querySelector('.delete-habit-btn').addEventListener('click', () => {
                deleteHabit(habit.id);
            });
            
            habitsList.appendChild(li);
        });
    }

    function renderChart() {
        chartEl.innerHTML = '';
        const weeklyData = Array(7).fill(0); // 0:Dom, 1:Seg, ..., 6:Sáb

        const viewedDateObj = parseDateString(viewedDate);
        const currentDayOfWeekInViewedDate = viewedDateObj.getDay();
        
        const startDateOfViewedWeek = new Date(viewedDateObj);
        startDateOfViewedWeek.setDate(viewedDateObj.getDate() - currentDayOfWeekInViewedDate); // Vai para o Domingo da semana do viewedDate

        for (let i = 0; i < 7; i++) {
            const dayToConsider = new Date(startDateOfViewedWeek);
            dayToConsider.setDate(startDateOfViewedWeek.getDate() + i);
            const dateStr = formatDate(dayToConsider);
            
            const habitsDoneOnThisDay = dailyRecords.filter(r => r.date === dateStr).length;
            weeklyData[i] = habitsDoneOnThisDay;
        }
        
        const maxHabitsDone = Math.max(...weeklyData, 1);

        weeklyData.forEach((count, index) => {
            const barWrapper = document.createElement('div');
            barWrapper.classList.add('bar-wrapper');

            const bar = document.createElement('div');
            bar.classList.add('bar');
            const barHeight = (count / maxHabitsDone) * 100;
            
            const barValue = document.createElement('span');
            barValue.classList.add('bar-value');
            barValue.textContent = count;

            bar.appendChild(barValue);
            barWrapper.appendChild(bar);
            chartEl.appendChild(barWrapper);

            setTimeout(() => {
                bar.style.height = `${barHeight}%`;
                bar.classList.add('loaded');
            }, 100 + index * 50);
        });
    }
    
    function renderAll() {
        renderHabitsList();
        renderChart();
        // Assegurar que os botões de navegação estejam no estado correto
        updateNavigationButtons(); 
    }

    // --- EVENT LISTENERS ---
    addHabitBtn.addEventListener('click', addHabit);
    habitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addHabit();
    });
    themeToggleBtn.addEventListener('click', toggleTheme);
    prevDayBtn.addEventListener('click', () => changeViewedDate(-1)); // NOVO
    nextDayBtn.addEventListener('click', () => changeViewedDate(1));  // NOVO

    // --- INITIAL LOAD ---
    loadData(); // Isso agora também define viewedDate e chama renderAll
});

// Dentro do seu script.js
function renderChart() {
    chartEl.innerHTML = ''; // Limpa barras anteriores
    const weeklyData = Array(7).fill(0); // 0:Dom, 1:Seg, ..., 6:Sáb

    const viewedDateObj = parseDateString(viewedDate); // 'viewedDate' é sua variável YYYY-MM-DD
    const dayOfWeekOfViewedDate = viewedDateObj.getDay(); // 0 para Domingo, ..., 6 para Sábado

    // Calcula o Domingo da semana do viewedDate
    const sundayOfViewedWeek = new Date(viewedDateObj);
    sundayOfViewedWeek.setDate(viewedDateObj.getDate() - dayOfWeekOfViewedDate);
    sundayOfViewedWeek.setHours(0, 0, 0, 0); // Normaliza para o início do dia

    // Coleta dados para os 7 dias da semana
    for (let i = 0; i < 7; i++) {
        const currentDayInLoop = new Date(sundayOfViewedWeek);
        currentDayInLoop.setDate(sundayOfViewedWeek.getDate() + i);
        const dateStr = formatDate(currentDayInLoop); // Converte para YYYY-MM-DD

        // Conta quantos hábitos foram feitos ('dailyRecords' é seu array de {habitId, date})
        const habitsDoneOnThisDay = dailyRecords.filter(record => record.date === dateStr).length;
        weeklyData[i] = habitsDoneOnThisDay;
    }
    
    // Determina o valor máximo para escalar as barras (mínimo 1 para evitar divisão por zero)
    const maxHabitsDoneThisWeek = Math.max(...weeklyData, 1);

    // Cria e anima cada barra
    weeklyData.forEach((count, index) => {
        const barWrapper = document.createElement('div');
        barWrapper.classList.add('bar-wrapper');

        const bar = document.createElement('div');
        bar.classList.add('bar');
        
        const barHeightPercent = maxHabitsDoneThisWeek > 0 ? (count / maxHabitsDoneThisWeek) * 100 : 0;
        
        const barValue = document.createElement('span');
        barValue.classList.add('bar-value');
        barValue.textContent = count;

        bar.appendChild(barValue);
        barWrapper.appendChild(bar);
        chartEl.appendChild(barWrapper);

        // Anima o crescimento da barra com um pequeno delay escalonado
        // Usar requestAnimationFrame pode ajudar a iniciar a animação de forma mais suave
        requestAnimationFrame(() => {
            setTimeout(() => {
                bar.style.height = `${barHeightPercent}%`;
                bar.classList.add('loaded'); // Adiciona classe para mostrar o valor após a barra crescer
            }, 150 + index * 80); // Delay inicial + delay por barra
        });
    });
}