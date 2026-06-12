"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { fadeUp, MotionWrapper, staggerContainer } from "@/components/motion-wrapper";
import type { Category, Product } from "@/lib/types";

type CatalogClientProps = {
  products: Product[];
  categories: Category[];
};

export function CatalogClient({ products, categories }: CatalogClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todos");
  const [roast, setRoast] = useState("todos");
  const [note, setNote] = useState("todos");

  const roastOptions = useMemo(
    () => Array.from(new Set(products.map((product) => product.roast_level).filter(Boolean))),
    [products]
  );

  const noteOptions = useMemo(
    () =>
      Array.from(new Set(products.flatMap((product) => product.sensory_notes ?? []))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const categorySlug = product.category?.slug ?? product.category_id;
      const productNotes = product.sensory_notes ?? [];
      const searchable = [
        product.name,
        product.short_description,
        product.description,
        product.roast_level,
        ...productNotes
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!term || searchable.includes(term)) &&
        (category === "todos" || categorySlug === category) &&
        (roast === "todos" || product.roast_level === roast) &&
        (note === "todos" || productNotes.includes(note))
      );
    });
  }, [category, note, products, roast, search]);

  return (
    <div id="produtos">
      <div className="glass-panel grid gap-4 rounded-[1.5rem] p-4 md:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
        <label className="relative block">
          <span className="sr-only">Buscar produto</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-horebe-gray" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, nota ou torra"
            className="focus-ring h-12 w-full rounded-full border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-horebe-soft placeholder:text-horebe-gray"
          />
        </label>

        <FilterSelect label="Categoria" value={category} onChange={setCategory}>
          <option value="todos">Todas categorias</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label="Torra" value={roast} onChange={setRoast}>
          <option value="todos">Todas torras</option>
          {roastOptions.map((item) => (
            <option key={item} value={item ?? ""}>
              {item}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label="Notas" value={note} onChange={setNote}>
          <option value="todos">Todas notas</option>
          {noteOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </FilterSelect>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-horebe-gray">
        <SlidersHorizontal className="h-4 w-4 text-horebe-gold" aria-hidden />
        {filteredProducts.length} produto{filteredProducts.length === 1 ? "" : "s"} encontrado
        {filteredProducts.length === 1 ? "" : "s"}
      </div>

      <MotionWrapper
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </MotionWrapper>

      {!filteredProducts.length ? (
        <MotionWrapper variants={fadeUp} initial="hidden" animate="visible" className="mt-16 text-center">
          <p className="font-display text-3xl text-horebe-soft">Nenhum café encontrado.</p>
          <p className="mt-3 text-horebe-gray">Ajuste os filtros para visualizar outros produtos.</p>
        </MotionWrapper>
      ) : null}
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
};

function FilterSelect({ label, value, onChange, children }: FilterSelectProps) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring h-12 w-full rounded-full border border-white/10 bg-black/30 px-4 text-sm text-horebe-soft"
      >
        {children}
      </select>
    </label>
  );
}
