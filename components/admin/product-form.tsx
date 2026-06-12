"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { slugify } from "@/lib/utils";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number | null;
  image_url: string | null;
  gallery: string[] | null;
  category_id: string | null;
  origin: string;
  altitude: string;
  variety: string;
  roast_level: string;
  score_sca: number | null;
  sensory_notes: string[];
  recommended_methods: string[];
  is_featured: boolean;
  is_active: boolean;
};

type ProductFormProps = {
  categories: Category[];
  editingProduct?: Product | null;
  onSubmit: (values: ProductFormValues, file: File | null) => Promise<void>;
  onCancelEdit: () => void;
  disabled?: boolean;
};

const emptyValues: ProductFormValues = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  price: null,
  image_url: null,
  gallery: null,
  category_id: null,
  origin: "",
  altitude: "",
  variety: "",
  roast_level: "Média",
  score_sca: null,
  sensory_notes: [],
  recommended_methods: [],
  is_featured: true,
  is_active: true
};

export function ProductForm({
  categories,
  editingProduct,
  onSubmit,
  onCancelEdit,
  disabled
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(emptyValues);
  const [notesText, setNotesText] = useState("");
  const [methodsText, setMethodsText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editingProduct) {
      setValues(emptyValues);
      setNotesText("");
      setMethodsText("");
      setFile(null);
      return;
    }

    setValues({
      id: editingProduct.id,
      name: editingProduct.name,
      slug: editingProduct.slug,
      short_description: editingProduct.short_description ?? "",
      description: editingProduct.description ?? "",
      price: editingProduct.price,
      image_url: editingProduct.image_url,
      gallery: editingProduct.gallery,
      category_id: editingProduct.category_id,
      origin: editingProduct.origin ?? "",
      altitude: editingProduct.altitude ?? "",
      variety: editingProduct.variety ?? "",
      roast_level: editingProduct.roast_level ?? "",
      score_sca: editingProduct.score_sca,
      sensory_notes: editingProduct.sensory_notes ?? [],
      recommended_methods: editingProduct.recommended_methods ?? [],
      is_featured: editingProduct.is_featured,
      is_active: editingProduct.is_active
    });
    setNotesText((editingProduct.sensory_notes ?? []).join(", "));
    setMethodsText((editingProduct.recommended_methods ?? []).join(", "));
    setFile(null);
  }, [editingProduct]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(
        {
          ...values,
          slug: values.slug || slugify(values.name),
          sensory_notes: splitList(notesText),
          recommended_methods: splitList(methodsText)
        },
        file
      );
      if (!editingProduct) {
        setValues(emptyValues);
        setNotesText("");
        setMethodsText("");
        setFile(null);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form id="produtos" onSubmit={handleSubmit} className="glass-panel rounded-[1.5rem] p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-horebe-soft">
            {editingProduct ? "Editar produto" : "Novo produto"}
          </h2>
          <p className="text-sm text-horebe-gray">Cadastre cafés, notas e dados técnicos.</p>
        </div>
        {editingProduct ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="focus-ring rounded-full border border-white/10 px-4 py-2 text-sm text-horebe-gray"
          >
            Cancelar
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Nome" value={values.name} onChange={(value) => setValues({ ...values, name: value, slug: values.slug || slugify(value) })} required />
        <Input label="Slug" value={values.slug} onChange={(value) => setValues({ ...values, slug: slugify(value) })} required />
        <Input label="Descrição curta" value={values.short_description} onChange={(value) => setValues({ ...values, short_description: value })} />
        <Input label="Preço" type="number" value={values.price ?? ""} onChange={(value) => setValues({ ...values, price: value ? Number(value) : null })} />
        <Select label="Categoria" value={values.category_id ?? ""} onChange={(value) => setValues({ ...values, category_id: value || null })}>
          <option value="">Sem categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select label="Torra" value={values.roast_level} onChange={(value) => setValues({ ...values, roast_level: value })}>
          <option>Média clara</option>
          <option>Média</option>
          <option>Média escura</option>
          <option>Clara</option>
          <option>Escura</option>
        </Select>
        <Input label="Origem" value={values.origin} onChange={(value) => setValues({ ...values, origin: value })} />
        <Input label="Altitude" value={values.altitude} onChange={(value) => setValues({ ...values, altitude: value })} />
        <Input label="Variedade" value={values.variety} onChange={(value) => setValues({ ...values, variety: value })} />
        <Input label="Pontuação SCA" type="number" value={values.score_sca ?? ""} onChange={(value) => setValues({ ...values, score_sca: value ? Number(value) : null })} />
        <Input label="Notas sensoriais" value={notesText} onChange={setNotesText} placeholder="chocolate, caramelo, castanhas" />
        <Input label="Métodos recomendados" value={methodsText} onChange={setMethodsText} placeholder="V60, espresso, prensa francesa" />
      </div>

      <label className="mt-4 grid gap-2">
        <span className="text-sm font-semibold text-horebe-soft">Descrição completa</span>
        <textarea
          value={values.description}
          onChange={(event) => setValues({ ...values, description: event.target.value })}
          rows={4}
          className="focus-ring rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-horebe-soft"
        />
      </label>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-horebe-soft">Imagem</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="focus-ring rounded-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-horebe-gray"
          />
        </label>
        <Checkbox label="Produto em destaque" checked={values.is_featured} onChange={(checked) => setValues({ ...values, is_featured: checked })} />
        <Checkbox label="Produto ativo" checked={values.is_active} onChange={(checked) => setValues({ ...values, is_active: checked })} />
      </div>

      <button
        type="submit"
        disabled={disabled || saving}
        className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-horebe-gold px-6 py-3 text-sm font-semibold text-horebe-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Save className="h-4 w-4" aria-hidden />
        {saving ? "Salvando..." : "Salvar produto"}
      </button>
    </form>
  );
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-horebe-soft">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring h-12 rounded-full border border-white/10 bg-black/30 px-4 text-sm text-horebe-soft placeholder:text-horebe-gray"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-horebe-soft">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring h-12 rounded-full border border-white/10 bg-black/30 px-4 text-sm text-horebe-soft"
      >
        {children}
      </select>
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-horebe-gold"
      />
      <span className="text-sm text-horebe-soft">{label}</span>
    </label>
  );
}
