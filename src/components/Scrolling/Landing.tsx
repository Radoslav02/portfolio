// src/components/Scrolling/Landing.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import Home from "../Home/Home";
import About from "../About/About";
import Skills from "../Skills/Skills";
import Work from "../Work/Work";
import Contact from "../Contact/Conact";
import "./Landing.css";

gsap.registerPlugin(ScrollToPlugin);

const SECTIONS = ["home", "about", "skills", "work", "contact"] as const;
type SectionKey = (typeof SECTIONS)[number];

export default function Landing() {
  const scrollerRef = useRef<HTMLElement | null>(null);
  const sectionEls = useRef<Record<SectionKey, HTMLElement | null>>({
    home: null,
    about: null,
    skills: null,
    work: null,
    contact: null,
  });

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimatingRef = useRef(false);
  const lastWheelTsRef = useRef(0);
  const pendingIndexRef = useRef<number | null>(null);

  const setRef = (key: SectionKey) => (el: HTMLElement | null) => {
    sectionEls.current[key] = el;
  };

  const indexOfPath = (p: string): number => {
    const seg = (p.replace(/^\//, "") || "home") as SectionKey;
    const idx = SECTIONS.indexOf(seg);
    return idx >= 0 ? idx : 0;
  };

  const animateTo = (index: number) => {
    const scroller = scrollerRef.current;
    const key = SECTIONS[index];
    const target = sectionEls.current[key];
    if (!scroller || !target) return;

    gsap.killTweensOf(scroller);

    isAnimatingRef.current = true;
    pendingIndexRef.current = null;

    gsap.to(scroller, {
      duration: 0.8,
      ease: "power2.inOut",
      scrollTo: { y: target, offsetY: 0, autoKill: false },
      onComplete: () => {
        setCurrentIndex(index);
        isAnimatingRef.current = false;

        if (
          pendingIndexRef.current !== null &&
          pendingIndexRef.current !== index
        ) {
          const next = pendingIndexRef.current;
          pendingIndexRef.current = null;
          animateTo(next);
        }
      },
    });
  };

  useEffect(() => {
    const targetIdx = indexOfPath(pathname);
    if (isAnimatingRef.current) {
      pendingIndexRef.current = targetIdx;
    } else if (targetIdx !== currentIndex) {
      animateTo(targetIdx);
    }
  }, [pathname]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const COOLDOWN = 700;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const now = performance.now();
      if (isAnimatingRef.current || now - lastWheelTsRef.current < COOLDOWN)
        return;

      const dir = e.deltaY > 0 ? 1 : -1;
      let next = currentIndex + dir;
      next = Math.max(0, Math.min(SECTIONS.length - 1, next));
      if (next === currentIndex) return;

      lastWheelTsRef.current = now;

      navigate(`/${SECTIONS[next]}`, { replace: false });
    };

    scroller.addEventListener("wheel", onWheel, { passive: false });

    return () => scroller.removeEventListener("wheel", onWheel as any);
  }, [currentIndex, navigate]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const idx = indexOfPath(pathname);
    const key = SECTIONS[idx];
    const target = sectionEls.current[key];
    if (target) {
      scroller.scrollTo({ top: target.offsetTop, behavior: "auto" });
      setCurrentIndex(idx);
    }
  }, []);

  return (
    <main ref={scrollerRef} className="snap-container">
      <section
        ref={setRef("home")}
        data-section="home"
        className="snap-section"
      >
        <div className="home-section-wrap">
          <Home />
        </div>
      </section>

      <section
        ref={setRef("about")}
        data-section="about"
        className="snap-section"
      >
        <div className="center-wrap">
          <About />
        </div>
      </section>

      <section
        ref={setRef("skills")}
        data-section="skills"
        className="snap-section"
      >
        <div className="center-wrap">
          <Skills />
        </div>
      </section>

      <section
        ref={setRef("work")}
        data-section="work"
        className="snap-section"
      >
        <div className="center-wrap">
          <Work />
        </div>
      </section>

      <section
        ref={setRef("contact")}
        data-section="contact"
        className="snap-section"
      >
        <div className="center-wrap">
          <Contact />
        </div>
      </section>
    </main>
  );
}
