const newTaskCard = document.getElementById("new-task-card");
const addTaskBtn = document.getElementById("add-task-btn"); 
const cancelTaskBtn = document.getElementById("cancel-task-btn");
const taskForm = document.getElementById("task-form");
const todosList = document.getElementById("todos-list"); 
const filters = document.querySelectorAll(".filters .filter");
const createButton = document.getElementById("create-btn");

const emptyState = document.createElement("div");
emptyState.classList.add("empty-state", "hidden");
emptyState.innerHTML = `
  <img src="/assets/images/circle-empty.png" alt="">
  <p style="font-size: 16px;">No tasks yet</p>
  <p style="font-size: 14px;">Click "Add Task" to create your first task</p>
`;

let todos = [];
let currentFilter = "active"; 

function setActiveView(name) {
  const allViews = document.querySelectorAll(".task-view-content");
  allViews.forEach(view => {
    view.classList.toggle("active-view", view.getAttribute("data-view") === name);
  });

  document.getElementById("seg-tasks").checked = name === "tasks";
  document.getElementById("seg-ai").checked = name === "ai-summary";
}

document.querySelectorAll('.segmented-control-tasks label').forEach(label => {
  label.addEventListener('click', () => setActiveView(label.dataset.target));
});

document.querySelectorAll('.segmented-control-tasks input').forEach(radio => {
  radio.addEventListener('change', () => {
    const label = document.querySelector(`label[for="${radio.id}"]`);
    setActiveView(label.dataset.target);
  });
});

//AI SUMMARY//
const historyBar = document.querySelector('.summary_history');
if (historyBar) {
  const buttons = historyBar.querySelectorAll('.summary_btn_ai');
  const slider = historyBar.querySelector('.summary_slider');

  function activate(target) {
    buttons.forEach(btn => {
      const isActive = btn.dataset.target === target;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      if (isActive && slider) {
        slider.style.width = btn.offsetWidth + "px";
        slider.style.transform = `translateX(${btn.offsetLeft}px)`;
      }
    });

    document.querySelectorAll('.summary_panel').forEach(p => {
      p.style.display = p.dataset.panel === target ? '' : 'none';
    });
  }

  buttons.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.target)));
  const initial = historyBar.querySelector('.summary_btn_ai.active') || buttons[0];
  if (initial) activate(initial.dataset.target);
}

//TASK FORM//
addTaskBtn?.addEventListener("click", () => newTaskCard.style.display = "flex");
cancelTaskBtn?.addEventListener("click", () => {
  newTaskCard.style.display = "none";
  taskForm.reset();
});

createButton?.addEventListener("click", (e) =>{
    console.log("form submitted");
  })

taskForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = taskForm.title.value.trim();
  const description = taskForm.description.value.trim();
  const priority = taskForm.priority.value || "medium";
  const dueDate = taskForm.dueDate.value;

  if (!title) return alert("Please fill in the title field");

  const task = {
    id: Date.now(),
    title,
    description,
    priority,
    dueDate,
    completed: false,
  };

  todos.push(task);
  saveTodos();
  renderTodos();

  taskForm.reset();
  newTaskCard.style.display = "none";

  
});

//TODO ELEMENTS//
function createTodoElement(todo) {
  const todoItem = document.createElement("li");
  todoItem.className = "todo-item";
  if (todo.completed) todoItem.classList.add("completed");

  // LEFT
  const left = document.createElement("div");
  left.className = "todo-left";

  const checkboxContainer = document.createElement("label");
  checkboxContainer.className = "checkbox-container";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = !!todo.completed;
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  const checkmark = document.createElement("span");
  checkmark.className = "checkmark";

  checkboxContainer.appendChild(checkbox);
  checkboxContainer.appendChild(checkmark);

  const textWrap = document.createElement("div");
  textWrap.className = "text-wrap";

  const title = document.createElement("span");
  title.className = "todo-item-title";
  title.textContent = todo.title || "(untitled)";

  const due = document.createElement("span");
  due.className = "todo-due-date";
  due.textContent = todo.dueDate ? `Due: ${todo.dueDate}` : "";

  textWrap.appendChild(title);
  if (due.textContent) textWrap.appendChild(due);

  left.appendChild(checkboxContainer);
  left.appendChild(textWrap);

  // RIGHT
  const right = document.createElement("div");
  right.className = "todo-right";

  const priorityBadgeTasks = document.createElement("span");
  priorityBadgeTasks.className = `priority-badge-tasks priority-${(todo.priority || "medium")}`;
  priorityBadgeTasks.textContent = todo.priority || "medium";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

  right.appendChild(priorityBadgeTasks);
  right.appendChild(deleteBtn);

  todoItem.appendChild(left);
  todoItem.appendChild(right);

  return todoItem;
}

//RENDER TODOS//
function renderTodos() {
  todosList.innerHTML = "";

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  // EMPTY STATE//
 
  if(!todoList.classList.add("hidden"));
  if (activeTodos.length === 0) {
    emptyState.classList.remove("hidden");
    todosList.appendChild(emptyState);
    return;
    
  } else {
    emptyState.classList.add("hidden");
  }

  activeTodos.forEach(t => todosList.appendChild(createTodoElement(t)));

  // COMPLETED TODOS//
  if (completedTodos.length > 0) {
    const divider = document.createElement("div");
    divider.className = "completed-divider";
    divider.textContent = "Completed";
    todosList.appendChild(divider);

    completedTodos.forEach(t => todosList.appendChild(createTodoElement(t)));
  }

  if (typeof updateItemsCount === "function") updateItemsCount();
}


//TODO OPERATIONS//
function toggleTodo(id) {
  todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  renderTodos();
}

function clearCompleted() {
  todos = todos.filter(todo => !todo.completed);
  saveTodos();
  renderTodos();
}

//LOCAL STORAGE//
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
  const storedTodos = localStorage.getItem("todos");
  todos = storedTodos ? JSON.parse(storedTodos) : [];
  renderTodos();
}

//UPDATE COUNTERS//
function updateItemsCount() {
  document.querySelector(".active_tasks .filter").textContent =
    todos.filter(todo => !todo.completed).length;

  document.querySelector(".completed_tasks .filter").textContent =
    todos.filter(todo => todo.completed).length;
}


window.addEventListener("DOMContentLoaded", () => {
  loadTodos();          
  setActiveView("tasks"); 
});
