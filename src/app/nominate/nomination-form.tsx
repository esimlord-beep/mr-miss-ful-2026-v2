"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { submitNominations } from "./actions";

type Category = { id: string; name: string };
type GroupedCategories = Record<string, Category[]>;

type DraftEntry = {
  key: string;
  group: string;
  categoryId: string;
  nomineeName: string;
  photo: File | null;
  photoPreview: string | null;
};

function newEntry(): DraftEntry {
  return {
    key: Math.random().toString(36).slice(2),
    group: "",
    categoryId: "",
    nomineeName: "",
    photo: null,
    photoPreview: null,
  };
}

async function compressImageFile(file: File, maxDimension = 1280, quality = 0.75): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}

export function NominationForm({ groupedCategories }: { groupedCategories: GroupedCategories }) {
  const groupNames = Object.keys(groupedCategories);

  const [entries, setEntries] = useState<DraftEntry[]>([newEntry()]);
  const [nominatorName, setNominatorName] = useState("");
  const [nominatorContact, setNominatorContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string; count?: number } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updateEntry = (key: string, patch: Partial<DraftEntry>) => {
    setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, ...patch } : e)));
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, newEntry()]);
  };

  const removeEntry = (key: string) => {
    setEntries((prev) => (prev.length > 1 ? prev.filter((e) => e.key !== key) : prev));
  };

  const handlePhotoChange = async (key: string, file: File | null) => {
    if (!file) {
      updateEntry(key, { photo: null, photoPreview: null });
      return;
    }
    const preview = URL.createObjectURL(file);
    updateEntry(key, { photo: file, photoPreview: preview });
    const compressed = await compressImageFile(file);
    updateEntry(key, { photo: compressed });
  };

  const isValid = entries.every((e) => e.categoryId && e.nomineeName.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setResult({ success: false, error: "Please complete every nomination — group, category, and nominee name are all required." });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.set("nominator_name", nominatorName);
      formData.set("nominator_contact", nominatorContact);
      formData.set(
        "entries",
        JSON.stringify(entries.map((e) => ({ categoryId: e.categoryId, nomineeName: e.nomineeName })))
      );
      entries.forEach((e, i) => {
        if (e.photo) formData.set(`photo_${i}`, e.photo);
      });

      const res = await submitNominations(formData);
      setResult(res);

      if (res.success) {
        setEntries([newEntry()]);
        setNominatorName("");
        setNominatorContact("");
      }
    } catch (err) {
      setResult({ success: false, error: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
        <div className="text-center px-6">
          <Loader2 size={40} className="animate-spin mx-auto text-amber-500" />
          <p className="mt-4 text-base font-bold text-slate-800">Submitting your nomination…</p>
          <p className="mt-1.5 text-sm text-slate-500">Uploading photo — this can take a moment on slower connections. Please don't close this page.</p>
        </div>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 p-8 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500" size={48} strokeWidth={1.5} />
        <h2 className="mt-4 text-xl font-bold text-slate-800">
          {result.count === 1 ? "Nomination submitted!" : `${result.count} nominations submitted!`}
        </h2>
        <p className="mt-2 text-sm text-slate-500">Thank you — your nominations are being reviewed.</p>
        <button
          onClick={() => setResult(null)}
          className="mt-6 rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-white hover:bg-amber-600 transition-colors"
        >
          Submit more nominations
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {entries.map((entry, idx) => (
        <div
          key={entry.key}
          className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-amber-600 tracking-wider uppercase">
              Nomination {idx + 1}
            </p>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(entry.key)}
                className="text-slate-300 hover:text-red-500 transition-colors"
                aria-label="Remove this nomination"
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category Group</label>
            <select
              required
              value={entry.group}
              onChange={(e) => updateEntry(entry.key, { group: e.target.value, categoryId: "" })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none bg-white"
            >
              <option value="" disabled>
                Select a group…
              </option>
              {groupNames.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {entry.group && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                required
                value={entry.categoryId}
                onChange={(e) => updateEntry(entry.key, { categoryId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none bg-white"
              >
                <option value="" disabled>
                  Select a category…
                </option>
                {(groupedCategories[entry.group] || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nominee's Full Name</label>
            <input
              type="text"
              required
              placeholder="Jane Doe"
              value={entry.nomineeName}
              onChange={(e) => updateEntry(entry.key, { nomineeName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nominee's Photo (optional)</label>
            <input
              ref={(el) => { fileInputRefs.current[entry.key] = el; }}
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoChange(entry.key, e.target.files?.[0] ?? null)}
              className="w-full text-sm text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-amber-50 file:px-4 file:py-2 file:text-xs file:font-bold file:text-amber-700 hover:file:bg-amber-100"
            />
            {entry.photoPreview && (
              <img
                src={entry.photoPreview}
                alt="Preview"
                className="mt-3 h-24 w-24 rounded-xl object-cover border border-slate-100"
              />
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-4 text-sm font-bold text-slate-500 hover:border-amber-300 hover:text-amber-600 transition-colors"
      >
        <Plus size={17} strokeWidth={2.5} />
        Add another nomination
      </button>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 p-6 space-y-4">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your details (optional)</p>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={nominatorName}
            onChange={(e) => setNominatorName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Your Email / Phone</label>
          <input
            type="text"
            placeholder="In case we need to reach you"
            value={nominatorContact}
            onChange={(e) => setNominatorContact(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {result?.error && (
        <p className="text-sm text-red-600 font-medium text-center bg-red-50 rounded-xl py-3 px-4">
          {result.error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !isValid}
        className="w-full rounded-xl bg-amber-500 py-4 text-sm font-bold text-white shadow-md shadow-amber-500/10 transition-colors hover:bg-amber-600 disabled:bg-slate-300 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting…
          </>
        ) : (
          `Submit ${entries.length > 1 ? `${entries.length} Nominations` : "Nomination"}`
        )}
      </button>
    </form>
  );
}
