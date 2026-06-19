"use client";

import { CheckCircle2, Edit3, ImageIcon, Star, Trash2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  deleteProductAction,
  toggleProductActiveAction,
  toggleProductFeaturedAction
} from "@/app/admin/produtos/actions";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { calculateMargin, calculateProfit, formatCurrency, formatMargin } from "@/lib/utils";

type ProductTableProps = {
  products: Product[];
};

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function runAction(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  function handleDelete(product: Product) {
    const confirmed = window.confirm("Tem certeza que deseja excluir este produto?");
    if (!confirmed) return;
    runAction(() => deleteProductAction(product.id));
  }

  if (!products.length) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <p className="font-display text-3xl text-horebe-soft">Nenhum produto cadastrado ainda.</p>
        <p className="mt-2 text-sm text-horebe-gray">Adicione o primeiro item para alimentar o catálogo público.</p>
        <Link
          href="/admin/produtos/novo"
          className="focus-ring mt-6 inline-flex rounded-full bg-horebe-gold px-5 py-3 text-sm font-semibold text-horebe-black"
        >
          Novo Produto
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.16em] text-horebe-gray">
            <tr>
              <th className="px-5 py-4">Imagem</th>
              <th className="px-5 py-4">Nome</th>
              <th className="px-5 py-4">Categoria</th>
              <th className="px-5 py-4">Torra</th>
              <th className="px-5 py-4">Comercial</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Destaque</th>
              <th className="px-5 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-white/10 text-horebe-soft">
                <td className="px-5 py-4">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt=""
                      width={56}
                      height={56}
                      unoptimized
                      className="h-14 w-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-horebe-green/70 text-horebe-gold">
                      <ImageIcon className="h-5 w-5" aria-hidden />
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-xs text-horebe-gray">{product.slug}</p>
                </td>
                <td className="px-5 py-4 text-horebe-gray">{product.category?.name ?? "Sem categoria"}</td>
                <td className="px-5 py-4 text-horebe-gray">{product.roast_level ?? "-"}</td>
                <td className="px-5 py-4 text-horebe-gray">
                  <ProductProfitSummary product={product} />
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => runAction(() => toggleProductActiveAction(product.id, !product.is_active))}
                    className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-horebe-soft hover:border-horebe-gold"
                  >
                    {product.is_active ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-300" aria-hidden />
                    )}
                    {product.is_active ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => runAction(() => toggleProductFeaturedAction(product.id, !product.is_featured))}
                    className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-horebe-soft hover:border-horebe-gold"
                  >
                    <Star
                      className={product.is_featured ? "h-4 w-4 fill-horebe-gold text-horebe-gold" : "h-4 w-4"}
                      aria-hidden
                    />
                    {product.is_featured ? "Sim" : "Não"}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/produtos/${product.id}/editar`}
                      className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/10 text-horebe-gray transition hover:border-horebe-gold hover:text-horebe-gold"
                      aria-label={`Editar ${product.name}`}
                    >
                      <Edit3 className="h-4 w-4" aria-hidden />
                    </Link>
                    <Button
                      type="button"
                      variant="danger"
                      disabled={pending}
                      onClick={() => handleDelete(product)}
                      className="h-10 w-10 px-0 py-0"
                      aria-label={`Excluir ${product.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
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

function ProductProfitSummary({ product }: { product: Product }) {
  const costPrice = product.cost_price ?? 0;
  const unitProfit = calculateProfit(product.price, costPrice);
  const margin = calculateMargin(product.price, costPrice);

  return (
    <div className="space-y-1">
      <p>Venda: {formatCurrency(product.price) ?? "Sob consulta"}</p>
      <p>Custo: {formatCurrency(costPrice) ?? "R$ 0,00"}</p>
      <p>Lucro: {formatCurrency(unitProfit) ?? "R$ 0,00"}</p>
      <p>Margem: {formatMargin(margin)}</p>
    </div>
  );
}
