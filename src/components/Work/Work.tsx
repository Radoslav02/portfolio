import { useEffect, useRef, useState } from "react";
import "./Work.css";
import critic from "../../assets/images/critic.png";
import plant from "../../assets/images/plant.png";
import valkyra from "../../assets/images/valkyra.png";
import yplanner from "../../assets/images/yplanner.png";
import portfolio from "../../assets/images/portfolio.png";
import jarvis from "../../assets/images/jarvis.png";

type Project = {
  title: string;
  note: string;
  href: string;
  img: string;
};

const PROJECTS: Project[] = [
  {
    title: "Valkyra Shop",
    note: "Web shop for Valkyra Studio Design",
    href: "https://valkyra-shop.vercel.app",
    img: `${valkyra}`,
  },
  {
    title: "Plant Centar",
    note: "Site for agricultural pharmacy Plant Centar",
    href: "https://plantcentar.com/pocetna",
    img: `${plant}`,
  },
  {
    title: "YPlanner",
    note: "Daily task planner",
    href: "https://github.com/Radoslav02/yplanner",
    img: `${yplanner}`,
  },
  {
    title: "Critic Cafe",
    note: "Social network for movie lovers",
    href: "https://github.com/Radoslav02/CriticCafe",
    img: `${critic}`,
  },
  {
    title: "Voice Assistant",
    note: "Voice assistant integrated with ChatGPT",
    href: "https://github.com/Radoslav02/voice-assistant",
    img: `${jarvis}`,
  },
  {
    title: "Portfolio",
    note: "Personal portfolio site",
    href: "https://github.com/Radoslav02/portfolio",
    img: `${portfolio}`,
  },
];

export default function Work() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) =>
        setInView(entry.isIntersecting && entry.intersectionRatio > 0.35),
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
