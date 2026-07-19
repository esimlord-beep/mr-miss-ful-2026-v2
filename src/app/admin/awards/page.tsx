import { adminSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

async function getAwardCategories() {
 if (!adminSupabase) return [];
 const { data } = await adminSupabase
   .from("award_categories")
   .select("*, award_nominees(*)")
   .order("category_number", { ascending: true });

 // Ensure nominees within each category are ordered by their number
 for (const cat of data || []) {
   if (cat.award_nominees) {
     cat.award_nominees.sort((a: any, b: any) => (a.nominee_number ?? 0) - (b.nominee_number ?? 0));
   }
 }
 return data || [];
}

async function addCategory(formData: FormData) {
 "use server";
 if (!adminSupabase) return;
 const name = String(formData.get("name") ?? "").trim();
 const description = String(formData.get("description") ?? "").trim();
 const group_name = String(formData.get("group_name") ?? "General").trim() || "General";
 const vote_price = Number(formData.get("vote_price") ?? 100);
 const minimum_votes = Number(formData.get("minimum_votes") ?? 250);
 if (!name) return;

 const { data: existing } = await adminSupabase
   .from("award_categories")
   .select("category_number")
   .order("category_number", { ascending: false })
   .limit(1);

 const nextNumber = existing && existing.length > 0 && existing[0].category_number
   ? existing[0].category_number + 1
   : 1;

 await adminSupabase.from("award_categories").insert({ name, description, vote_price, minimum_votes, group_name, category_number: nextNumber });
 revalidatePath("/admin/awards");
}

async function deleteCategory(formData: FormData) {
 "use server";
 if (!adminSupabase) return;
 const id = String(formData.get("id"));
 await adminSupabase.from("award_categories").delete().eq("id", id);
 revalidatePath("/admin/awards");
}

async function addNominee(formData: FormData) {
 "use server";
 if (!adminSupabase) return;
 const category_id = String(formData.get("category_id"));
 const name = String(formData.get("name") ?? "").trim();
 const photo = formData.get("photo") as File | null;
 if (!name || !category_id) return;
 let photo_url = null;
 if (photo && photo.size > 0) {
   const ext = photo.name.split(".").pop();
   const filename = `${Date.now()}-nominee.${ext}`;
   const { data } = await adminSupabase.storage
     .from("contestants")
     .upload(filename, photo, { upsert: true });
   if (data) {
     const { data: urlData } = adminSupabase.storage.from("contestants").getPublicUrl(filename);
     photo_url = urlData.publicUrl;
   }
 }
 const { data: existing } = await adminSupabase
   .from("award_nominees")
   .select("nominee_number")
   .eq("category_id", category_id)
   .order("nominee_number", { ascending: false })
   .limit(1);

 const nextNumber = existing && existing.length > 0 && existing[0].nominee_number
   ? existing[0].nominee_number + 1
   : 1;

 await adminSupabase.from("award_nominees").insert({ category_id, name, photo_url, nominee_number: nextNumber });
 revalidatePath("/admin/awards");
}

async function deleteNominee(formData: FormData) {
 "use server";
 if (!adminSupabase) return;
 const id = String(formData.get("id"));
 await adminSupabase.from("award_nominees").delete().eq("id", id);
 revalidatePath("/admin/awards");
}

export default async function AwardsAdminPage() {
 const categories = await getAwardCategories();

 return (
   <main className="min-h-screen bg-slate-50 p-4">
     <div className="max-w-4xl mx-auto space-y-8">
       
       <div className="flex items-center justify-between">
         <div>
           <p className="text-xs font-black uppercase tracking-widest text-amber-600">Admin Panel</p>
           <h1 className="text-2xl font-black text-slate-900">Awards Management</h1>
         </div>
         <a href="/admin" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50">
           ← Back to Admin
         </a>
       </div>

       <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
         <h2 className="text-lg font-black text-slate-900 mb-4">Add Award Category</h2>
         <form action={addCategory} className="space-y-4">
           <div>
             <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Category Name</label>
             <input name="name" required placeholder="e.g. Best Dressed Male" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-amber-500" />
           </div>
           <div>
             <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Group Name</label>
             <input name="group_name" placeholder="e.g. Executive / Faculty Leadership" defaultValue="General" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-amber-500" />
           </div>
           <div>
             <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Description (optional)</label>
             <input name="description" placeholder="Brief description" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-amber-500" />
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Vote Price (₦)</label>
               <input name="vote_price" type="number" defaultValue={100} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-amber-500" />
             </div>
             <div>
               <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Minimum Votes</label>
               <input name="minimum_votes" type="number" defaultValue={250} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-amber-500" />
             </div>
           </div>
           <button type="submit" className="w-full rounded-xl bg-amber-500 py-3 text-sm font-black text-white hover:bg-amber-600">
             Add Category
           </button>
         </form>
       </div>

       {categories.length === 0 ? (
         <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
           <p className="text-slate-400 font-medium">No categories yet. Add one above!</p>
         </div>
       ) : (
         categories.map((category: any) => (
           <div key={category.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">{category.group_name || "General"}</p>
                 <h3 className="font-black text-white">#{category.category_number ?? "—"} · {category.name}</h3>
                 <p className="text-xs text-slate-400 mt-0.5">₦{category.vote_price}/vote · Min {category.minimum_votes} votes</p>
               </div>
               <form action={deleteCategory}>
                 <input type="hidden" name="id" value={category.id} />
                 <button type="submit" className="text-xs font-bold text-red-400 hover:text-red-300">Delete</button>
               </form>
             </div>

             <div className="p-4 border-b border-slate-100">
               <form action={addNominee} encType="multipart/form-data" className="flex gap-3 items-end flex-wrap">
                 <input type="hidden" name="category_id" value={category.id} />
                 <div className="flex-1 min-w-[150px]">
                   <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Add Nominee</label>
                   <input name="name" required placeholder="Full name" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-amber-500" />
                 </div>
                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Photo</label>
                   <input name="photo" type="file" accept="image/*" className="text-xs" />
                 </div>
                 <button type="submit" className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-black text-white hover:bg-amber-600 whitespace-nowrap">
                   Add
                 </button>
               </form>
             </div>

             <div className="p-4 space-y-2">
               {!category.award_nominees || category.award_nominees.length === 0 ? (
                 <p className="text-xs text-slate-400 text-center py-4">No nominees yet</p>
               ) : (
                 category.award_nominees.map((nominee: any) => (
                   <div key={nominee.id} className="flex items-center justify-between py-2 border-b border-slate-50">
                     <div className="flex items-center gap-3">
                       {nominee.photo_url && (
                         <img src={nominee.photo_url} alt={nominee.name} className="w-8 h-8 rounded-full object-cover" />
                       )}
                       <div>
                         <p className="font-bold text-sm text-slate-900">#{nominee.nominee_number ?? "—"} · {nominee.name}</p>
                         <p className="text-xs text-slate-400">{nominee.votes || 0} votes</p>
                         </div>
                     </div>
                     <form action={deleteNominee}>
                       <input type="hidden" name="id" value={nominee.id} />
                       <button type="submit" className="text-xs font-bold text-red-400 hover:text-red-300">Remove</button>
                     </form>
                   </div>
                 ))
               )}
             </div>
           </div>
         ))
       )}
     </div>
   </main>
 );
}
