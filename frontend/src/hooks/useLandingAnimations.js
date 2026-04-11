import { useState, useEffect, useRef } from "react";

export function useGlobalMouse() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return mouse;
}

export function useMouseParallax(strength = 20) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      setPos({ x: ((e.clientX - r.left - r.width / 2) / r.width) * strength, y: ((e.clientY - r.top - r.height / 2) / r.height) * strength });
    };
    const onLeave = () => setPos({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove); el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [strength]);
  return { ref, pos };
}

export function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold, rootMargin: "0px 0px -50px 0px" });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function useTilt(max = 12) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50 });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      setTilt({ x: (py - 0.5) * -max * 2, y: (px - 0.5) * max * 2, gx: px * 100, gy: py * 100 });
    };
    const onLeave = () => setTilt({ x: 0, y: 0, gx: 50, gy: 50 });
    el.addEventListener("mousemove", onMove); el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [max]);
  return { ref, tilt };
}