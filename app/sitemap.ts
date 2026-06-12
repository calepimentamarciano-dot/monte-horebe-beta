import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { siteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getProducts();

  return [
    "",
    "/catalogo",
    "/sobre",
    "/contato",
    ...products.map((product) => `/produto/${product.slug}`)
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date()
  }));
}
