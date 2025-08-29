import { useEffect, useRef, useState } from "react";
import "./Work.css";

type Project = {
  title: string;
  note: string;
  href: string;
  img: string;   // put your image path here (e.g. "/work/valkyra.jpg")
};

const PROJECTS: Project[] = [
  {
    title: "Valkyra Shop",
    note: "Web shop for Valkyra Studio Design",
    href: "https://valkyra-shop.vercel.app",
    img: "/work/valkyra.jpg",
  },
  {
    title: "Plant Centar",
    note: "Site for agricultural pharmacy Plant Centar",
    href: "https://plantcentar.com/pocetna",
    img: "/work/plant-centar.jpg",
  },
  {
    title: "YPlanner",
    note: "Daily task planner",
    href: "https://github.com/Radoslav02/yplanner",
    img: "/work/yplanner.jpg",
  },
  {
    title: "Critic Cafe",
    note: "Social network for movie lovers",
    href: "https://github.com/Radoslav02/CriticCafe",
    img: "/work/critic-cafe.jpg",
  },
  {
    title: "Voice Assistant",
    note: "Voice assistant integrated with ChatGPT",
    href: "https://github.com/Radoslav02/voice-assistant",
    img: "/work/voice-assistant.jpg",
  },
  {
    title: "Portfolio",
    note: "Personal portfolio site",
    href: "https://github.com/Radoslav02/portfolio",
    img: "/work/portfolio.jpg",
  },
];

export default function Work() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  // simple reveal when section enters viewport
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio > 0.35),
      { threshold: [0, 0.35, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={rootRef} className="work-section" id="work">
      <div className="work-wrap">
        <h2 className="work-title">
          <span>Selected Work</span>
        </h2>

        <div className={`work-grid ${inView ? "is-on" : ""}`}>
          {PROJECTS.map((p) => (
            <a
              key={p.title}
              className="work-card"
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              title={p.title}
            >
              <img src={p.img} alt={p.title} loading="lazy" />
              <div className="work-overlay">
                <h3>{p.title}</h3>
                <p>{p.note}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
