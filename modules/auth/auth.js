/* ========== VIEW SWITCHING ========== */
function showView(name) {
  const sections = document.querySelectorAll("[data-view]");
  sections.forEach((s) => {
    s.classList.toggle("active", s.getAttribute("data-view") === name);
  });

  // Ensure the segmented control in the active section reflects the state
  const activeSection = document.querySelector(`[data-view="${name}"]`);
  if (activeSection) {
    const seg = activeSection.querySelector(".segmented-control");
    if (seg) {
      const radios = seg.querySelectorAll('input[type="radio"]');
      if (radios.length >= 2) {
        if (name === "login") radios[0].checked = true;
        if (name === "signup") radios[1].checked = true;
      }
    }
  }
}

/* Show login first on page load */
document.addEventListener("DOMContentLoaded", () => showView("login"));

/* ========== SIMPLE LOCALSTORAGE AUTH (FRONTEND-ONLY) ========== */

/**
 * registerUser(email, password)
 * - validates inputs
 * - enforces password length >= 6
 * - saves single user under key 'tm_user' in localStorage
 * - returns { ok: true } or { ok: false, error: "..." }
 */
function registerUser(email, password) {
  if (!email || !password) {
    return { ok: false, error: "Please provide email and password." };
  }

  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters long." };
  }

  // Basic email structure check (simple)
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  // Save user (single-user demo)
  const user = { email: email.toLowerCase(), password };
  try {
    localStorage.setItem("tm_user", JSON.stringify(user));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: "Unable to save user in localStorage." };
  }
}

/**
 * loginUser(email, password)
 * - checks credentials against saved user in localStorage
 * - returns { ok: true, user } or { ok: false, error: "..." }
 */
function loginUser(email, password) {
  if (!email || !password) {
    return { ok: false, error: "Please enter email and password." };
  }

  const saved = localStorage.getItem("tm_user");
  if (!saved) return { ok: false, error: "No account found. Please sign up first." };

  let savedUser;
  try {
    savedUser = JSON.parse(saved);
  } catch (err) {
    return { ok: false, error: "Stored user data is corrupted." };
  }

  if (savedUser.email !== email.toLowerCase() || savedUser.password !== password) {
    return { ok: false, error: "Invalid email or password." };
  }

  return { ok: true, user: savedUser };
}

/* ========== ATTACH AUTH HANDLERS ========== */
function attachAuthHandlers(element) {
  // wire segmented control radios to show views
  const seg = element.querySelector(".segmented-control");
  if (seg) {
    const radios = seg.querySelectorAll('input[type="radio"]');
    if (radios[0]) radios[0].addEventListener("change", () => { if (radios[0].checked) showView("login"); });
    if (radios[1]) radios[1].addEventListener("change", () => { if (radios[1].checked) showView("signup"); });

    const labels = seg.querySelectorAll("label");
    if (labels[0]) labels[0].addEventListener("click", () => showView("login"));
    if (labels[1]) labels[1].addEventListener("click", () => showView("signup"));
  }

  // form submit handling (one form per component)
  const form = element.querySelector("form");
  if (form && !form.dataset.handlerAttached) {
    form.dataset.handlerAttached = "true";

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();

      const view = form.closest("[data-view]")?.getAttribute("data-view");

      // find fields by name attribute (be sure these attributes exist in your HTML)
      const email = form.querySelector("input[name='email']")?.value.trim();
      const password = form.querySelector("input[name='password']")?.value.trim();

      if (view === "signup") {
        const res = registerUser(email, password);
        if (!res.ok) {
          alert(res.error);
          return;
        }

        // success
        alert("Signup successful! Please log in.");
        // if login view already loaded, prefill the email field
        const loginSection = document.querySelector('[data-view="login"]');
        if (loginSection) {
          const loginEmail = loginSection.querySelector("input[name='email']");
          if (loginEmail) loginEmail.value = email;
        }
        showView("login");
        return;
      }

      if (view === "login") {
        const res = loginUser(email, password);
        if (!res.ok) {
          alert(res.error);
          return;
        }

        // success -> go to dashboard
        alert("Login successful!");
        // (optionally store a logged-in flag)
        localStorage.setItem("tm_logged_in", JSON.stringify({ email: res.user.email, at: new Date().toISOString() }));
        showView("dashboard");
        return;
      }
    });
  }
}
