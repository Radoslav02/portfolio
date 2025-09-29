import { useEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import "./Skills.css";

type Skill = {
  name: string;
};

const SKILLS: Skill[] = [
  { name: "Java" },
  { name: "JavaScript" },
  { name: "CSS" },
  { name: "HTML" },
];

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

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

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const runningRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReduced) {
      el.textContent = letters.join("");
      return;
    }
    if (runningRef.current) return;
    runningRef.current = true;

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
          el.textContent = letters.join("");
        }
        gsap.set(el, { pointerEvents: "auto" });
        runningRef.current = false;
      });

      return () => {
        tweens.forEach((t) => t.kill());
        fin.kill();
        runningRef.current = false;
      };
    }, ref);

    return () => ctx.revert();
  }, [
    letters,
    startDelay,
    perCharStagger,
    baseDuration,
    randomDuration,
    collapseAfter,
    prefersReduced,
  ]);

  return (
    <span ref={ref} className={className} aria-label={letters.join("")}>
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
  const [runId, setRunId] = useState(0);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          setRunId((n) => n + 1);
          io.unobserve(el);
        }
      },
      {
        threshold: 0.6,
        root: null,
        rootMargin: "0px 0px -15% 0px",
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      className="skills-section"
      id="skills"
      aria-labelledby="skills-title"
    >
      <div className="skills-wrap">
        <h2 className="skills-title" id="skills-title">
          <SlotText
            key={`title-${runId}`}
            text="My Skills"
            startDelay={0.1}
            perCharStagger={0.07}
            baseDuration={0.6}
            randomDuration={0.5}
          />
        </h2>

        <div className="skills-grid">
          {/* Levo: intro tekst */}
          <div className="skills-intro">
            <p>
              <SlotText
                key={`intro-${runId}`}
                text="I started my journey with a two-week internship where I learned the fundamentals of React and gained an understanding of core frontend concepts. After the internship, I continued learning on my own, working on several mini projects to improve my practical skills and deepen my knowledge. Currently, I’m working at Payspot as a Junior Frontend Developer, where I focus on building applications using React, React Native and C#. I’m constantly improving my skills and expanding my expertise in modern frontend development."
                startDelay={0.2}
                perCharStagger={0.015}
                baseDuration={0.45}
                randomDuration={0.35}
              />
            </p>
          </div>

          <div className="skills-list">
            {SKILLS.map((s, i) => (
              <div
                className="skill-label-big"
                key={s.name}
                style={{ transitionDelay: `${80 * i}ms` }}
              >
                <SlotText
                  key={`skill-${runId}-${s.name}`}
                  text={s.name}
                  startDelay={0.15 + i * 0.05}
                  perCharStagger={0.035}
                  baseDuration={0.45}
                  randomDuration={0.3}
                  collapseAfter={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
