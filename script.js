// Carrega tarefas do localStorage ou usa default
let tasks = JSON.parse(localStorage.getItem('checklist_diario_tasks')) || [
  "Ler 15min",
  "Sair com o cachorro",
  "treino Panturrilha"
];

const STORAGE_KEY = 'checklist_diario';
const streakKey = 'checklist_streak';
const lastDayKey = 'checklist_last_day';
const lastStreakKey = 'checklist_last_streak';

const tasksList = document.getElementById('tasksList');
const streakEl = document.getElementById('streak');

// Mensagem de parabéns
const messageEl = document.createElement('div');
messageEl.id = 'message';
document.querySelector('.container').appendChild(messageEl);

// Estado e streak
let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
let streak = JSON.parse(localStorage.getItem(streakKey) || '0');

// Flag para bloquear alterações
let locked = Object.values(state).every(v => v === true);

// Checa se passou da meia-noite
const today = new Date().toISOString().slice(0,10);
const lastDay = localStorage.getItem(lastDayKey);

if(lastDay !== today){
  state = {};
  locked = false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(lastDayKey, today);
}

updateStreakDisplay();
renderTasks();

// Botão Reset
const resetBtn = document.createElement('button');
resetBtn.textContent = 'Resetar Progresso';
resetBtn.addEventListener('click', () => {
  if(confirm('Deseja realmente resetar o checklist e o streak?')){
    state = {};
    streak = 0;
    locked = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(streakKey, JSON.stringify(streak));
    localStorage.setItem(lastDayKey, today);
    localStorage.setItem(lastStreakKey, '');
    updateStreakDisplay();
    renderTasks();
    messageEl.textContent = '';
  }
});
document.querySelector('.container').appendChild(resetBtn);

// Botão Editar tarefas
const editBtn = document.createElement('button');
editBtn.textContent = 'Editar tarefas';
editBtn.className = 'edit-btn';
editBtn.addEventListener('click', openEditMode);
document.querySelector('.container').appendChild(editBtn);

function updateStreakDisplay() {
  streakEl.textContent = `Streak: ${streak} dias`; 
}

function renderTasks() {
  tasksList.innerHTML = '';
  tasks.forEach((task, i) => {
    const li = document.createElement('li');
    li.textContent = task;
    if(state[i]) li.classList.add('checked');

    li.addEventListener('click', () => {
      if(locked) return; // bloqueia alterações
      state[i] = !state[i];
      li.classList.toggle('checked');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      checkCompletion();
    });

    tasksList.appendChild(li);
  });
}

// Modo edição
function openEditMode() {
  tasksList.innerHTML = '';
  tasks.forEach(task => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = task;
    input.style.marginBottom = '6px';
    input.style.padding = '8px';
    input.style.width = '100%';
    input.style.borderRadius = '6px';
    input.style.border = '1px solid #ccc';
    tasksList.appendChild(input);
  });

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Adicionar tarefa';
  addBtn.className = 'add-task-btn';
  addBtn.addEventListener('click', () => {
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.value = '';
    newInput.style.marginBottom = '6px';
    newInput.style.padding = '8px';
    newInput.style.width = '100%';
    newInput.style.borderRadius = '6px';
    newInput.style.border = '1px solid #ccc';
    tasksList.insertBefore(newInput, saveBtn);
  });

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Salvar tarefas';
  saveBtn.className = 'save-task-btn';
  saveBtn.addEventListener('click', saveTasks);

  tasksList.appendChild(addBtn);
  tasksList.appendChild(saveBtn);
}

// Salva tarefas mantendo estado de ticks existentes
function saveTasks() {
  const inputs = tasksList.querySelectorAll('input');
  const newTasks = [];
  const newState = {};

  inputs.forEach((input, i) => {
    const taskText = input.value.trim();
    if(taskText !== ''){
      newTasks.push(taskText);
      const oldIndex = tasks.indexOf(taskText);
      newState[i] = oldIndex !== -1 && state[oldIndex] ? true : false;
    }
  });

  tasks = newTasks;
  state = newState;

  localStorage.setItem('checklist_diario_tasks', JSON.stringify(tasks));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  // Bloqueia se todas já estão completadas
  locked = Object.values(state).every(v => v === true);

  renderTasks();
  messageEl.textContent = '';
}

// Check completion e fogos
function checkCompletion() {
  const allDone = tasks.every((_, i) => state[i]);
  const today = new Date().toISOString().slice(0,10);
  const lastStreakDay = localStorage.getItem(lastStreakKey) || '';

  if(allDone && !locked && today !== lastStreakDay){
    locked = true;
    streak++;
    localStorage.setItem(streakKey, JSON.stringify(streak));
    localStorage.setItem(lastStreakKey, today);
    updateStreakDisplay();
    messageEl.textContent = `Parabéns! Todas as tarefas concluídas! 🔥`;
    launchFireworks();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

// Fireworks
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.display = 'none';

function launchFireworks(){
  canvas.style.display = 'block';
  const colors = ['#f87171','#fbbf24','#4ade80','#60a5fa','#a78bfa'];
  const particles = [];
  for(let i=0;i<100;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height/2,
      vx: (Math.random()-0.5)*6,
      vy: (Math.random()-0.5)*6,
      color: colors[Math.floor(Math.random()*colors.length)],
      alpha:1
    });
  }

  const interval = setInterval(()=>{
    ctx.fillStyle='rgba(255,255,255,0.1)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      ctx.fillStyle=p.color;
      ctx.globalAlpha=p.alpha;
      ctx.beginPath();
      ctx.arc(p.x,p.y,3,0,Math.PI*2);
      ctx.fill();
      p.x+=p.vx; p.y+=p.vy; p.alpha-=0.02;
    });
    ctx.globalAlpha=1;

    if(particles.every(p => p.alpha <= 0)){
      clearInterval(interval);
      canvas.style.display = 'none';
    }
  },30);
}
