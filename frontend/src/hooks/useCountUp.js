import { useEffect, useState } from "react";

export default function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const numericTarget = parseFloat(target);

    if (isNaN(numericTarget)) {
      setValue(target); // non-numeric values (e.g. "86%") just show as-is
      return;
    }

    let startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      const isDecimal = !Number.isInteger(numericTarget);
      const current = numericTarget * eased;

      setValue(isDecimal ? current.toFixed(1) : Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    const frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}