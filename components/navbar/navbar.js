const links = document.querySelectorAll(".navbar-list a");
links.forEach(link => {
  if (link.href.includes(location.pathname)) {
    link.classList.add("active");
  }
});