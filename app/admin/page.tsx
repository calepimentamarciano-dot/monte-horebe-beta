"use client";

import type { User } from "@supabase/supabase-js";
import { FolderPlus, KeyRound, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { ProductTable } from "@/components/admin/product-table";
import { Sidebar } from "@/components/admin/sidebar";
import { mockCategories, mockProducts } from "@/lib/mock-products";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import type { Category, Product } from "@/lib/types";
import { slugify } from "@/lib/utils";

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const supabaseReady = hasSupabaseEnv() && Boolean(supabase);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!supabaseReady || !supabase) {
      setProducts(mockProducts);
      setCategories(mockCategories);
      setLoading(false);
      return;
    }

    const [{ data: productData }, { data: categoryData }] = await Promise.all([
      supabase.from("products").select("*, category:categories(id, name, slug)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name", { ascending: true })
    ]);

    setProducts((productData as Product[] | null) ?? []);
    setCategories((categoryData as Category[] | null) ?? []);
    setLoading(false);
  }, [supabase, supabaseReady]);

  useEffect(() => {
    async function boot() {
      if (!supabaseReady || !supabase) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      await loadData();

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => listener.subscription.unsubscribe();
    }

    void boot();
  }, [loadData, supabase, supabaseReady]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }

    await loadData();
  }

  async function handleSignOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }

  async function handleSaveProduct(values: ProductFormValues, file: File | null) {
    if (!supabaseReady || !supabase) {
      setMessage("Configure o Supabase para salvar produtos reais.");
      return;
    }

    let imageUrl = values.image_url;

    if (file) {
      const path = `${Date.now()}-${slugify(file.name)}`;
      const { error: uploadError } = await supabase.storage.from("products").upload(path, file, {
        upsert: true
      });

      if (uploadError) {
        setMessage(uploadError.message);
        return;
      }

      imageUrl = supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
    }

    const payload = {
      name: values.name,
      slug: values.slug,
      short_description: values.short_description,
      description: values.description,
      price: values.price,
      image_url: imageUrl,
      gallery: values.gallery,
      category_id: values.category_id,
      origin: values.origin,
      altitude: values.altitude,
      variety: values.variety,
      roast_level: values.roast_level,
      score_sca: values.score_sca,
      sensory_notes: values.sensory_notes,
      recommended_methods: values.recommended_methods,
      is_featured: values.is_featured,
      is_active: values.is_active,
      updated_at: new Date().toISOString()
    };

    const query = values.id
      ? supabase.from("products").update(payload).eq("id", values.id)
      : supabase.from("products").insert(payload);

    const { error } = await query;
    if (error) {
      setMessage(error.message);
      return;
    }

    setEditingProduct(null);
    setMessage("Produto salvo com sucesso.");
    await loadData();
  }

  async function handleDeleteProduct(product: Product) {
    if (!supabaseReady || !supabase) {
      setMessage("Configure o Supabase para excluir produtos reais.");
      return;
    }

    const confirmed = window.confirm(`Excluir ${product.name}?`);
    if (!confirmed) return;

    const { error } = await supabase.from("products").delete().eq("id", product.id);
    setMessage(error ? error.message : "Produto excluído.");
    await loadData();
  }

  async function handleSaveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabaseReady || !supabase) {
      setMessage("Configure o Supabase para salvar categorias reais.");
      return;
    }

    const payload = {
      name: categoryName,
      slug: slugify(categoryName)
    };

    const query = editingCategory
      ? supabase.from("categories").update(payload).eq("id", editingCategory.id)
      : supabase.from("categories").insert(payload);

    const { error } = await query;
    if (error) {
      setMessage(error.message);
      return;
    }

    setCategoryName("");
    setEditingCategory(null);
    setMessage("Categoria salva.");
    await loadData();
  }

  async function handleDeleteCategory(category: Category) {
    if (!supabaseReady || !supabase) {
      setMessage("Configure o Supabase para excluir categorias reais.");
      return;
    }

    const confirmed = window.confirm(`Excluir categoria ${category.name}?`);
    if (!confirmed) return;

    const { error } = await supabase.from("categories").delete().eq("id", category.id);
    setMessage(error ? error.message : "Categoria excluída.");
    await loadData();
  }

  if (!supabaseReady) {
    return (
      <AdminShell onSignOut={() => undefined}>
        <SetupNotice />
        <AdminContent
          products={products}
          categories={categories}
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          categoryName={categoryName}
          setCategoryName={setCategoryName}
          editingCategory={editingCategory}
          setEditingCategory={setEditingCategory}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          disabled
          message={message}
        />
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <section className="min-h-screen bg-horebe-radial px-4 pb-24 pt-36">
        <form onSubmit={handleLogin} className="glass-panel mx-auto max-w-md rounded-[2rem] p-6">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-horebe-gold text-horebe-black">
            <KeyRound className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="font-display text-4xl text-horebe-soft">Acesso administrativo</h1>
          <p className="mt-3 text-sm leading-7 text-horebe-gray">
            Entre com um usuário Supabase Auth para gerenciar catálogo e categorias.
          </p>
          <div className="mt-6 grid gap-4">
            <LoginField label="E-mail" type="email" value={email} onChange={setEmail} />
            <LoginField label="Senha" type="password" value={password} onChange={setPassword} />
            <button className="focus-ring rounded-full bg-horebe-gold px-6 py-3 text-sm font-semibold text-horebe-black">
              Entrar
            </button>
          </div>
          {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}
        </form>
      </section>
    );
  }

  return (
    <AdminShell onSignOut={handleSignOut}>
      {loading ? <p className="text-horebe-gray">Carregando painel...</p> : null}
      <AdminContent
        products={products}
        categories={categories}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        categoryName={categoryName}
        setCategoryName={setCategoryName}
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        message={message}
      />
    </AdminShell>
  );
}

