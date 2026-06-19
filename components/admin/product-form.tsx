"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useActionState, useState } from "react";
import { saveProductAction, type ProductActionState } from "@/app/admin/produtos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_IMAGE_ACCEPT, validateProductImageFile } from "@/lib/product-image-validation";
import { slugify } from "@/lib/slugify";
import type { Category, Product } from "@/lib/types";

type ProductFormProps = {
  categories: Category[];
  product?: Product | null;
};

const initialState: ProductActionState = {};

export function ProductForm({ categories, product }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialState);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));
  const [imageError, setImageError] = useState("");

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(slugify(value));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setImageError(file ? validateProductImageFile(file) ?? "" : "");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const imageInput = event.currentTarget.elements.namedItem("image");
    const file = imageInput instanceof HTMLInputElement ? imageInput.files?.[0] : null;
    const error = file ? validateProductImageFile(file) : null;

    if (error) {
      event.preventDefault();
      setImageError(error);
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="glass-panel rounded-2xl p-5">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="image_url" value={product?.image_url ?? ""} />

      <div className="grid gap-5">
        <FormSection title="Informações básicas">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nome do produto"
              name="name"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              required
            />
            <Input
              label="Slug"
              name="slug"
              value={slug}
              onChange={(event) => handleSlugChange(event.target.value)}
              required
            />
            <Input
              label="Descrição curta"
              name="short_description"
              defaultValue={product?.short_description ?? ""}
              className="md:col-span-2"
            />
          </div>
          <div className="mt-4">
            <Textarea
              label="Descrição completa"
              name="description"
              rows={5}
              defaultValue={product?.description ?? ""}
            />
          </div>
        </FormSection>

        <FormSection title="Preços">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Preço de venda"
              name="price"
              type="text"
              inputMode="decimal"
              defaultValue={product?.price ?? ""}
              placeholder="65,00"
            />
            <Input
              label="Preço de custo"
              name="cost_price"
              type="text"
              inputMode="decimal"
              defaultValue={product?.cost_price ?? ""}
              placeholder="35,00"
            />
          </div>
        </FormSection>

        <FormSection title="Características do café">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Categoria" name="category_id" defaultValue={product?.category_id ?? ""}>
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Select label="Nível de torra" name="roast_level" defaultValue={product?.roast_level ?? "Média"}>
              <option value="Clara">Clara</option>
              <option value="Média clara">Média clara</option>
              <option value="Média">Média</option>
              <option value="Média escura">Média escura</option>
              <option value="Escura">Escura</option>
            </Select>
            <Input label="Origem" name="origin" defaultValue={product?.origin ?? ""} />
            <Input label="Altitude" name="altitude" defaultValue={product?.altitude ?? ""} />
            <Input label="Variedade" name="variety" defaultValue={product?.variety ?? ""} />
            <Input
              label="Pontuação SCA"
              name="score_sca"
              type="number"
              step="0.1"
              min="0"
              defaultValue={product?.score_sca ?? ""}
            />
            <Input
              label="Notas sensoriais"
              name="sensory_notes"
              placeholder="chocolate, caramelo, castanhas"
              defaultValue={(product?.sensory_notes ?? []).join(", ")}
            />
            <Input
              label="Métodos recomendados"
              name="recommended_methods"
              placeholder="V60, espresso, prensa francesa"
              defaultValue={(product?.recommended_methods ?? []).join(", ")}
            />
          </div>
        </FormSection>

        <FormSection title="Imagem e publicação">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Input
                label="Upload de imagem principal"
                name="image"
                type="file"
                accept={PRODUCT_IMAGE_ACCEPT}
                onChange={handleImageChange}
                aria-invalid={Boolean(imageError)}
              />
              {imageError ? (
                <p className="mt-2 text-xs text-red-100">{imageError}</p>
              ) : (
                <p className="mt-2 text-xs text-horebe-gray">JPG, PNG ou WEBP até 10 MB.</p>
              )}
            </div>
            <label className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={product?.is_active ?? true}
                className="h-4 w-4 accent-horebe-gold"
              />
              <span className="text-sm text-horebe-soft">Produto ativo</span>
            </label>
            <label className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={product?.is_featured ?? false}
                className="h-4 w-4 accent-horebe-gold"
              />
              <span className="text-sm text-horebe-soft">Produto em destaque</span>
            </label>
          </div>

          {product?.image_url ? (
            <p className="mt-3 text-xs text-horebe-gray">
              Imagem atual cadastrada. Envie uma nova apenas se quiser substituir.
            </p>
          ) : null}
        </FormSection>
      </div>

      {state.error ? (
        <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={pending || Boolean(imageError)}>
          <Save className="h-4 w-4" aria-hidden />
          {pending ? "Salvando..." : "Salvar produto"}
        </Button>
        <Link
          href="/admin/produtos"
          className="focus-ring inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-horebe-soft hover:border-horebe-gold hover:text-horebe-gold"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/15 p-4 md:p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-horebe-gold">{title}</h2>
      {children}
    </section>
  );
}
