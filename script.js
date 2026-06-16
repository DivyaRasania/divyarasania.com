const mouseGlow = document.getElementById("mouseGlow");

document.addEventListener("mousemove", (e) => {
  mouseGlow.style.left = e.clientX - 150 + "px";
  mouseGlow.style.top = e.clientY - 150 + "px";
});
