import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import "./Header.css";

const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface SlotWordProps {
  text: string;
  className?: string;
  onClick?: () => void;

  startDelay?: number;
  perCharStagger?: number;
  baseDuration?: number;
  randomDuration?: number;

  onAllComplete?: () => void;
  collapseAfter?: boolean;
}

const randomGlyph = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

function rollLetter(
  span: HTMLSpanElement,
  finalChar: string,
  duration: number,
  delay: number
) {
  const proxy = { t: 0 };
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

function calcFinishTime(
  letterCount: number,
  {
    startDelay,
    perCharStagger,
    baseDuration,
    randomDuration,
  }: Required<
    Pick<
      SlotWordProps,
      "startDelay" | "perCharStagger" | "baseDuration" | "randomDuration"
    >
  >
) {
  return (
    startDelay +
    letterCount * perCharStagger +
    baseDuration +
    randomDuration +
    0.2
  );
}

function scheduleCollapse(
  el: HTMLElement,
  text: string,
  totalFinish: number,
  collapseAfter: boolean,
  onAllComplete?: () => void
) {
  return gsap.delayedCall(totalFinish, () => {
    if (collapseAfter) {
      el.replaceChildren();
      el.textContent = text;
    }
    gsap.set(el, { pointerEvents: "auto" });
    onAllComplete?.();
  });
}

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

        tweens.push(rollLetter(span, finalChar, duration, delay));
      });

      const totalFinish = calcFinishTime(letters.length, {
        startDelay,
        perCharStagger,
        baseDuration,
        randomDuration,
      });

      scheduleCollapse(el, text, totalFinish, collapseAfter, onAllComplete);
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
    <span
      ref={containerRef}
      className={className}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
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

  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const closeMobile = useCallback(() => setOpen(false), []);
  const openMobile = useCallback(() => setOpen(true), []);

  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      const t = gsap.from(headerRef.current!, {
        y: -12,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete() {
          gsap.set(headerRef.current!, {
            clearProps: "opacity,visibility,transform",
          });
        },
      });
      return () => t.kill();
    }, headerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const body = document.body;

    if (open) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      body.style.overflow = "hidden";
      tl.set(overlayRef.current, { pointerEvents: "auto" })
        .fromTo(
          overlayRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.2 }
        )
        .fromTo(
          panelRef.current,
          { yPercent: -5, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.22 },
          "<"
        );
      return () => {
        body.style.overflow = "";
        tl.kill();
      };
    } else {
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete() {
          gsap.set(headerRef.current!, {
            clearProps: "opacity,visibility,transform",
          });
        },
      });
      tl.to(panelRef.current, {
        yPercent: -4,
        autoAlpha: 0,
        duration: 0.18,
      }).to(overlayRef.current, { autoAlpha: 0, duration: 0.18 }, "<");
      return () => tl.kill();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const MenuLink = (props: { label: string; to: string; delay?: number }) => (
    <SlotWord
      text={props.label}
      className="menu-item"
      startDelay={props.delay ?? 0}
      onClick={() => {
        navigate(props.to);
        closeMobile();
      }}
    />
  );

  return (
    <>
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
              gsap.fromTo(
                ".header-title",
                { textShadow: "0 0 0px rgba(0,255,138,0.0)" },
                {
                  textShadow: "0 0 12px rgba(0,255,138,0.8)",
                  duration: 0.25,
                  yoyo: true,
                  repeat: 1,
                }
              );
            }}
          />
        </div>
        <div className="header-right desktop-only">
          <MenuLink label="Home" to="/home" delay={3.0} />
          <MenuLink label="About" to="/about" delay={3.1} />
          <MenuLink label="Skills" to="/skills" delay={3.2} />
          <MenuLink label="Work" to="/work" delay={3.3} />
          <MenuLink label="Contact" to="/contact" delay={3.4} />
        </div>

        <button
          className="burger-btn mobile-only"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => (open ? closeMobile() : openMobile())}
        >
          {open ? (
            <CloseIcon fontSize="inherit" />
          ) : (
            <MenuIcon fontSize="inherit" />
          )}
        </button>
      </div>

      <div
        ref={overlayRef}
        className="mobile-overlay"
        onClick={closeMobile}
        aria-hidden={!open}
      >
        <div
          id="mobile-menu"
          className="mobile-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="mobile-nav">
            <MenuLink label="Home" to="/home" />
            <MenuLink label="About" to="/about" />
            <MenuLink label="Skills" to="/skills" />
            <MenuLink label="Work" to="/work" />
            <MenuLink label="Contact" to="/contact" />
          </nav>
        </div>
      </div>
    </>
  );
}
