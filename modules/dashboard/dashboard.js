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
