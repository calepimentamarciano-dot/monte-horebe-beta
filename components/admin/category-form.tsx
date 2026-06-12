"use client";

import { Edit3, FolderPlus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import {
  deleteCategoryAction,
  saveCategoryAction,
  type CategoryActionState
} from "@/app/admin/categorias/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/slugify";
import type { Category } from "@/lib/types";

type CategoryFormProps = {
  categories: Category[];
};

const initialState: CategoryActionState = {};

export function CategoryForm({ categories }: CategoryFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveCategoryAction, initialState);
  const [deletePending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (state.success) {
      setEditing(null);
      setName("");
      setSlug("");
      setSlugTouched(false);
      router.refresh();
    }
  }, [router, state.success]);

  function selectCategory(category: Category) {
    setEditing(category);
    setName(category.name);
    setSlug(category.slug);
    setSlugTouched(true);
  }

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

  function handleDelete(category: Category) {
    const confirmed = window.confirm(`Excluir categoria ${category.name}?`);
    if (!confirmed) return;

    startTransition(async () => {
      await deleteCategoryAction(category.id);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form action={formAction} className="glass-panel rounded-2xl p-5">
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-horebe-gold/10 text-horebe-gold">
            <FolderPlus className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-3xl text-horebe-soft">
              {editing ? "Editar categoria" : "Nova categoria"}
            </h2>
            <p className="text-sm text-horebe-gray">Organize os produtos por linhas do catálogo.</p>
          </div>
        </div>

        <div className="grid gap-4">
          <Input
            label="Nome"
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
        </div>

        {state.error ? (
          <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="mt-5 rounded-2xl border border-horebe-gold/25 bg-horebe-gold/10 px-4 py-3 text-sm text-horebe-soft">
            {state.success}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={pending}>
            <Save className="h-4 w-4" aria-hidden />
            {pending ? "Salvando..." : editing ? "Salvar categoria" : "Criar categoria"}
          </Button>
          {editing ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditing(null);
                setName("");
                setSlug("");
                setSlugTouched(false);
              }}
            >
              Cancelar edição
            </Button>
          ) : null}
        </div>
      </form>

      <div className="glass-panel rounded-2xl p-5">
        <h2 className="font-display text-3xl text-horebe-soft">Categorias cadastradas</h2>
        <p className="mt-1 text-sm text-horebe-gray">Edite ou remova categorias existentes.</p>

        <div className="mt-5 grid gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div>
                <p className="font-semibold text-horebe-soft">{category.name}</p>
                <p className="text-xs text-horebe-gray">{category.slug}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => selectCategory(category)}
                  className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/10 text-horebe-gray hover:border-horebe-gold hover:text-horebe-gold"
                  aria-label={`Editar ${category.name}`}
                >
                  <Edit3 className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={deletePending}
                  onClick={() => handleDelete(category)}
                  className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/10 text-horebe-gray hover:border-red-400 hover:text-red-300 disabled:opacity-50"
                  aria-label={`Excluir ${category.name}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          ))}

          {!categories.length ? (
            <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-horebe-gray">
              Nenhuma categoria cadastrada ainda.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
