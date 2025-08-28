// src/components/Scrolling/Landing.tsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Home from "../Home/Home";
import About from "../About/About";
import Skills from "../Skills/Skills";
import Work from "../Work/Work";
import Contact from "../Contact/Conact";
import "./Landing.css";

const SECTIONS = ["home", "about", "skills", "work", "contact"] as const;
type SectionKey = typeof SECTIONS[number];

export default function Landing() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const sectionEls = useRef<Record<SectionKey, HTMLElement | null>>({
    home: null, about: null, skills: null, work: null, contact: null,
  });

  const setRef = (key: SectionKey) => (el: HTMLElement | null) => {
    sectionEls.current[key] = el;
  };

  const scrollTo = (key: SectionKey, behavior: ScrollBehavior = "smooth") => {
    const el = sectionEls.current[key];
    if (el) el.scrollIntoView({ behavior, block: "start" });
  };

  useEffect(() => {
    const seg = (pathname.replace(/^\//, "") || "home") as SectionKey;
    if (SECTIONS.includes(seg)) {
      scrollTo(seg, performance.now() < 2000 ? "auto" : "smooth");
    }
  }, [pathname]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const key = (best.target as HTMLElement).dataset.section as SectionKey;
        if (key) navigate(`/${key}`, { replace: false });
      },
      { threshold: Array.from({ length: 11 }, (_, i) => i / 10) }
    );
    SECTIONS.forEach((k) => {
      const el = sectionEls.current[k];
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [navigate]);

  return (
    <main className="snap-container">
      {/* HOME (your real Home component) */}
      <section ref={setRef("home")} data-section="home" className="snap-section">
        <div className="home-section-wrap">
          <Home />
        </div>
      </section>

      <section ref={setRef("about")} data-section="about" className="snap-section">
        <div className="center-wrap"><About /></div>
      </section>

      <section ref={setRef("skills")} data-section="skills" className="snap-section">
        <div className="center-wrap"><Skills /></div>
      </section>

      <section ref={setRef("work")} data-section="work" className="snap-section">
        <div className="center-wrap"><Work /></div>
      </section>

      <section ref={setRef("contact")} data-section="contact" className="snap-section">
        <div className="center-wrap"><Contact /></div>
      </section>
    </main>
  );
}
