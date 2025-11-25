window.initProfile = function initProfile() {
  // Wait for the .profile container to exist
  const profileEl = document.querySelector(".profile");
  if (!profileEl) {
    setTimeout(initProfile, 50);
    return;
  }

  // Get user from localStorage
  const stored = localStorage.getItem("tm_logged_in");
  if (!stored) return;

  let user = {};
  try {
    user = JSON.parse(stored);
  } catch (e) {
    console.error("Corrupt tm_logged_in data:", e);
    return;
  }

  const name = user.name ? user.name.trim() : "User";
  const email = user.email || "";

  // ---- INSERT NAME ----
  const nameEl = document.getElementById("profile-name");
  if (nameEl) {
    nameEl.textContent = name;
  }

  // ---- INSERT EMAIL ----
  const emailEl = document.getElementById("profile-email");
  if (emailEl) {
    emailEl.textContent = email;
  }

  // ---- AVATAR ----
  const avatarEl = document.getElementById("profile-avatar");
  if (avatarEl) {
    const avatarLetter =
      name && name.length > 0
        ? name.charAt(0).toUpperCase()
        : email.charAt(0).toUpperCase();

    avatarEl.textContent = avatarLetter;
  }
};
