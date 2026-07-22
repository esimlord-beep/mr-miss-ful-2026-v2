import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms, Privacy & Refund Policy — Mr & Miss FUL 2026",
  description: "Terms of use, privacy policy, and refund policy for the Mr & Miss FUL 2026 voting portal.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F6]">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF9F6] via-[#FAF9F6] to-[#F5F3EE] pt-16 pb-14 px-6 text-center">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[380px] w-[380px] rounded-full bg-[#D4AF37]/[0.10] blur-3xl" />
        <div className="relative">
          <p className="font-rounded text-[11px] sm:text-xs font-bold tracking-[0.14em] text-[#0B132B]/40 uppercase">
            Mr &amp; Miss FUL 2026
          </p>
          <h1 className="mt-2 font-rounded text-[1.75rem] sm:text-[2.25rem] font-extrabold tracking-tight text-[#0B132B]">
            Terms, Privacy &amp; Refund Policy
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">

        <section className="bg-white rounded-2xl border border-[#0B132B]/[0.08] p-6 sm:p-7 shadow-sm shadow-[#0B132B]/[0.04]">
          <h2 className="font-rounded text-lg font-bold text-[#0B132B] mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
            Terms of Use
          </h2>
          <div className="space-y-3 text-[14px] text-[#0B132B]/60 font-medium leading-relaxed">
            <p>By accessing and voting on this website, you agree to use this platform solely for casting genuine votes for contestants and award nominees in the Mr & Miss FUL 2026 event.</p>
            <p>Votes are purchased via secure third-party payment processing (Paystack or Flutterwave). Once a payment is successfully processed, votes are added to the relevant contestant or nominee's total and recorded as final.</p>
            <p>Any attempt to manipulate vote counts through fraudulent payments, automated scripts, or other dishonest means is strictly prohibited and may result in votes being voided.</p>
            <p>We reserve the right to update voting rules, pricing, or close voting at any time, with reasonable notice provided on the site where possible.</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#0B132B]/[0.08] p-6 sm:p-7 shadow-sm shadow-[#0B132B]/[0.04]">
          <h2 className="font-rounded text-lg font-bold text-[#0B132B] mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
            Privacy Policy
          </h2>
          <div className="space-y-3 text-[14px] text-[#0B132B]/60 font-medium leading-relaxed">
            <p>When you vote, we collect your full name, email address, and phone number. This information is used solely to process your payment, send transaction receipts, and resolve any payment disputes.</p>
            <p>We do not sell, rent, or share your personal information with third parties, except as necessary to process payments through our payment processors, Paystack and Flutterwave.</p>
            <p>Payment card details are never stored on our servers — all payment processing is handled securely by Paystack and Flutterwave in compliance with PCI-DSS standards.</p>
            <p>If you have questions about how your data is used, please reach out via the contact details on our Support page.</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#0B132B]/[0.08] p-6 sm:p-7 shadow-sm shadow-[#0B132B]/[0.04]">
          <h2 className="font-rounded text-lg font-bold text-[#0B132B] mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
            Refund Policy
          </h2>
          <div className="space-y-3 text-[14px] text-[#0B132B]/60 font-medium leading-relaxed">
            <p><strong className="text-[#0B132B]">All votes purchased are final and non-refundable.</strong> Once a payment is successfully processed and votes are credited to a contestant or nominee, the transaction cannot be reversed, exchanged, or refunded for any reason — including a change of mind, voting for the "wrong" contestant, or the outcome of the event.</p>
            <p>If you were charged but did not receive your votes due to a technical error, please contact our support team immediately with your payment reference, and we will investigate and credit your votes accordingly.</p>
          </div>
        </section>

        <p className="text-center text-[12px] text-[#0B132B]/35 font-semibold uppercase tracking-[0.08em]">Last updated: June 2026</p>
      </div>
    </main>
  );
}
