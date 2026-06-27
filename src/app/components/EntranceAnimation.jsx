"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function EntranceAnimation({ onComplete }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const subtitleRef = useRef(null);
  const glowsRef = useRef([]);
  const particlesRef = useRef(null);
  const gridRef = useRef(null);
  const ringsRef = useRef([]);
  const hasRun = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const particles = [];
    const firstName = firstNameRef.current;
    const lastName = lastNameRef.current;
    const subtitle = subtitleRef.current;

    // Split text into chars
    const splitText = (el) => {
      const text = el.textContent;
      el.innerHTML = "";
      return text.split("").map(char => {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.display = "inline-block";
        el.appendChild(span);
        return span;
      });
    };

    const firstChars = splitText(firstName);
    const lastChars = splitText(lastName);
    const subChars = splitText(subtitle);

    // Spawn advanced particles
    const spawnParticles = () => {
      const container = particlesRef.current;
      if (!container) return;
      const colors = ["#4f46e5", "#6366f1", "#8b5cf6", "#fcd34d", "#fbbf24", "#ffffff"];
      for (let i = 0; i < 60; i++) {
        const el = document.createElement("div");
        const size = 2 + Math.random() * 6;
        Object.assign(el.style, {
          position: "absolute",
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          background: colors[Math.floor(Math.random() * colors.length)],
          boxShadow: `0 0 ${size * 3}px currentColor`,
          pointerEvents: "none",
          top: "50%",
          left: "50%",
          opacity: 0,
        });
        container.appendChild(el);
        particles.push(el);
      }
    };

    // Magnetic cursor
    let magnetActive = false;
    const onMouseMove = (e) => {
      if (!magnetActive) return;
      const x = (e.clientX / window.innerWidth - 0.5);
      const y = (e.clientY / window.innerHeight - 0.5);
      gsap.to(contentRef.current, {
        x: x * 30,
        y: y * 30,
        rotateX: -y * 5,
        rotateY: x * 5,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(glowsRef.current, {
        x: x * 80,
        y: y * 80,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.05,
        overwrite: "auto",
      });
    };

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(overlayRef.current, { opacity: 1 });
      gsap.set(contentRef.current, { opacity: 0, scale: 0.8, rotateX: 15 });
      gsap.set(firstChars, { opacity: 0, y: 100, rotateX: -90, scale: 0.5 });
      gsap.set(lastChars, { opacity: 0, y: -80, rotateX: 90, scale: 0.5 });
      gsap.set(subChars, { opacity: 0, y: 30, rotateZ: () => gsap.utils.random(-15, 15) });
      gsap.set(glowsRef.current, { opacity: 0, scale: 0.5 });
      gsap.set(ringsRef.current, { opacity: 0, scale: 0, rotate: 0 });
      gsap.set(gridRef.current, { opacity: 0, scale: 1.5 });

      const tl = gsap.timeline({
        onComplete: () => onCompleteRef.current?.(),
      });

      // Grid entrance
      tl.to(gridRef.current, { opacity: 0.08, scale: 1, duration: 1.2, ease: "power2.out" }, 0);

      // Glows appear
      tl.to(glowsRef.current, {
        opacity: i => [0.25, 0.15, 0.3, 0.2][i],
        scale: 1,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
      }, 0.2);

      // Rings spin in
      tl.to(ringsRef.current, {
        opacity: 0.4,
        scale: 1,
        rotate: 360,
        duration: 1.5,
        ease: "expo.out",
        stagger: 0.08,
      }, 0.3);

      // Content fade + scale
      tl.to(contentRef.current, { opacity: 1, scale: 1, rotateX: 0, duration: 0.8, ease: "back.out(1.2)" }, 0.5);

      // First name - liquid reveal
      tl.to(firstChars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.8,
        ease: "expo.out",
        stagger: {
          each: 0.03,
          from: "random",
        },
      }, 0.7);

      // Chromatic flash
      tl.to(firstChars, {
        textShadow: "2px 0 #ff00ff, -2px 0 #00ffff",
        duration: 0.05,
        yoyo: true,
        repeat: 3,
        stagger: 0.01,
      }, 1.1);
      tl.set(firstChars, { textShadow: "none" }, 1.3);

      // Last name - wave from center
      tl.to(lastChars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.7,
        ease: "back.out(2)",
        stagger: {
          each: 0.04,
          from: "center",
        },
      }, 1.2);

      // Particle burst
      tl.call(spawnParticles, [], 1.4);
      tl.to(particles, {
        x: () => gsap.utils.random(-400, 400),
        y: () => gsap.utils.random(-400, 400),
        opacity: 1,
        scale: () => gsap.utils.random(0.5, 2),
        duration: 1.2,
        ease: "power2.out",
        stagger: {
          each: 0.008,
          from: "random",
        },
      }, 1.42);
      tl.to(particles, {
        opacity: 0,
        scale: 0,
        duration: 0.6,
        ease: "power2.in",
        stagger: 0.005,
      }, 2.3);

      // Subtitle - bounce reveal
      tl.to(subChars, {
        opacity: 1,
        y: 0,
        rotateZ: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.6)",
        stagger: 0.02,
      }, 1.6);

      // Enable magnetic
      tl.call(() => { magnetActive = true; }, [], 2.0);

      // Pulse glow
      tl.to(glowsRef.current[1], {
        scale: 1.5,
        opacity: 0.3,
        duration: 0.6,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
      }, 2.2);

      // Disable magnetic
      tl.call(() => { magnetActive = false; }, [], 3.0);

      // Exit: morph out
      tl.to(contentRef.current, { scale: 0.95, duration: 0.3 }, 3.0);
      tl.to(firstChars, {
        opacity: 0,
        y: -60,
        rotateX: -45,
        scale: 0.8,
        duration: 0.5,
        ease: "power2.in",
        stagger: { each: 0.015, from: "edges" },
      }, 3.1);
      tl.to(lastChars, {
        opacity: 0,
        y: 60,
        rotateX: 45,
        scale: 0.8,
        duration: 0.5,
        ease: "power2.in",
        stagger: { each: 0.015, from: "edges" },
      }, 3.15);
      tl.to(subChars, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: "power2.in",
        stagger: 0.01,
      }, 3.2);

      // Rings spin out
      tl.to(ringsRef.current, {
        scale: 2,
        rotate: -180,
        opacity: 0,
        duration: 0.7,
        ease: "power2.in",
        stagger: 0.05,
      }, 3.2);

      // Glows expand + fade
      tl.to(glowsRef.current, {
        scale: 3,
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        stagger: 0.08,
      }, 3.3);

      // Grid fade
      tl.to(gridRef.current, { opacity: 0, scale: 0.8, duration: 0.6 }, 3.4);

      // Final overlay fade
      tl.to(overlayRef.current, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, 3.7);
    }, overlayRef);

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", onMouseMove);
      particles.forEach(el => el.remove());
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
      style={{ perspective: "1500px" }}
    >
      {/* Background grid */}
      <div
        ref={gridRef}
        className="absolute inset-0 opacity-0"
        style={{
          backgroundImage: `
            linear-gradient(#4f46e515 1px, transparent 1px),
            linear-gradient(90deg, #4f46e515 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Glows */}
      <div ref={el => glowsRef.current[0] = el} className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600 blur-[160px] pointer-events-none opacity-0" />
      <div ref={el => glowsRef.current[1] = el} className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500 blur-[140px] pointer-events-none opacity-0" />
      <div ref={el => glowsRef.current[2] = el} className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full bg-yellow-400 blur-[150px] pointer-events-none opacity-0" />
      <div ref={el => glowsRef.current[3] = el} className="absolute bottom-1/4 -right-32 w-[450px] h-[450px] rounded-full bg-blue-500 blur-[130px] pointer-events-none opacity-0" />

      {/* Spinning rings */}
      <div ref={el => ringsRef.current[0] = el} className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0">
        <div className="w-[90vmin] h-[90vmin] rounded-full border border-indigo-500/30" />
      </div>
      <div ref={el => ringsRef.current[1] = el} className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0">
        <div className="w-[70vmin] h-[70vmin] rounded-full border-2 border-purple-400/20" />
      </div>
      <div ref={el => ringsRef.current[2] = el} className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0">
        <div className="w-[50vmin] h-[50vmin] rounded-full border border-yellow-400/25" />
      </div>

      {/* Content */}
      <div ref={contentRef} className="relative text-center px-6 select-none" style={{ transformStyle: "preserve-3d" }}>
        <h1
          ref={firstNameRef}
          className="text-[clamp(3rem,14vw,10rem)] font-black tracking-[-0.04em] leading-none text-white"
          style={{ textShadow: "0 0 40px rgba(79, 70, 229, 0.6)" }}
        >
          GALANG
        </h1>

        <div className="flex justify-center my-5 md:my-6">
          <div className="relative w-32 md:w-40 h-1 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 blur-sm" />
          </div>
        </div>

        <h1
          ref={lastNameRef}
          className="text-[clamp(1.75rem,5.5vw,5rem)] font-bold tracking-[0.25em] uppercase leading-none text-yellow-300"
          style={{ textShadow: "0 0 30px rgba(252, 211, 77, 0.5)" }}
        >
          PRAMUDITO
        </h1>

        <p
          ref={subtitleRef}
          className="mt-10 text-sm md:text-base font-semibold tracking-[0.3em] uppercase text-indigo-400"
          style={{ textShadow: "0 0 20px rgba(79, 70, 229, 0.8)" }}
        >
          Web Developer &amp; Creative Enthusiast
        </p>
      </div>

      {/* Particles container */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />
    </div>
  );
}
