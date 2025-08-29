import { useEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import "./Skills.css";

type Skill = {
  name: string;
  value: number;
  color: "orange" | "blue" | "gold" | "green";
};

const SKILLS: Skill[] = [
  { name: "Java", value: 80, color: "orange" },
  { name: "JavaScript", value: 90, color: "blue" },
  { name: "CSS", value: 85, color: "green" },
  { name: "HTML", value: 90, color: "gold" },
];


const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Generički slot teksta: animira SVAKI karakter */
function SlotText({
  text,
  className,
  startDelay = 0,
  perCharStagger = 0.05,
  baseDuration = 0.6,
  randomDuration = 0.5,
  collapseAfter = true,
}: {
  text: string;
  className?: string;
  startDelay?: number;
  perCharStagger?: number;
  baseDuration?: number;
  randomDuration?: number;
  collapseAfter?: boolean;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const letters = useMemo(() => text.split(""), [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { pointerEvents: "none" });

    const ctx = gsap.context(() => {
      const spans = Array.from(
        el.querySelectorAll<HTMLSpanElement>("[data-letter]")
      );
      const tweens: gsap.core.Tween[] = [];

      spans.forEach((span, i) => {
        const finalChar = span.dataset.letter ?? "";
        if (finalChar === " ") {
          span.textContent = " ";
          return;
        }

        const duration = baseDuration + Math.random() * randomDuration;
        const delay = startDelay + i * perCharStagger + Math.random() * 0.08;
        const proxy = { t: 0 };

        tweens.push(
          gsap.to(proxy, {
            t: 1,
            duration,
            delay,
            ease: "power1.out",
            onUpdate: () => {
              span.textContent =
                CHARSET[Math.floor(Math.random() * CHARSET.length)];
            },
            onComplete: () => {
              span.textContent = finalChar;
            },
          })
        );
      });

      const totalFinish =
        startDelay +
        letters.length * perCharStagger +
        baseDuration +
        randomDuration +
        0.2;

      const fin = gsap.delayedCall(totalFinish, () => {
        if (collapseAfter) {
          el.replaceChildren();
          el.textContent = text;
        }
        gsap.set(el, { pointerEvents: "auto" });
      });

      return () => {
        tweens.forEach((t) => t.kill());
        fin.kill();
      };
    }, ref);

    return () => ctx.revert();
  }, [
    letters,
    text,
    startDelay,
    perCharStagger,
    baseDuration,
    randomDuration,
    collapseAfter,
  ]);

  return (
    <span ref={ref} className={className}>
      {letters.map((ch, i) => (
        <span key={i} data-letter={ch} className="slot-letter">
          {ch === " " ? " " : ""}
        </span>
      ))}
    </span>
  );
}

export default function Skills() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [runId, setRunId] = useState(0); // remount slot teksta kad uđe u viewport

  // Posmatraj ulazak sekcije u viewport
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const seen = entry.isIntersecting && entry.intersectionRatio > 0.4;
        setInView(seen);
        if (seen) setRunId((n) => n + 1); // pokreni slot animacije iznova
      },
      { threshold: [0, 0.25, 0.4, 0.75, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={rootRef} className="skills-section" id="skills">
      <div className="skills-wrap">
        <h2 className="skills-title">
          {/* key osigurava restart animacije naslova svaki put */}
          <SlotText
            key={`title-${runId}`}
            text="My Skills"
            className=""
            startDelay={0.1}
            perCharStagger={0.07}
            baseDuration={0.6}
            randomDuration={0.5}
          />
        </h2>

        <div className="skills-grid">
          {/* Levo: uvod (i on se rola) */}
          <div className="skills-intro">
            <h3>
              <SlotText
                key={`h3-${runId}`}
                text="My Skills and Experiences"
                startDelay={0.15}
                perCharStagger={0.03}
                baseDuration={0.5}
                randomDuration={0.4}
              />
            </h3>
            <p>
              <SlotText
                key={`p-${runId}`}
                text="I started my journey with a two-week internship where I learned the fundamentals of React and gained an understanding of core frontend concepts. After the internship, I continued learning on my own, working on several mini projects to improve my practical skills and deepen my knowledge.
Currently, I’m working at Payspot as a Junior Frontend Developer, where I focus on building applications using React, React Native and C#. I’m constantly improving my skills and expanding my expertise in modern frontend development."
                startDelay={0.2}
                perCharStagger={0.015}
                baseDuration={0.45}
                randomDuration={0.35}
              />
            </p>
          </div>

          <div className="skills-bars">
            {SKILLS.map((s, i) => (
              <SkillBar
                key={s.name}
                label={s.name}
                value={s.value}
                color={s.color}
                animate={inView}
                delayMs={200 * i}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SkillBar({
  label,
  value,
  color,
  animate,
  delayMs = 0,
}: {
  label: string;
  value: number; // 0..100
  color: "orange" | "blue" | "gold" | "green";
  animate: boolean;
  delayMs?: number;
}) {
  return (
    <div className="skill">
      <div className="skill-head">
        <span className="skill-label">{label}</span>
        <span className="skill-value">{value}%</span>
      </div>
      <div className="track" aria-hidden="true">
        <div
          className={`fill ${color} ${animate ? "is-on" : ""}`}
          style={
            animate
              ? { width: `${value}%`, transitionDelay: `${delayMs}ms` }
              : { width: "0%" }
          }
        />
      </div>
    </div>
  );
}
