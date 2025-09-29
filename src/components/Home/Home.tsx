import { useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import "./Home.css";
import profileImage from "../../assets/unnamed.jpg";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showText, setShowText] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showIcons, setShowIcons] = useState(false);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const el = canvasRef.current;
    if (!(el instanceof HTMLCanvasElement)) return;

    const ctx = el.getContext("2d");
    if (!(ctx instanceof CanvasRenderingContext2D)) return;

    const setSize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const w = window.innerWidth;
      const h = window.innerHeight;

      el.style.width = w + "px";
      el.style.height = h + "px";
      el.width = Math.floor(w * dpr);
      el.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setSize();
    let resizeTO: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTO);
      resizeTO = window.setTimeout(setSize, 150);
    };
    window.addEventListener("resize", onResize);

    const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const alphabet = latin + nums;

    const fontSize = 16;

    const columns = () => Math.floor(el.clientWidth / fontSize);
    let rainDrops: number[] = Array(columns()).fill(1);

    const syncColumns = () => {
      const c = columns();
      if (c !== rainDrops.length) {
        rainDrops = Array(c).fill(1);
      }
    };

    let rafId = 0;
    let lastTime = 0;
    const intervalMs = 40;

    const draw = (time: number) => {
      rafId = window.requestAnimationFrame(draw);
      if (prefersReduced) return;

      if (time - lastTime < intervalMs) return;
      lastTime = time;

      syncColumns();

      ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
      ctx.fillRect(0, 0, el.clientWidth, el.clientHeight);

      ctx.fillStyle = "rgba(0, 255, 138, 0.65)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(
          Math.floor(Math.random() * alphabet.length)
        );
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (
          rainDrops[i] * fontSize > el.clientHeight &&
          Math.random() > 0.975
        ) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    const startTO = window.setTimeout(
      () => {
        rafId = window.requestAnimationFrame(draw);
      },
      prefersReduced ? 0 : 1500
    );

    return () => {
      window.clearTimeout(startTO);
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [prefersReduced]);

  useEffect(() => {
    if (prefersReduced) {
      setShowText(true);
      setShowImage(true);
      setShowIcons(true);
      return;
    }
    const t1 = setTimeout(() => setShowText(true), 1200);
    const t2 = setTimeout(() => setShowImage(true), 1600);
    const t3 = setTimeout(() => setShowIcons(true), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [prefersReduced]);

  const textRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (!showText || !textRef.current || prefersReduced) return;

    const textElement = textRef.current;
    const original = textElement.innerText;
    const letters = original.split("");
    let iteration = 0;

    const interval = setInterval(() => {
      textElement.innerText = letters
        .map((letter, idx) => {
          if (idx < iteration) return letter;
          return String.fromCharCode(0x30a0 + Math.random() * 96);
        })
        .join("");

      if (iteration >= letters.length) {
        textElement.innerText = original;
        clearInterval(interval);
      }
      iteration += 0.5;
    }, 30);

    return () => clearInterval(interval);
  }, [showText, prefersReduced]);

  return (
    <div className="home-container">
      <canvas ref={canvasRef} className="matrix-canvas" />

      <div className="home-content">
        <div className={`home-image ${showImage ? "visible" : ""}`}>
          <img src={profileImage} alt="Radoslav" />
        </div>

        <div className={`home-text ${showText ? "visible" : ""}`}>
          <h1 ref={textRef}>Hi, I’m Radoslav</h1>
          <p>
            Software engineer | Angular | React | .NET Core | Java | I design
            and code things — and I love what I do.
          </p>

          {showIcons && (
            <div className="social-icons">
              <a
                href="https://github.com/Radoslav02"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/radoslav-pavkov-7a7421321/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://www.instagram.com/radoslavpavkov/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
