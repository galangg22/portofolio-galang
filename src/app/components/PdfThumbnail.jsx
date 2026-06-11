"use client";

import { useEffect, useRef, useState } from "react";

export default function PdfThumbnail({ url, width = 600, className = "" }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | done | error

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let task;

    (async () => {
      try {
        console.log('loading PDF:', url);
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        task = pdfjsLib.getDocument({ url });
        const pdf = await task.promise;
        console.log('PDF loaded, pages:', pdf.numPages);
        const page = await pdf.getPage(1);

        const base = page.getViewport({ scale: 1 });
        const scale = width / base.width;
        const viewport = page.getViewport({ scale });
        console.log('viewport:', viewport.width, viewport.height);

        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvas, viewport }).promise;
        console.log('page rendered, canvas:', canvasRef.current);
        if (!cancelled) setStatus("done");
      } catch (e) {
        console.error('PdfThumbnail error:', e);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => { cancelled = true; task?.destroy?.(); };
  }, [url, width]);

  if (!url || status === "error") {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center ${className}`}>
        <i className="ri-award-fill text-6xl text-white/40"></i>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {status === "loading" && <div className="absolute inset-0 bg-white/5 animate-pulse"></div>}
      <canvas ref={canvasRef} className={`w-full h-auto block ${status === "done" ? "" : "opacity-0"}`} />
    </div>
  );
}
