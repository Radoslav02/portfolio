import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import "./Header.css";

/** Characters used while letters "spin" (Matrix vibe) */
const CHARSET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Props for the rolling word component */
interface SlotWordProps {
  text: string;
  className?: string;
  onClick?: () => void;

  /** animation timings */
  startDelay?: number;      // when the first letter starts
  perCharStagger?: number;  // delay added per letter (creates wave)
  baseDuration?: number;    // base length of each letter's roll
  randomDuration?: number;  // random extra time per letter

  /** callback when the entire word has settled */
  onAllComplete?: () => void;

  /** after settle, replace spans with plain text (better kerning) */
  collapseAfter?: boolean;
}

/** Random char from the charset */
const randomGlyph = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

/** Animate a single span to "roll" and then land on its final char */
function rollLetter(
  span: HTMLSpanElement,
  finalChar: string,
  duration: number,
  delay: number
) {
  const proxy = { t: 0 }; // gsap animates numbers; we swap text onUpdate
  return gsap.to(proxy, {
    t: 1,
    duration,
    delay,
    ease: "power1.out",
    onUpdate: () => {
      span.textContent = randomGlyph();
    },
    onComplete: () => {
      span.textContent = finalChar;
    },
  });
}

/** Calculate when the whole word is done */
function calcFinishTime(
  letterCount: number,
  { startDelay, perCharStagger, baseDuration, randomDuration }: Required<
    Pick<SlotWordProps, "startDelay" | "perCharStagger" | "baseDuration" | "randomDuration">
  >
) {
  // conservative upper bound (last letter + its possible extra)
  return startDelay + letterCount * perCharStagger + baseDuration + randomDuration + 0.2;
}

/** After all letters settle, optionally collapse spans -> plain text for nice kerning */
function scheduleCollapse(
  el: HTMLElement,
  text: string,
  totalFinish: number,
  collapseAfter: boolean,
  onAllComplete?: () => void
) {
  return gsap.delayedCall(totalFinish, () => {
    if (collapseAfter) {
      el.replaceChildren();   // clear all spans
      el.textContent = text;  // set the final word as plain text
    }
    gsap.set(el, { pointerEvents: "auto" });
    onAllComplete?.();
  });
}

/** A word whose letters roll through glyphs before settling to the target text */
function SlotWord({
  text,
  className,
  onClick,
  startDelay = 0,
  perCharStagger = 0.06,
  baseDuration = 0.7,
  randomDuration = 0.6,
  onAllComplete,
  collapseAfter = true,
}: SlotWordProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const letters = useMemo(() => text.split(""), [text]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Prevent clicks while rolling
    gsap.set(el, { pointerEvents: "none" });

    // Scope all GSAP calls to this element for tidy cleanup
    const ctx = gsap.context(() => {
      const spans = Array.from(
        el.querySelectorAll<HTMLSpanElement>("[data-letter]")
      );

      // Start a tween per letter
      const tweens: gsap.core.Tween[] = [];
      spans.forEach((span, idx) => {
        const finalChar = span.dataset.letter ?? "";
        if (finalChar === " ") {
          span.textContent = " ";
          return;
        }

        const duration = baseDuration + Math.random() * randomDuration;
        const delay = startDelay + idx * perCharStagger + Math.random() * 0.08;

        tweens.push(rollLetter(span, finalChar, duration, delay));
      });

      // When all letters should be done, enable clicks and (optionally) collapse to text
      const totalFinish = calcFinishTime(letters.length, {
        startDelay,
        perCharStagger,
        baseDuration,
        randomDuration,
      });

      scheduleCollapse(el, text, totalFinish, collapseAfter, onAllComplete);
    }, containerRef); // <= everything inside is tied to this ref

    // Cleanup all animations related to this component
    return () => ctx.revert();
  }, [letters, text, startDelay, perCharStagger, baseDuration, randomDuration, onAllComplete, collapseAfter]);

  return (
    <span
      ref={containerRef}
      className={className}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {letters.map((ch, i) => (
        <span key={i} data-letter={ch} className="slot-letter">
          {ch === " " ? " " : ""}
        </span>
      ))}
    </span>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement | null>(null);

  // Small entrance for the whole header bar
  useEffect(() => {
    if (!headerRef.current) return;

    const ctx = gsap.context(() => {
      const t = gsap.from(headerRef.current!, {
        y: -12,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete() {
          // Remove inline styles so CSS takes over after the tween
          gsap.set(headerRef.current!, {
            clearProps: "opacity,visibility,transform",
          });
        },
      });
      return () => t.kill();
    }, headerRef);

    return () => ctx.revert(); // ✅ proper cleanup, returns void
  }, []);

  return (
    <div ref={headerRef} className="header-container">
      <div className="header-left">
        <SlotWord
          text="Radoslav"
          className="header-title slot-title"
          startDelay={0.2}
          perCharStagger={0.07}
          baseDuration={0.65}
          randomDuration={0.5}
          onAllComplete={() => {
            // Little glow pulse once the title settles
            gsap.fromTo(
              ".header-title",
              { textShadow: "0 0 0px rgba(0,255,138,0.0)" },
              { textShadow: "0 0 12px rgba(0,255,138,0.8)", duration: 0.25, yoyo: true, repeat: 1 }
            );
          }}
        />
      </div>

      <div className="header-right">
        {/* Menu rolls after ~3s */}
        <SlotWord text="Home"    className="menu-item" startDelay={3.0} onClick={() => navigate("/home")} />
        <SlotWord text="About"   className="menu-item" startDelay={3.1} onClick={() => navigate("/about")} />
        <SlotWord text="Skills"  className="menu-item" startDelay={3.2} onClick={() => navigate("/skills")} />
        <SlotWord text="Work"    className="menu-item" startDelay={3.3} onClick={() => navigate("/work")} />
        <SlotWord text="Contact" className="menu-item" startDelay={3.4} onClick={() => navigate("/contact")} />
      </div>
    </div>
  );
}
