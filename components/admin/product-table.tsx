"use client";

import { Edit3, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type ProductTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => Promise<void>;
  disabled?: boolean;
};

export function ProductTable({ products, onEdit, onDelete, disabled }: ProductTableProps) {
  return (
    <div className="glass-panel overflow-hidden rounded-[1.5rem]">
      <div className="border-b border-white/10 p-5">
        <h2 className="font-display text-3xl text-horebe-soft">Produtos cadastrados</h2>
        <p className="text-sm text-horebe-gray">Edite catálogo, status e destaques.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.18em] text-horebe-gray">
            <tr>
              <th className="px-5 py-4">Produto</th>
              <th className="px-5 py-4">Torra</th>
              <th className="px-5 py-4">SCA</th>
              <th className="px-5 py-4">Preço</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-white/10 text-horebe-soft">
                <td className="px-5 py-4">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-xs text-horebe-gray">{product.slug}</p>
                </td>
                <td className="px-5 py-4 text-horebe-gray">{product.roast_level}</td>
                <td className="px-5 py-4 text-horebe-gray">{product.score_sca ?? "-"}</td>
                <td className="px-5 py-4 text-horebe-gray">{formatCurrency(product.price) ?? "Sob consulta"}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-horebe-gold/10 px-3 py-1 text-xs text-horebe-gold">
                    {product.is_active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      disabled={disabled}
                      className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/10 text-horebe-gray transition hover:border-horebe-gold hover:text-horebe-gold disabled:opacity-50"
                      aria-label={`Editar ${product.name}`}
                    >
                      <Edit3 className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      disabled={disabled}
                      className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/10 text-horebe-gray transition hover:border-red-400 hover:text-red-300 disabled:opacity-50"
                      aria-label={`Excluir ${product.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
