function loadCommunityAvatar() {
  const avatarEl = document.getElementById("community-avatar");
  if (!avatarEl) {
    setTimeout(loadCommunityAvatar, 50);
    return;
  }

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
  const letter = name.charAt(0).toUpperCase();

  avatarEl.textContent = letter;
}

loadCommunityAvatar();
