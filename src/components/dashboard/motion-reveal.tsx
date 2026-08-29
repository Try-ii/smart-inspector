"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

interface MotionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function MotionReveal({ children, className = "", delay = 0 }: MotionRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`si-motion-reveal ${isVisible ? "si-is-visible" : ""} ${className}`}
      ref={elementRef}
      style={{ "--si-motion-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
