"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "@/lib/supabase";

export default function AwardsPage() {
 const [categories, setCategories] = useState<any[]>([]);
 const [nominees, setNominees] = useState<Record<string, any[]>>({});
 const [settings, setSettings] = useState<any>({});
 const [loading, setLoading] = useState(true);
 const [votingFor, setVotingFor] = useState<any | null>(null);
 const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
 const [payerName, setPayerName] = useState("");
 const [payerEmail, setPayerEmail] = useState("");
 const [payerPhone, setPayerPhone] = useState("");
 const [voteQuantity, setVoteQuantity] = useState(1);
 const [processing, setProcessing] = useState(false);

 useEffect(() => {
   async function loadData() {
     if (!browserSupabase) return;

     const { data: settingsData } = await browserSupabase
       .from("settings")
       .select("awards_title, awards_description, voting_status")
       .maybeSingle();
     if (settingsData) setSettings(settingsData);

     const { data: cats } = await browserSupabase
       .from("award_categories")
       .select("*")
       .eq("is_active", true)
       .order("created_at");

     if (cats) {
       setCategories(cats);
       const nomineeMap: Record<string, any[]> = {};
       for (const cat of cats) {
         const { data: noms } = await browserSupabase
           .from("award_nominees")
           .select("*")
           .eq("category_id", cat.id)
           .order("votes", { ascending: false });
         nomineeMap[cat.id] = noms || [];
       }
       setNominees(nomineeMap);
     }
     setLoading(false);
   }
   loadData();
 }, []);

 const votingClosed = settings?.voting_status === "closed";

 const openVoteModal = (nominee: any, category: any) => {
   if (votingClosed) return;
   setVotingFor(nominee);
   setSelectedCategory(category);
   setVoteQuantity(1);
 };

 const closeModal = () => {
   setVotingFor(null);
   setSelectedCategory(null);
   setPayerName("");
   setPayerEmail("");
   setPayerPhone("");
 };

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!votingFor || !selectedCategory) return;
   setProcessing(true);
   try {
     const res = await fetch("/api/awards/initialize", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         nomineeId: votingFor.id,
         categoryId: selectedCategory.id,
         payerName,
         payerEmail,
         payerPhone,
         voteQuantity
       })
     });
     const data = await res.json();
     if (data?.authorization_url) {
       window.location.href = data.authorization_url;
     } else {
       alert(data?.error || "Failed to initialize payment.");
     }
   } catch {
     alert("Something went wrong.");
   } finally {
     setProcessing(false);
   }
 };

 if (loading) {
   return (
     <div className="min-h-screen bg-slate-900 flex items-center justify-center">
       <div className="text-center space-y-4">
         <h1 className="text-3xl font-black text-white">FUL Awards 2026</h1>
         <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest">Loading categories...</p>
         <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
       </div>
     </div>
   );
 }

 return (
   <div className="min-h-screen bg-slate-50">
     <div className="bg-slate-900 text-white py-12 px-4 text-center">
       <p className="text-amber-400 text-xs font-black uppercase tracking-widest mb-2">Federal University Lokoja SUG</p>
       <h1 className="text-4xl font-black">{settings.awards_title || "FUL Awards 2026"}</h1>
       <p className="text-slate-300 mt-3 text-sm max-w-md mx-auto">{settings.awards_description || "Vote for your favorites across all categories. Minimum 250 votes required for each award to be presented."}</p>
     </div>

     {votingClosed && (
       <div className="bg-red-50 border-b border-red-200 py-3 text-center">
         <p className="text-sm font-bold text-red-600">🔒 Voting is currently closed.</p>
       </div>
     )}

     <main className="max-w-5xl mx-auto px-4 py-12 space-y-16">
       {categories.length === 0 ? (
         <div className="text-center py-20">
           <p className="text-slate-500 font-medium text-lg">Award categories coming soon! 👑</p>
         </div>
       ) : (
         categories.map((category) => {
           const noms = nominees[category.id] || [];
           const totalVotes = noms.reduce((sum, n) => sum + (n.votes || 0), 0);
           const minReached = totalVotes >= category.minimum_votes;

           return (
             <div key={category.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
               <div className="bg-slate-900 px-6 py-5">
                 <h2 className="text-xl font-black text-white">{category.name}</h2>
                 {category.description && <p className="text-slate-400 text-sm mt-1">{category.description}</p>}
                 <div className="mt-3 flex items-center gap-3 flex-wrap">
                   <span className="text-xs font-bold text-amber-400">₦{category.vote_price} per vote</span>
                   <span className={`text-xs font-bold px-2 py-1 rounded-full ${minReached ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                     {minReached ? "✅ Minimum reached!" : `${totalVotes}/${category.minimum_votes} votes`}
                   </span>
                   {minReached && (
                     <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                       🗳️ {totalVotes} votes
                     </span>
                   )}
                 </div>
                 {!minReached && (
                   <div className="mt-2 w-full bg-slate-700 rounded-full h-1.5">
                     <div
                       className="bg-amber-400 h-1.5 rounded-full transition-all"
                       style={{ width: `${Math.min((totalVotes / category.minimum_votes) * 100, 100)}%` }}
                     />
                   </div>
                 )}
               </div>

               {noms.length === 0 ? (
                 <div className="p-8 text-center text-slate-400 font-medium">Nominees coming soon!</div>
               ) : (
                 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6">
                   {noms.map((nominee) => (
                     <div key={nominee.id} className="rounded-2xl border border-slate-100 overflow-hidden hover:-translate-y-1 transition-all">
                       {nominee.photo_url ? (
                         <img src={nominee.photo_url} alt={nominee.name} className="w-full h-40 object-cover" />
                       ) : (
                         <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400 font-medium">No Photo</div>
                       )}
                       <div className="p-4">
                         <p className="font-bold text-slate-900">{nominee.name}</p>
                         <p className="text-xs text-slate-400 mt-0.5">🗳️ {nominee.votes || 0} votes</p>
                         <button
                           onClick={() => openVoteModal(nominee, category)}
                           disabled={votingClosed}
                           className={`mt-3 w-full rounded-xl py-2 text-xs font-bold text-white transition-colors ${
                             votingClosed
                               ? "bg-slate-300 cursor-not-allowed"
                               : "bg-amber-500 hover:bg-amber-600 cursor-pointer"
                           }`}
                         >
                           {votingClosed ? "Voting Closed" : `Vote — ₦${category.vote_price}`}
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           );
         })
       )}
     </main>

     {votingFor && selectedCategory && (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
         <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
           <div className="bg-amber-500 px-6 py-4 text-white flex justify-between items-center">
             <h3 className="font-bold text-lg">Cast Your Vote</h3>
             <button onClick={closeModal} className="text-white bg-amber-600/50 w-7 h-7 rounded-full flex items-center justify-center font-bold">✕</button>
           </div>
           <form onSubmit={handleSubmit} className="p-6 space-y-4">
             <div>
               <p className="text-xs text-slate-400 uppercase tracking-wider">Voting For</p>
               <p className="font-bold text-slate-800">{votingFor.name}</p>
               <p className="text-xs text-amber-600 font-semibold">{selectedCategory.name}</p>
             </div>
             <hr className="border-slate-100" />
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
               <input type="text" required placeholder="John Doe" value={payerName} onChange={(e) => setPayerName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
               <input type="email" required placeholder="johndoe@gmail.com" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
               <input type="tel" required placeholder="08012345678" value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-2">Number of Votes</label>
               <div className="flex items-center space-x-4">
                 <button type="button" onClick={() => setVoteQuantity(Math.max(1, voteQuantity - 1))} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold">-</button>
                 <span className="text-base font-black text-slate-800 w-8 text-center">{voteQuantity}</span>
                 <button type="button" onClick={() => setVoteQuantity(Math.min(1000, voteQuantity + 1))} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold">+</button>
               </div>
               <p className="text-xs text-slate-400 mt-1">Total: ₦{voteQuantity * selectedCategory.vote_price}</p>
             </div>
             <button type="submit" disabled={processing} className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:bg-slate-300">
               {processing ? "Processing..." : "Proceed to Pay"}
             </button>
           </form>
         </div>
       </div>
     )}

     <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs font-semibold text-slate-400">
       Copyright ©️ 2026 Mr & Miss FUL 2026
     </footer>
   </div>
 );
}
