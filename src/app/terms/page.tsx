import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms, Privacy & Refund Policy — Mr & Miss FUL 2026",
  description: "Terms of use, privacy policy, and refund policy for the Mr & Miss FUL 2026 voting portal.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white py-12 px-4 text-center">
        <p className="text-amber-400 text-xs font-black uppercase tracking-widest mb-2">Mr & Miss FUL 2026</p>
        <h1 className="text-3xl font-black">Terms, Privacy & Refund Policy</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">

        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-3">Terms of Use</h2>
          <div className="space-y-3 text-sm text-slate-600 font-medium leading-relaxed">
            <p>By accessing and voting on this website, you agree to use this platform solely for casting genuine votes for contestants and award nominees in the Mr & Miss FUL 2026 event.</p>
            <p>Votes are purchased via secure third-party payment processing (Paystack or Flutterwave). Once a payment is successfully processed, votes are added to the relevant contestant or nominee's total and recorded as final.</p>
            <p>Any attempt to manipulate vote counts through fraudulent payments, automated scripts, or other dishonest means is strictly prohibited and may result in votes being voided.</p>
            <p>We reserve the right to update voting rules, pricing, or close voting at any time, with reasonable notice provided on the site where possible.</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-3">Privacy Policy</h2>
          <div className="space-y-3 text-sm text-slate-600 font-medium leading-relaxed">
            <p>When you vote, we collect your full name, email address, and phone number. This information is used solely to process your payment, send transaction receipts, and resolve any payment disputes.</p>
            <p>We do not sell, rent, or share your personal information with third parties, except as necessary to process payments through our payment processors, Paystack and Flutterwave.</p>
            <p>Payment card details are never stored on our servers — all payment processing is handled securely by Paystack and Flutterwave in compliance with PCI-DSS standards.</p>
            <p>If you have questions about how your data is used, please reach out via the contact details on our Support page.</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-3">Refund Policy</h2>
          <div className="space-y-3 text-sm text-slate-600 font-medium leading-relaxed">
            <p><strong className="text-slate-900">All votes purchased are final and non-refundable.</strong> Once a payment is successfully processed and votes are credited to a contestant or nominee, the transaction cannot be reversed, exchanged, or refunded for any reason — including a change of mind, voting for the "wrong" contestant, or the outcome of the event.</p>
            <p>If you were charged but did not receive your votes due to a technical error, please contact our support team immediately with your payment reference, and we will investigate and credit your votes accordingly.</p>
          </div>
        </section>

        <p className="text-center text-xs text-slate-400 font-semibold">Last updated: June 2026</p>
      </div>
    </main>
  );
}
