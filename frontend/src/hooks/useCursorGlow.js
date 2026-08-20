import { useEffect, useRef } from "react";

export default function useCursorGlow() {
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let frame;

    function handleMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function animate() {
      currentX += (mouseX - currentX) * 0.03;
      currentY += (mouseY - currentY) * 0.03;

      const offsetX = (currentX - window.innerWidth / 2) * 0.06;
      const offsetY = (currentY - window.innerHeight / 2) * 0.06;

      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
      }

      frame = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", handleMouseMove);
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return { blob1Ref, blob2Ref };
}