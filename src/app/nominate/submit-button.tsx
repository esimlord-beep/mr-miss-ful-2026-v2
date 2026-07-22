"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[#D4AF37] py-3.5 text-sm font-bold text-[#0B132B] shadow-lg shadow-[#D4AF37]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#D4AF37]/25 transition-all disabled:opacity-70 disabled:translate-y-0 flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit Nomination"
        )}
      </button>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="text-center px-6">
            <Loader2 size={40} className="animate-spin mx-auto text-amber-500" />
            <p className="mt-4 text-base font-bold text-slate-800">Submitting your nomination…</p>
            <p className="mt-1.5 text-sm text-slate-500">
              Uploading photo — this can take a moment on slower connections. Please don't close this page.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
