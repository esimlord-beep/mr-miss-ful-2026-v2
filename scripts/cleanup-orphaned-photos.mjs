/**
 * cleanup-orphaned-photos.mjs
 *
 * Finds and deletes files in the "contestants" Supabase Storage bucket that
 * are NOT referenced by any row in the database. Safe by default: runs in
 * DRY RUN mode unless you pass --confirm.
 *
 * Usage:
 *   node scripts/cleanup-orphaned-photos.mjs            (dry run — lists only, deletes nothing)
 *   node scripts/cleanup-orphaned-photos.mjs --confirm   (actually deletes orphaned files)
 *
 * Requires these env vars to be set (same ones your app already uses):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

const BUCKET = "contestants";
const CONFIRM = process.argv.includes("--confirm");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Pulls every photo_url-ish column across every table that can reference
// a file in the "contestants" bucket. Anything not in this set is orphaned.
async function getReferencedPaths() {
  const referenced = new Set();

  const addUrl = (url) => {
    if (!url || typeof url !== "string") return;
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = decodeURIComponent(url.slice(idx + marker.length));
    if (path) referenced.add(path);
  };

  // 1. Contestants
  const { data: contestants, error: e1 } = await supabase
    .from("contestants")
    .select("photo_url");
  if (e1) throw new Error(`Failed to read contestants: ${e1.message}`);
  contestants?.forEach((c) => addUrl(c.photo_url));

  // 2. Settings (primary_logo, secondary_logo)
  const { data: settings, error: e2 } = await supabase
    .from("settings")
    .select("primary_logo, secondary_logo");
  if (e2) throw new Error(`Failed to read settings: ${e2.message}`);
  settings?.forEach((s) => {
    addUrl(s.primary_logo);
    addUrl(s.secondary_logo);
  });

  // 3. Award nominees (approved, live on the awards page)
  const { data: nominees, error: e3 } = await supabase
    .from("award_nominees")
    .select("photo_url");
  if (e3) throw new Error(`Failed to read award_nominees: ${e3.message}`);
  nominees?.forEach((n) => addUrl(n.photo_url));

  // 4. Nomination submissions that are still PENDING (not yet approved/rejected)
  //    — these still need their photo until an admin reviews them.
  const { data: pendingNoms, error: e4 } = await supabase
    .from("nomination_submissions")
    .select("photo_url")
    .eq("status", "pending");
  if (e4) throw new Error(`Failed to read nomination_submissions: ${e4.message}`);
  pendingNoms?.forEach((n) => addUrl(n.photo_url));

  return referenced;
}

// Lists every file currently in the bucket (paginated, since Supabase
// storage.list() caps out at 100 per call by default).
async function getAllStorageFiles() {
  const allFiles = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list("", {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(`Failed to list storage: ${error.message}`);
    if (!data || data.length === 0) break;

    allFiles.push(...data.filter((f) => f.id !== null)); // skip folder placeholders
    if (data.length < limit) break;
    offset += limit;
  }

  return allFiles;
}

async function main() {
  console.log(`\nMode: ${CONFIRM ? "LIVE DELETE" : "DRY RUN (nothing will be deleted)"}\n`);

  console.log("Fetching referenced photo paths from database...");
  const referenced = await getReferencedPaths();
  console.log(`Found ${referenced.size} referenced files.\n`);

  console.log("Listing all files in storage bucket...");
  const allFiles = await getAllStorageFiles();
  console.log(`Found ${allFiles.length} total files in storage.\n`);

  const orphaned = allFiles.filter((f) => !referenced.has(f.name));
  const orphanedSizeMb = orphaned.reduce((sum, f) => sum + (f.metadata?.size || 0), 0) / (1024 * 1024);

  console.log(`Orphaned files: ${orphaned.length}`);
  console.log(`Space to reclaim: ${orphanedSizeMb.toFixed(2)} MB\n`);

  if (orphaned.length === 0) {
    console.log("Nothing to clean up. Bucket is already tidy.");
    return;
  }

  // Show a preview
  console.log("Preview of first 20 orphaned files:");
  orphaned.slice(0, 20).forEach((f) => console.log(`  - ${f.name}`));
  if (orphaned.length > 20) console.log(`  ...and ${orphaned.length - 20} more`);
  console.log("");

  if (!CONFIRM) {
    console.log("This was a DRY RUN — no files were deleted.");
    console.log("Review the list above, then re-run with --confirm to actually delete them:\n");
    console.log("  node scripts/cleanup-orphaned-photos.mjs --confirm\n");
    return;
  }

  console.log("Deleting orphaned files...");
  const paths = orphaned.map((f) => f.name);

  // Supabase remove() accepts up to ~1000 paths per call safely; batch to be sure.
  const BATCH_SIZE = 500;
  let deletedCount = 0;
  for (let i = 0; i < paths.length; i += BATCH_SIZE) {
    const batch = paths.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.storage.from(BUCKET).remove(batch);
    if (error) {
      console.error(`Failed to delete batch starting at index ${i}: ${error.message}`);
      continue;
    }
    deletedCount += batch.length;
    console.log(`Deleted ${deletedCount}/${paths.length}...`);
  }

  console.log(`\nDone. Deleted ${deletedCount} orphaned files, reclaiming ~${orphanedSizeMb.toFixed(2)} MB.`);
}

main().catch((err) => {
  console.error("\nScript failed:", err.message);
  process.exit(1);
});
