window.initDashboard = function () {
  const sidebar = document.querySelector(".left-side");
  if (!sidebar) {
    console.warn("Sidebar element not found.");
    return;
  }

  document.addEventListener("click", (e) => {
    const toggleButton = e.target.closest("#sidebar-menu-toggle");
    if (toggleButton) sidebar.classList.toggle("sidebar-collapsed");
  });

  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("tm_logged_in");
      showView("login");
    });
  }

  const loggedIn = JSON.parse(localStorage.getItem("tm_logged_in") || "{}");
  const userName = (loggedIn && loggedIn.name && loggedIn.name.trim()) ? loggedIn.name.trim() : "User";
  updateWelcomeMessage(userName);

  const activeCountEl = document.querySelector(".completed-tasks-view");   
  const completedCountEl = document.getElementById("completed-tasks");    
  const completionRateEl = document.querySelector(".completed-rate-view"); 
  const recentContainer = document.querySelector(".recent-tasks-summary"); 
   const completedLabelEl = document.getElementById("completed-tasks");
   const emptyState = document.createElement("div");
   const todosList = document.getElementById("todos-list"); 

  function hasElements() {
    return !!(activeCountEl && completedCountEl && completionRateEl && recentContainer);
  }

  function readTodosFromStorage() {
    try {
      const raw = localStorage.getItem("todos");
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (err) {
      console.warn("dashboard: failed to parse todos from localStorage", err);
      return [];
    }
  }

  function computeMetrics(todos) {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = todos.filter(t => !t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, active, percent };
  }

  function renderNumbers(todos) {
    if (!hasElements()) return;
    const { completed, active, percent } = computeMetrics(todos);
    activeCountEl.textContent = String(active);
    completedCountEl.textContent = String(completed);
    completionRateEl.textContent = `${percent}%`;

    if (completedLabelEl) {
        completedLabelEl.textContent = `${completed} completed`;
    }

  }

  function renderRecentTasks(todos) {
    if (!recentContainer) return;
    recentContainer.innerHTML = "";

    if (!todos || todos.length === 0) {
      const empty = document.createElement("div");
      empty.className = "recent-empty";
      empty.textContent = "No tasks yet";
      recentContainer.appendChild(empty);
      return;
    }

    // Sort newest first using numeric id (tasks.js uses Date.now() for id)
    const sorted = [...todos].sort((a, b) => {
      const ida = Number(a.id) || 0;
      const idb = Number(b.id) || 0;
      return idb - ida;
    });

    const ul = document.createElement("ul");
    ul.className = "dashboard-recent-list";

    sorted.forEach(t => {
      const li = document.createElement("li");
      li.className = "dashboard-recent-item";


      const title = document.createElement("span");
      title.className = "dashboard-recent-title";
      title.textContent = t.title || "(untitled)";
    /* Checkmark and CheckBox */
    const checkboxContainer = document.createElement("label");
    checkboxContainer.classList.add("checkbox-container");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("todo-checkbox");
    checkbox.checked = t.completed;
    checkbox.addEventListener("change", () => toggleTodo(t.id));

    const checkmark = document.createElement("span");
    checkmark.classList.add("checkmark");

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkmark);
    
      const meta = document.createElement("span");
      meta.className = "dashboard-recent-meta";
      meta.textContent = t.dueDate ? `Due: ${t.dueDate}` : "";
      
      const priorityBadge = document.createElement("span");
      priorityBadge.classList.add("priority-badge");
      priorityBadge.classList.add(`priority-${t.priority}`);
      priorityBadge.textContent = t.priority;

      const leftWrap = document.createElement("div");
      leftWrap.className = "dashboard-recent-left";
      leftWrap.appendChild(meta);
      

      const rightWrap = document.createElement("div");
      rightWrap.className="dashboard-recent-right";
      rightWrap.appendChild(priorityBadge);

      const textWrap = document.createElement("div");
      textWrap.className = "dashboard-recent-text";
      textWrap.appendChild(title);
      textWrap.appendChild(meta);

      leftWrap.appendChild(checkboxContainer);
      leftWrap.appendChild(textWrap);
      li.appendChild(leftWrap);
      li.appendChild(rightWrap);
    
      
      ul.appendChild(li);
    });

    recentContainer.appendChild(ul);
  }

  
emptyState.classList.add("empty-state", "hidden");

emptyState.innerHTML = `
  <img src="/assets/images/circle-empty.png" alt="">
  <p style="font-size: 16px;">No tasks yet</p>
  <p style="font-size: 14px;">Click "Add Task" to create your first task</p>
`;

todosList.parentElement.appendChild(emptyState);

function checkEmptyState() {
  const activeCount = todos.filter(t => !t.completed).length;

  if (activeCount === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }
}
   

  function refreshDashboard() {
    const todos = readTodosFromStorage();
    renderNumbers(todos);
    renderRecentTasks(todos);
  }


  function startSyncing() {
    window.addEventListener("todosUpdated", refreshDashboard);

    let lastSnapshot = localStorage.getItem("todos");
    setInterval(() => {
      const current = localStorage.getItem("todos");
      if (current !== lastSnapshot) {
        lastSnapshot = current;
        refreshDashboard();
      }
    }, 1200);
  }

  refreshDashboard();
  startSyncing();
};

function updateWelcomeMessage(userName) {
  const welcomeEl = document.getElementById("welcomeMessage");
  if (!welcomeEl) return;

  const now = new Date();
  const hours = now.getHours();
  let timeOfDay = "Hello";

  if (hours >= 5 && hours < 12) timeOfDay = "Good morning";
  else if (hours >= 12 && hours < 18) timeOfDay = "Good afternoon";
  else timeOfDay = "Good evening";

  welcomeEl.textContent = `${timeOfDay}, ${userName}!`;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.initDashboard === "function") window.initDashboard();
  });
} else {
  if (typeof window.initDashboard === "function") window.initDashboard();
}
