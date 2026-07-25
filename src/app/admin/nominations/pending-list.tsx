"use client";

import { useMemo, useState } from "react";

type Nomination = {
  id: string;
  nominee_name: string;
  category_id: string;
  photo_url: string | null;
  nominator_name: string;
  nominator_email: string;
  nominator_phone: string | null;
  created_at: string;
  award_categories?: { name: string; group_name: string | null } | null;
};

export function PendingNominationsList({
  pending,
  bulkApproveAction,
  rejectAction,
}: {
  pending: Nomination[];
  bulkApproveAction: (formData: FormData) => void;
  rejectAction: (formData: FormData) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, Nomination[]>();
    for (const nom of pending) {
      const key = `${nom.category_id}::${nom.nominee_name.trim().toLowerCase()}`;
      const list = map.get(key) ?? [];
      list.push(nom);
      map.set(key, list);
    }
    return Array.from(map.values());
  }, [pending]);

  const initialSelected = useMemo(() => {
    const set = new Set<string>();
    for (const group of groups) {
      if (group.length > 0) set.add(group[0].id);
    }
    return set;
  }, [groups]);

  const [selected, setSelected] = useState<Set<string>>(initialSelected);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(pending.map(n => n.id)));
  }

  function selectNone() {
    setSelected(new Set());
  }

  if (pending.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 font-medium text-sm">No pending nominations right now.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50">
        <p className="text-xs font-semibold text-slate-500">
          {selected.size} of {pending.length} selected
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={selectAll} className="text-xs font-black text-blue-700 hover:underline">
            Select all
          </button>
          <button type="button" onClick={selectNone} className="text-xs font-black text-slate-500 hover:underline">
            Select none
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {groups.map(group => {
          const isDuplicateGroup = group.length > 1;
          return (
            <div key={group[0].id} className={isDuplicateGroup ? "bg-amber-50/40" : ""}>
              {group.map((nom, idx) => (
                <div
                  key={nom.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selected.has(nom.id)}
                      onChange={() => toggle(nom.id)}
                      className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500 shrink-0"
                    />
                    {nom.photo_url ? (
                      <img src={nom.photo_url} alt={nom.nominee_name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs shrink-0">
                        No photo
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1.5">
                        {nom.award_categories?.group_name ? `${nom.award_categories.group_name} · ` : ""}
                        {nom.award_categories?.name ?? "Unknown category"}
                        {isDuplicateGroup && (
                          <span className="inline-flex items-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] text-white">
                            ×{group.length} {idx === 0 ? "— keeping this one" : "duplicate"}
                          </span>
                        )}
                      </p>
                      <p className="font-black text-slate-900">{nom.nominee_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Nominated by {nom.nominator_name} · {nom.nominator_email}
                        {nom.nominator_phone ? ` · ${nom.nominator_phone}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={rejectAction}>
                      <input type="hidden" name="id" value={nom.id} />
                      <button type="submit" className="rounded-full border border-red-200 px-4 py-2 text-xs font-black text-red-600 hover:bg-red-50">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <form action={bulkApproveAction} className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
        {Array.from(selected).map(id => (
          <input key={id} type="hidden" name="selected_ids" value={id} />
        ))}
        <button
          type="submit"
          disabled={selected.size === 0}
          className="rounded-full bg-green-600 px-6 py-3 text-sm font-black text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Approve Selected ({selected.size})
        </button>
      </form>
    </div>
  );
}
