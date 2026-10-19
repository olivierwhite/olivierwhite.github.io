// Smartphone menu and light/dark theme toggle. The site works without this script:
// the menu is then always open and the theme follows the system setting.
(function () {
  var root = document.documentElement;

  var menuButton = document.querySelector(".menu-button");
  var menu = document.getElementById("site-menu");
  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  var toggle = document.querySelector(".theme-toggle");
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() {
    return root.getAttribute("data-theme") || (systemDark.matches ? "dark" : "light");
  }
  function showState() {
    if (toggle) toggle.querySelector("span").textContent =
      currentTheme() === "dark" ? "Switch to light theme" : "Switch to dark theme";
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      showState();
    });
  }
  systemDark.addEventListener("change", showState);
  showState();

  // Email address assembled here to keep it away from simple spam harvesters.
  document.querySelectorAll(".email-link").forEach(function (a) {
    var address = a.getAttribute("data-user") + "@" + a.getAttribute("data-domain");
    a.href = "mailto:" + address;
    a.textContent = address;
  });
})();
