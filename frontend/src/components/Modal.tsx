import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ open, title, description, onClose, children }: { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex items-start justify-between gap-4 border-b border-white/[.07] px-5 py-5 sm:px-6">
        <div><p className="eyebrow">New account</p><h2 id="modal-title" className="mt-1 text-xl font-semibold text-white">{title}</h2>{description && <p className="mt-1 text-sm text-slate-400">{description}</p>}</div>
        <button type="button" onClick={onClose} className="btn-icon h-8 w-8" aria-label="Close dialog"><X size={17} /></button>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  </div>;
}
