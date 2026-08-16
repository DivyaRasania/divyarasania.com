const mouseGlow = document.getElementById("mouseGlow");

const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (mouseGlow && canHover) {
  document.addEventListener("mousemove", (e) => {
    mouseGlow.style.left = e.clientX - 150 + "px";
    mouseGlow.style.top = e.clientY - 150 + "px";
  });
}