function AdminShell({
  children,
  onSignOut
}: {
  children: React.ReactNode;
  onSignOut: () => void;
}) {
  return (
    <section className="min-h-screen bg-horebe-radial px-4 pb-24 pt-32">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <Sidebar onSignOut={onSignOut} />
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

function AdminContent({
  products,
  categories,
  editingProduct,
  setEditingProduct,
  onSaveProduct,
  onDeleteProduct,
  categoryName,
  setCategoryName,
  editingCategory,
  setEditingCategory,
  onSaveCategory,
  onDeleteCategory,
  disabled,
  message
}: {
  products: Product[];
  categories: Category[];
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  onSaveProduct: (values: ProductFormValues, file: File | null) => Promise<void>;
  onDeleteProduct: (product: Product) => Promise<void>;
  categoryName: string;
  setCategoryName: (value: string) => void;
  editingCategory: Category | null;
  setEditingCategory: (category: Category | null) => void;
  onSaveCategory: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onDeleteCategory: (category: Category) => Promise<void>;
  disabled?: boolean;
  message: string;
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3" id="visão-geral">
        <Metric label="Produtos" value={products.length} />
        <Metric label="Categorias" value={categories.length} />
        <Metric label="Destaques" value={products.filter((product) => product.is_featured).length} />
      </div>

      {message ? (
        <div className="rounded-2xl border border-horebe-gold/25 bg-horebe-gold/10 px-4 py-3 text-sm text-horebe-soft">
          {message}
        </div>
      ) : null}

      <ProductForm
        categories={categories}
        editingProduct={editingProduct}
        onSubmit={onSaveProduct}
        onCancelEdit={() => setEditingProduct(null)}
        disabled={disabled}
      />

      <ProductTable
        products={products}
        onEdit={setEditingProduct}
        onDelete={onDeleteProduct}
        disabled={disabled}
      />

      <section id="categorias" className="glass-panel rounded-[1.5rem] p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-horebe-soft">Categorias</h2>
            <p className="text-sm text-horebe-gray">Crie, edite e exclua grupos de produto.</p>
          </div>
          <FolderPlus className="h-6 w-6 text-horebe-gold" aria-hidden />
        </div>
        <form onSubmit={onSaveCategory} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Nome da categoria"
            required
            className="focus-ring h-12 flex-1 rounded-full border border-white/10 bg-black/30 px-4 text-sm text-horebe-soft"
          />
          <button
            disabled={disabled}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-horebe-gold px-5 py-3 text-sm font-semibold text-horebe-black disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {editingCategory ? "Salvar" : "Criar"}
          </button>
        </form>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(category);
                  setCategoryName(category.name);
                }}
                className="focus-ring text-left text-sm font-semibold text-horebe-soft hover:text-horebe-gold"
              >
                {category.name}
                <span className="block text-xs font-normal text-horebe-gray">{category.slug}</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteCategory(category)}
                disabled={disabled}
                className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/10 text-horebe-gray hover:border-red-400 hover:text-red-300 disabled:opacity-50"
                aria-label={`Excluir categoria ${category.name}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="mb-6 rounded-[1.5rem] border border-horebe-gold/25 bg-horebe-gold/10 p-5 text-sm leading-7 text-horebe-soft">
      O painel está em modo de prévia porque as variáveis do Supabase não foram
      configuradas. Preencha `.env.local`, rode a migration e crie um usuário no Supabase
      Auth para ativar login, CRUD e upload.
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-panel rounded-[1.5rem] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-horebe-gray">{label}</p>
      <p className="mt-3 font-display text-4xl text-horebe-soft">{value}</p>
    </div>
  );
}

function LoginField({
  label,
  type,
  value,
  onChange
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-horebe-soft">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring h-12 rounded-full border border-white/10 bg-black/30 px-4 text-sm text-horebe-soft"
      />
    </label>
  );
}
