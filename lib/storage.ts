import { slugify } from "@/lib/slugify";
import { createClient } from "@/lib/supabase/server";

export async function uploadProductImage(file: File) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const extension = file.name.split(".").pop();
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const path = `${Date.now()}-${slugify(baseName)}${extension ? `.${extension}` : ""}`;

  const { error } = await supabase.storage.from("products").upload(path, file, {
    cacheControl: "3600",
    upsert: true
  });

  if (error) {
    throw new Error(error.message);
  }

  return supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
}
