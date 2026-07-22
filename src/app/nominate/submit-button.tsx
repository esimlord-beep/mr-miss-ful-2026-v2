"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
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
  );
}
