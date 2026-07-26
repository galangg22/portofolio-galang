"use client";

import { useEffect, useRef, useState } from "react";

// Global render queue so we only render one PDF at a time across all instances
let renderQueue = Promise.resolve();

export default function PdfThumbnail({ url, width = 600, className = "" }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | done | error

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let task;

    // 1. Scroll Intent Debounce: Wait 400ms before starting
    const timerId = setTimeout(() => {
      // 2. Global Sequential Queue: Only render one PDF at a time
      renderQueue = renderQueue.then(async () => {
        if (cancelled) return; // Skip if scrolled away

        try {
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

          task = pdfjsLib.getDocument({ url });
          const pdf = await task.promise;
          const page = await pdf.getPage(1);

          const base = page.getViewport({ scale: 1 });
          const scale = width / base.width;
          const viewport = page.getViewport({ scale });

          if (cancelled) return;
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const canvasContext = canvas.getContext("2d");
          await page.render({ canvasContext, viewport }).promise;
          
          if (!cancelled) setStatus("done");

          // 3. Main-Thread Yielding: Give browser 150ms to process scrolling/GSAP
          await new Promise(resolve => setTimeout(resolve, 150));
          
        } catch (e) {
          if (!cancelled) setStatus("error");
        }
      });
    }, 400);

    return () => { 
      cancelled = true; 
      clearTimeout(timerId);
      task?.destroy?.(); 
    };
  }, [url, width]);

  if (!url || status === "error") {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center ${className}`}>
        <i className="ri-award-fill text-6xl text-white/40"></i>
      </div>
    );
  }

  return (
    <div className={`relative w-full max-w-full overflow-hidden ${className}`}>
      {status === "loading" && <div className="absolute inset-0 bg-white/5 animate-pulse"></div>}
      <canvas ref={canvasRef} className={`w-full h-auto block ${status === "done" ? "" : "opacity-0"}`} />
    </div>
  );
}
