"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import PdfThumbnail from "@/app/components/PdfThumbnail";

export default function CertificatesClient({ certs: initialCerts }) {
  const [certs] = useState(initialCerts);
  const [modal, setModal] = useState(null);
  const [copied, setCopied] = useState(false);

  // Handle keyboard events (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const share = (cert) => {
    navigator.clipboard.writeText(`${window.location.origin}/certificates#${cert.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="min-h-screen bg-bg-dark text-white p-4 sm:p-8 md:p-16 relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute left-[-20%] top-[-10%] w-[60%] h-[40%] bg-accent blur-[120px] rounded-full"></div>
        <div className="absolute right-[-20%] bottom-[-10%] w-[60%] h-[40%] bg-primary blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto mb-8 md:mb-16 relative z-10 pt-4 md:pt-0">
        <Link href="/" className="inline-flex items-center gap-3 text-accent font-bold uppercase text-[10px] tracking-[0.2em] mb-8 md:mb-12 hover:text-black dark:hover:text-white transition-colors group">
          <div className="w-8 h-8 rounded-full border border-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
            <i className="ri-arrow-left-line"></i>
          </div>
          Back to Home
        </Link>
        <h1 className="font-display text-4xl md:text-6xl font-normal mb-3 md:mb-4 tracking-tight leading-tight">Certificates</h1>
        <p className="text-gray-400 max-w-xl text-sm md:text-base font-light leading-relaxed">
          Sertifikat dan pencapaian dari berbagai program, pelatihan, dan kompetisi.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {certs.map((cert) => (
          <div key={cert.id} id={cert.id} className="group bg-card-bg border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col">
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center overflow-hidden">
              {cert.verify_url?.endsWith('.pdf') ? (
                <PdfThumbnail url={cert.verify_url} width={600} />
              ) : cert.image_url ? (
                <Image src={cert.image_url} alt={cert.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              ) : (
                <i className="ri-award-fill text-6xl text-white/40"></i>
              )}
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-bold text-base md:text-lg text-white mb-2">{cert.title}</h3>
              <p className="text-sm text-gray-400 flex items-center gap-2 mb-1"><i className="ri-award-line text-accent"></i> {cert.issuer}{cert.issue_date ? ` · ${cert.issue_date}` : ""}</p>
              {cert.description && <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">{cert.description}</p>}
              {(cert.verify_url || cert.credential_url) && (
                <button onClick={() => setModal(cert)} className="inline-flex items-center gap-2 w-fit text-sm font-bold text-white bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent transition-colors mt-auto">
                  View Credential <i className="ri-external-link-line"></i>
                </button>
              )}
            </div>
          </div>
        ))}
        {!certs.length && <p className="text-gray-500 text-sm col-span-full">Belum ada sertifikat.</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[200] flex md:items-center md:justify-center md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setModal(null)}></div>
          <div className="relative z-10 w-full md:max-w-4xl bg-card-bg md:border border-white/10 md:rounded-2xl overflow-y-auto md:max-h-[90vh] grid md:grid-cols-2">
            <button onClick={() => setModal(null)} className="fixed md:absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-11 md:h-11 bg-black/80 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center z-[300] transition-all active:scale-90 border border-white/20 md:border-transparent shadow-xl md:shadow-none">
              <i className="ri-close-line text-xl md:text-2xl"></i>
            </button>
            {/* PDF Preview */}
            <div className="bg-white/5 flex items-start justify-center overflow-y-auto">
              {modal.verify_url?.endsWith('.pdf') ? (
                <PdfThumbnail url={modal.verify_url} width={900} />
              ) : modal.image_url ? (
                <Image src={modal.image_url} alt={modal.title} width={900} height={636} className="w-full h-auto" />
              ) : (
                <div className="w-full aspect-[1/1.414] bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center">
                  <i className="ri-award-fill text-8xl text-white/40"></i>
                </div>
              )}
            </div>
            {/* Detail */}
            <div className="p-6 flex flex-col">
              <h4 className="font-bold text-xl text-white mb-4 pr-10">{modal.title}</h4>
              <dl className="space-y-3 text-sm flex-1">
                <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Penerbit</dt><dd className="text-white">{modal.issuer}</dd></div>
                {modal.credential_id && <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Credential ID</dt><dd className="text-white break-all">{modal.credential_id}</dd></div>}
                {modal.credential_url && <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Credential Link</dt><dd><a href={modal.credential_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors break-all">{modal.credential_url} <i className="ri-external-link-line text-xs"></i></a></dd></div>}
                {modal.issue_date && <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Tanggal Terbit</dt><dd className="text-white">{modal.issue_date}</dd></div>}
                {modal.description && <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Deskripsi</dt><dd className="text-gray-300 leading-relaxed">{modal.description}</dd></div>}
              </dl>
              <div className="flex flex-wrap gap-3 mt-6">
                {modal.verify_url && (
                  <a href={modal.verify_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-accent px-5 py-2.5 rounded-xl hover:scale-105 transition-transform">
                    View PDF <i className="ri-file-pdf-2-line"></i>
                  </a>
                )}
                {modal.credential_url && (
                  <a href={modal.credential_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-accent/80 px-5 py-2.5 rounded-xl hover:scale-105 transition-transform">
                    Verify Credential <i className="ri-external-link-line"></i>
                  </a>
                )}
                <button onClick={() => share(modal)} className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl hover:border-accent/40 transition-colors">
                  <i className="ri-link"></i> {copied ? "Tersalin!" : "Share Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-20 md:mt-32 pb-8 md:pb-16 text-center border-t border-white/5 pt-8 md:pt-10">
        <p className="text-gray-600 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.4em]">
          Galang Arrauf Pramudito • Certificates 2026
        </p>
      </footer>
    </main>
  );
}
