import { useRef } from "react";

export default function useTilt({ max = 10, scale = 1.02, glare = true } = {}) {
  const ref = useRef(null);
  const glareRef = useRef(null);

  function handleMouseMove(e) {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateX = (py - 0.5) * -max;
    const rotateY = (px - 0.5) * max;

    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;

    if (glare && glareRef.current) {
      const isDark = document.body.classList.contains("dark");
      const glareColor = isDark ? "168, 139, 250" : "255, 255, 255";
      const glareOpacity = isDark ? 0.22 : 0.28;

      glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(${glareColor}, ${glareOpacity}), transparent 60%)`;
      glareRef.current.style.opacity = "1";
    }
  }

  function handleMouseLeave() {
    if (ref.current) ref.current.style.transform = "";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  }

  return { ref, glareRef, handleMouseMove, handleMouseLeave };
}