document.addEventListener("DOMContentLoaded", () => {
  const menuToggleBtn = document.getElementById("menuToggleBtn");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const menuOverlay = document.getElementById("menuOverlay");

  function openMenu() {
    sideMenu.classList.add("open");
    menuOverlay.classList.add("active");
  }

  function closeMenu() {
    sideMenu.classList.remove("open");
    menuOverlay.classList.remove("active");
  }

  if (menuToggleBtn) menuToggleBtn.addEventListener("click", openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMenu);
  if (menuOverlay) menuOverlay.addEventListener("click", closeMenu);
});
