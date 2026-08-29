"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  className?: string;
  value: number;
}

export function AnimatedNumber({ className, value }: AnimatedNumberProps) {
  const elementRef = useRef<HTMLElement>(null);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    let frame = 0;
    const startAnimation = () => {
      const startedAt = performance.now();
      const duration = 560;
      const update = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(value * eased));
        if (progress < 1) frame = requestAnimationFrame(update);
      };
      frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        startAnimation();
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <strong className={className} ref={elementRef}>{String(displayValue).padStart(2, "0")}</strong>;
}
