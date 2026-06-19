"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { createSaleAction, type SaleActionState } from "@/app/admin/vendas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type SaleFormProps = {
  products: Product[];
};

const initialState: SaleActionState = {};

export function SaleForm({ products }: SaleFormProps) {
  const [state, formAction, pending] = useActionState(createSaleAction, initialState);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(products[0]?.price?.toString() ?? "");
  const [manualTotal, setManualTotal] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? null,
    [productId, products]
  );
  const stockQuantity = selectedProduct?.stock_quantity ?? 0;
  const parsedUnitPrice = Number(unitPrice.replace(",", "."));
  const hasUnitPrice = Number.isFinite(parsedUnitPrice) && unitPrice.trim() !== "";
  const calculatedTotal = hasUnitPrice ? Math.max(quantity, 0) * parsedUnitPrice : Number(manualTotal.replace(",", "."));
  const insufficientStock = Boolean(selectedProduct && quantity > stockQuantity);
  const totalValue = Number.isFinite(calculatedTotal) ? calculatedTotal : 0;

  useEffect(() => {
    setUnitPrice(selectedProduct?.price?.toString() ?? "");
    setManualTotal("");
  }, [selectedProduct]);

  return (
    <form action={formAction} className="glass-panel rounded-2xl p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Produto vendido"
          name="product_id"
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          required
        >
          {products.length ? null : <option value="">Nenhum produto disponível</option>}
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} - estoque {product.stock_quantity ?? 0}
            </option>
          ))}
        </Select>

        <Input
          label="Quantidade vendida"
          name="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          required
        />

        <Input
          label="Preço unitário"
          name="unit_price"
          type="number"
          step="0.01"
          min="0"
          value={unitPrice}
          onChange={(event) => setUnitPrice(event.target.value)}
        />

        <Input
          label="Valor total"
          name="total_value"
          type="number"
          step="0.01"
          min="0"
          value={hasUnitPrice ? totalValue.toFixed(2) : manualTotal}
          onChange={(event) => setManualTotal(event.target.value)}
          readOnly={hasUnitPrice}
          required={!hasUnitPrice}
        />

        <Select label="Canal da venda" name="sales_channel" defaultValue="WhatsApp">
          <option value="WhatsApp">WhatsApp</option>
          <option value="Instagram">Instagram</option>
          <option value="Loja física">Loja física</option>
          <option value="Revendedor">Revendedor</option>
          <option value="Outro">Outro</option>
        </Select>

        <Input label="Nome do cliente" name="customer_name" placeholder="Opcional" />
      </div>

      <div className="mt-4">
        <Textarea label="Observação" name="notes" rows={4} placeholder="Opcional" />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-horebe-gray">Estoque disponível</p>
          <p className="mt-2 font-display text-3xl text-horebe-soft">{stockQuantity}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-horebe-gray">Total calculado</p>
          <p className="mt-2 font-display text-3xl text-horebe-soft">{formatCurrency(totalValue) ?? "R$ 0,00"}</p>
        </div>
      </div>

      {insufficientStock ? (
        <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Quantidade maior que o estoque disponível.
        </div>
      ) : null}

      {state.error ? (
        <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={pending || insufficientStock || !selectedProduct}>
          <Save className="h-4 w-4" aria-hidden />
          {pending ? "Registrando..." : "Registrar venda"}
        </Button>
        <Link
          href="/admin/vendas"
          className="focus-ring inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-horebe-soft hover:border-horebe-gold hover:text-horebe-gold"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
