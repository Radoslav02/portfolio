import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import "./About.css";

const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function SlotWord({
  text,
  className,
  startDelay = 0,
  perCharStagger = 0.06,
  baseDuration = 0.7,
  randomDuration = 0.6,
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReduced) {
      el.textContent = text;
      return;
    }

    gsap.set(el, { pointerEvents: "none" });
    const ctx = gsap.context(() => {
      const spans = Array.from(
        el.querySelectorAll<HTMLSpanElement>("[data-letter]")
      );
      const tweens: gsap.core.Tween[] = [];

      spans.forEach((span, idx) => {
        const finalChar = span.dataset.letter ?? "";
        if (finalChar === " ") {
          span.textContent = " ";
          return;
        }

        const duration = baseDuration + Math.random() * randomDuration;
        const delay = startDelay + idx * perCharStagger + Math.random() * 0.08;
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
    prefersReduced,
  ]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {letters.map((ch, i) => (
        <span key={i} data-letter={ch} className="slot-letter">
          {ch === " " ? " " : ""}
        </span>
      ))}
    </span>
  );
}

function SlotText(props: React.ComponentProps<typeof SlotWord>) {
  return <SlotWord {...props} />;
}

export default function About() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting && e.intersectionRatio >= 0.6) {
          setRunId((n) => n + 1);
        }
      },
      { threshold: [0, 0.6, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const paragraph =
    "I am a 4th-year Computer Science student at the Faculty of Mathematics, University of Novi Sad, with a solid foundation in computer operations and software engineering principles. My academic journey has equipped me with practical experience, particularly in Java and JavaScript (React). I thrive in team-oriented environments and am committed to learning and adhering to industry standards. I am eager to further develop my skills through industry placements and internships.";

  return (
    <section
      ref={rootRef}
      className="about-container"
      aria-labelledby="about-title"
    >
      <div className="about-inner">
        <SlotText
          key={`title-${runId}`}
          text="About Me"
          className="about-title"
          startDelay={0.1}
          perCharStagger={0.07}
          baseDuration={0.65}
          randomDuration={0.5}
        />

        <p className="about-text">
          <SlotText
            key={`para-${runId}`}
            text={paragraph}
            className="about-paragraph"
            startDelay={0.2}
            perCharStagger={0.02}
            baseDuration={0.5}
            randomDuration={0.4}
            collapseAfter={true}
          />
        </p>
      </div>
    </section>
  );
}
