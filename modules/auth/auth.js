function showView(name) {
  const allViews = document.querySelectorAll("[data-view]");
  allViews.forEach((el) => {
    const viewName = el.getAttribute("data-view");
    el.classList.toggle("active", viewName === name);
  });

  const authRoot = document.querySelector('[data-view="auth"]');
  if (authRoot) {
    authRoot.classList.toggle("active", name === "login" || name === "signup");
  }

  const activeSection = document.querySelector(`[data-view="${name}"]`);
  if (!activeSection) {
    console.warn(`showView: no element found with data-view="${name}"`);
    return;
  }

  const seg = activeSection.querySelector(".segmented-control");
  if (seg) {
    const radios = seg.querySelectorAll('input[type="radio"]');
    if (radios.length >= 2) {
      radios[0].checked = name === "login";
      radios[1].checked = name === "signup";
    }
  }
}



function registerUser(email, password, name = "") {
  if (!email || !password) return { ok: false, error: "Please provide email and password." };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters long." };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) return { ok: false, error: "Please enter a valid email address." };

  const key = "tm_users";
  let users = {};
  try {
    users = JSON.parse(localStorage.getItem(key) || "{}");
  } catch (err) {
    users = {};
  }

  const normalized = email.toLowerCase();
  if (users[normalized]) return { ok: false, error: "Account with that email already exists. Please log in." };

  users[normalized] = { password, name };

  try {
    localStorage.setItem(key, JSON.stringify(users));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: "Unable to save user in localStorage." };
  }
}

function loginUser(email, password) {
  if (!email || !password) return { ok: false, error: "Please enter email and password." };

  const key = "tm_users";
  let users = {};
  try {
    users = JSON.parse(localStorage.getItem(key) || "{}");
  } catch (err) {
    return { ok: false, error: "Stored user data is corrupted." };
  }

  const normalized = email.toLowerCase();
  const savedUser = users[normalized];
  if (!savedUser) return { ok: false, error: "No account found. Please sign up first." };

  if (savedUser.password !== password) return { ok: false, error: "Invalid email or password." };

  return {
    ok: true,
    user: {
      email: normalized,
      name: savedUser.name
    }
  };
}

function attachAuthHandlers(element) {
  if (!element) return;

  const seg = element.querySelector(".segmented-control");
  if (seg) {
    const radios = seg.querySelectorAll('input[type="radio"]');
    const labels = seg.querySelectorAll("label");

    if (radios[0]) radios[0].addEventListener("change", () => showView("login"));
    if (radios[1]) radios[1].addEventListener("change", () => showView("signup"));
    if (labels[0]) labels[0].addEventListener("click", () => showView("login"));
    if (labels[1]) labels[1].addEventListener("click", () => showView("signup"));
  }

  const form = element.querySelector("form");
  if (form && !form.dataset.handlerAttached) {
    form.dataset.handlerAttached = "true";

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();

      const view = form.closest("[data-view]")?.getAttribute("data-view");
      const email = form.querySelector("input[name='email']")?.value.trim();
      const password = form.querySelector("input[name='password']")?.value.trim();
      const name = form.querySelector("input[name='name']")?.value.trim() || "";

      if (view === "signup") {
        const res = registerUser(email, password, name);
        if (!res.ok) return alert(res.error);

        const loginSection = element.querySelector('[data-view="login"]');
        if (loginSection) {
          const loginEmail = loginSection.querySelector("input[name='email']");
          if (loginEmail) loginEmail.value = email;
        }

        showView("login");
        return;
      }

      if (view === "login") {
        const res = loginUser(email, password);
        if (!res.ok) return alert(res.error);

        localStorage.setItem(
          "tm_logged_in",
          JSON.stringify({
            email: res.user.email,
            name: res.user.name || "User",
            at: new Date().toISOString()
          })
        );

        showView("dashboard");
        window.initDashboard();
      }
    });
  }
}

function initAuthInternal() {
  const authRoot = document.querySelector('[data-view="auth"]');
  if (!authRoot) return;

  const loggedInRaw = localStorage.getItem("tm_logged_in");
  if (loggedInRaw) {
    try {
      const loggedInUser = JSON.parse(loggedInRaw);
      if (loggedInUser && loggedInUser.email) {
        attachAuthHandlers(authRoot);
        const nested = authRoot.querySelectorAll('[data-view]');
        nested.forEach((el) => attachAuthHandlers(el));

        showView("dashboard");
        window.initDashboard();
        return;
      }
    } catch (err) {
      console.warn("tm_logged_in corrupted, falling back to login");
    }
  }

  authRoot.classList.add("active");
  attachAuthHandlers(authRoot);

  const nested = authRoot.querySelectorAll('[data-view]');
  nested.forEach((el) => attachAuthHandlers(el));

  showView("login");
}

window.initAuth = initAuthInternal;
document.addEventListener("DOMContentLoaded", initAuthInternal);
