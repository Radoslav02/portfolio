import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import "./Contact.css";

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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReduced) {
      el.textContent = letters.join("");
      return;
    }

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
      });

      return () => {
        tweens.forEach((t) => t.kill());
        fin.kill();
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

export default function Contact() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          setRunId((n) => n + 1);
        }
      },
      { threshold: [0, 0.5, 1] }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      className="contact-section"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="contact-wrap">
        <h2 className="contact-title" id="contact-title">
          <SlotText
            key={`title-${runId}`}
            text="Get in Touch"
            startDelay={0.1}
            perCharStagger={0.06}
            baseDuration={0.6}
            randomDuration={0.4}
          />
        </h2>

        <div className="contact-info">
          <p>
            <a
              className="contact-link"
              href="tel:+381693889340"
              aria-label="Call +381 69 388 9340"
            >
              <SlotText
                key={`phone-${runId}`}
                text="📞 Phone: +381 69 388 9340"
                startDelay={0.2}
                perCharStagger={0.02}
                baseDuration={0.5}
              />
            </a>
          </p>
          <p>
            <a
              className="contact-link"
              href="mailto:radoslavpavkovg@gmail.com"
              aria-label="Email radoslavpavkovg@gmail.com"
            >
              <SlotText
                key={`email-${runId}`}
                text="📧 Email: radoslavpavkovg@gmail.com"
                startDelay={0.3}
                perCharStagger={0.02}
                baseDuration={0.5}
              />
            </a>
          </p>
          <p>
            <SlotText
              key={`address-${runId}`}
              text="📍 Address: Novi Sad, Serbia"
              startDelay={0.4}
              perCharStagger={0.02}
              baseDuration={0.5}
            />
          </p>
        </div>

        <a
          className="cv-button"
          href="/CV Radoslav Pavkov.pdf"
          download="CV Radoslav Pavkov.pdf"
        >
          Download CV
        </a>
      </div>
    </section>
  );
}
