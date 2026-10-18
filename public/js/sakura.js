(() => {
  const overlay = document.getElementById("sakura-overlay");
  if (!overlay) return;

  const count = 22;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement("span");
    petal.className = "sakura-petal";
    petal.textContent = "✿";

    petal.style.left = Math.random() * 100 + "%";
    petal.style.animationDuration =
      (8 + Math.random() * 12) + "s";
    petal.style.animationDelay =
      (-Math.random() * 20) + "s";
    petal.style.fontSize =
      (10 + Math.random() * 12) + "px";

    overlay.appendChild(petal);
  }
})();
