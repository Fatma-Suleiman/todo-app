window.initProfile = function initProfile() {
  console.log("initProfile called");

  // Make sure the profile element exists in the DOM
  const profileEl = document.querySelector(".profile");
  if (!profileEl) {
    console.warn("Profile element not found. Retrying...");
    setTimeout(initProfile, 50);
    return;
  }
  console.log("Profile element found:", profileEl);

  // Get current logged-in user
  const loggedIn = localStorage.getItem("tm_logged_in");
  if (!loggedIn) {
    console.warn("No logged-in user found in localStorage");
    return;
  }
  console.log("Logged-in data found:", loggedIn);

  let user;
  try {
    user = JSON.parse(loggedIn);
  } catch (err) {
    console.error("Failed to parse logged-in data:", err);
    return;
  }
  console.log("Parsed user object:", user);

  const email = user.email;
  if (!email) {
    console.warn("User object does not contain email");
    return;
  }
  console.log("User email:", email);

  // Write email
  const emailEl = document.getElementById("profile-email");
  if (!emailEl) {
    console.warn("Email element (#profile-email) not found");
  } else {
    emailEl.textContent = email;
    console.log("Email set in profile:", emailEl.textContent);
  }

  // Avatar = first letter of email
  const avatarEl = document.getElementById("profile-avatar");
  if (!avatarEl) {
    console.warn("Avatar element (#profile-avatar) not found");
  } else {
    avatarEl.textContent = email.charAt(0).toUpperCase();
    console.log("Avatar set in profile:", avatarEl.textContent);
  }

  console.log("initProfile completed successfully");
};
