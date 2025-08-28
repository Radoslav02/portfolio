import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import "./About.css";

/** Characters used during animation (Matrix style) */
const CHARSET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポ";

/** Single animated word component (similar to header) */
function SlotWord({
  text,
  className,
  startDelay = 0,
  perCharStagger = 0.06,
  baseDuration = 0.7,
  randomDuration = 0.6,
  onAllComplete,
  collapseAfter = true,
}: {
  text: string;
  className?: string;
  startDelay?: number;
  perCharStagger?: number;
  baseDuration?: number;
  randomDuration?: number;
  onAllComplete?: () => void;
  collapseAfter?: boolean;
}) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const letters = useMemo(() => text.split(""), [text]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

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
        onAllComplete?.();
      });

      return () => {
        tweens.forEach((t) => t.kill());
        fin.kill();
      };
    }, containerRef);

    return () => ctx.revert();
  }, [
    letters,
    text,
    startDelay,
    perCharStagger,
    baseDuration,
    randomDuration,
    onAllComplete,
    collapseAfter,
  ]);

  return (
    <span ref={containerRef} className={className}>
      {letters.map((ch, i) => (
        <span key={i} data-letter={ch} className="slot-letter">
          {ch === " " ? " " : ""}
        </span>
      ))}
    </span>
  );
}

export default function About() {
  return (
    <div className="about-container">
      {/* Animated title */}
      <SlotWord
        text="About Me"
        className="about-title"
        startDelay={0.2}
        perCharStagger={0.08}
        baseDuration={0.7}
        randomDuration={0.5}
      />

      {/* Description text */}
      <p className="about-text">
        I am a 4th-year Computer Science student at the Faculty of Mathematics,
        University of Novi Sad, with a solid foundation in computer operations
        and software engineering principles. My academic journey has equipped me
        with practical experience, particularly in Java and JavaScript (React),
        bolstered by a hands-on internship at Comdata software company. I thrive
        in team-oriented environments and am committed to learning and adhering
        to industry standards. I am eager to further develop my skills through
        industry placements and internships.
      </p>
    </div>
  );
}
