"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring } from "framer-motion";

interface Props {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function NumberTicker({ value, className, prefix, suffix }: Props) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 20,
  });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (v) => {
      setDisplay(Number.isInteger(value) ? Math.round(v) : Number(v.toFixed(2)));
    });
    return () => unsubscribe();
  }, [springValue, value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
