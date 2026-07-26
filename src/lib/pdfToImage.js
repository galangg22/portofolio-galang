"use client";

export async function generatePdfThumbnail(pdfUrl) {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const task = pdfjsLib.getDocument({ url: pdfUrl });
    const pdf = await task.promise;
    const page = await pdf.getPage(1);

    // Set a reasonable scale for a high-quality thumbnail (e.g. 800px wide)
    const base = page.getViewport({ scale: 1 });
    const scale = 800 / base.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const canvasContext = canvas.getContext("2d");
    await page.render({ canvasContext, viewport }).promise;

    // Convert canvas to a JPEG Blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob from canvas"));
        },
        "image/jpeg",
        0.8 // 80% quality
      );
    });
  } catch (error) {
    console.error("Error generating PDF thumbnail:", error);
    throw error;
  }
}
