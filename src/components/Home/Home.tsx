import { useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import "./Home.css";
import profileImage from "../../assets/unnamed.jpg";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showText, setShowText] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showIcons, setShowIcons] = useState(false);

  // 1. Matrix rain effect
  useEffect(() => {
    const el = canvasRef.current;
    if (!(el instanceof HTMLCanvasElement)) return; // ✅ canvas is a real <canvas>

    const ctx = el.getContext("2d");
    if (!(ctx instanceof CanvasRenderingContext2D)) return; // ✅ real 2D context

    // keep canvas sized to viewport
    const setSize = () => {
      el.width = window.innerWidth;
      el.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const katakana =
      "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポ";
    const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const alphabet = katakana + latin + nums;

    const fontSize = 16;
    const columns = Math.floor(el.width / fontSize);
    const rainDrops: number[] = Array(columns).fill(1);

    // ✅ Note the explicit types: no nullable canvas/ctx inside
    const draw = (ctx: CanvasRenderingContext2D, c: HTMLCanvasElement) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
      ctx.fillRect(0, 0, c.width, c.height);

      // slightly dimmer letters
      ctx.fillStyle = "rgba(0, 255, 138, 0.65)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(
          Math.floor(Math.random() * alphabet.length)
        );
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > c.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => draw(ctx, el), 40);
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  // 2. Reveal text, image & icons step by step
  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 5000); // show text
    const t2 = setTimeout(() => setShowImage(true), 6500); // show image
    const t3 = setTimeout(() => setShowIcons(true), 7500); // show icons
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // 3. Animate text reveal with GSAP "decoding" effect
  const textRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (!showText || !textRef.current) return;

    const textElement = textRef.current;
    const letters = textElement.innerText.split("");
    let iteration = 0;

    const interval = setInterval(() => {
      textElement.innerText = letters
        .map((letter, idx) => {
          if (idx < iteration) return letter;
          return String.fromCharCode(0x30a0 + Math.random() * 96); // random katakana
        })
        .join("");

      if (iteration >= letters.length) clearInterval(interval);
      iteration += 1 / 2;
    }, 30);

    return () => clearInterval(interval);
  }, [showText]);

  return (
    <div className="home-container">
      {/* Matrix rain canvas */}
      <canvas ref={canvasRef} className="matrix-canvas" />

      {/* Page content */}
      <div className="home-content">
        {/* LEFT: Profile Image */}
        <div className={`home-image ${showImage ? "visible" : ""}`}>
          <img src={profileImage} alt="Radoslav" />
        </div>

        {/* RIGHT: Intro Text */}
        <div className={`home-text ${showText ? "visible" : ""}`}>
          <h1 ref={textRef}>Hi, I’m Radoslav</h1>
          <p>
            Software engineer| Angular | React | .NET Core | Java | 
            I design and code things. and I love what I do.
          </p>

          {/* Social Icons */}
          {showIcons && (
            <div className="social-icons">
              <a
                href="https://github.com/Radoslav02"
                target="_blank"
                rel="noreferrer"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/radoslav-pavkov-7a7421321/"
                target="_blank"
                rel="noreferrer"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://www.instagram.com/radoslavpavkov/"
                target="_blank"
                rel="noreferrer"
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
