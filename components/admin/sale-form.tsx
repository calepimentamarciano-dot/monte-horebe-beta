"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { createSaleAction, type SaleActionState } from "@/app/admin/vendas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/types";
import { calculateMargin, calculateProfit, formatCurrency, formatMargin } from "@/lib/utils";

type SaleFormProps = {
  products: Product[];
};

type SaleFormItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
};

const initialState: SaleActionState = {};
const discountOptions = ["0", "5", "10", "15", "20", "25", "30", "35", "40", "45", "75", "custom"];

export function SaleForm({ products }: SaleFormProps) {
  const [state, formAction, pending] = useActionState(createSaleAction, initialState);
  const [items, setItems] = useState<SaleFormItem[]>([createEmptyItem()]);
  const [discountOption, setDiscountOption] = useState("0");
  const [customDiscount, setCustomDiscount] = useState("");
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const stockWarnings = useMemo(() => getStockWarnings(items, productMap), [items, productMap]);
  const validItems = items.filter((item) => item.productId && item.quantity > 0);
  const totalQuantity = validItems.reduce((total, item) => total + item.quantity, 0);
  const subtotalValue = validItems.reduce((total, item) => total + getItemSubtotal(item), 0);
  const totalCost = validItems.reduce((total, item) => total + getItemCost(item, productMap), 0);
  const discountPercent = getDiscountPercent(discountOption, customDiscount);
  const discountValue = subtotalValue * discountPercent / 100;
  const totalValue = Math.max(subtotalValue - discountValue, 0);
  const estimatedProfit = totalValue - totalCost;
  const hasInvalidItem = items.some((item) => item.productId && item.quantity <= 0);
  const hasInvalidDiscount = discountOption === "custom" && !isValidCustomDiscount(customDiscount);
  const hasStockWarning = stockWarnings.length > 0;
  const canSubmit = products.length > 0 && validItems.length > 0 && !hasInvalidItem && !hasInvalidDiscount && !hasStockWarning;

  function updateItem(id: string, changes: Partial<SaleFormItem>) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) return item;

        const nextItem = { ...item, ...changes };
        if (changes.productId) {
          nextItem.unitPrice = productMap.get(changes.productId)?.price?.toString() ?? "";
          nextItem.quantity = Math.max(nextItem.quantity || 1, 1);
        }

        return nextItem;
      })
    );
  }

  function addItem() {
    setItems((currentItems) => [...currentItems, createEmptyItem()]);
  }

  function removeItem(id: string) {
    setItems((currentItems) =>
      currentItems.length === 1 ? [createEmptyItem()] : currentItems.filter((item) => item.id !== id)
    );
  }

  return (
    <form action={formAction} className="glass-panel rounded-2xl p-5">
      <input type="hidden" name="discount_percent" value={discountPercent.toFixed(2)} />

      <div className="grid gap-4 md:grid-cols-2">
        <Select label="Canal da venda" name="sales_channel" defaultValue="WhatsApp">
          <option value="WhatsApp">WhatsApp</option>
          <option value="Instagram">Instagram</option>
          <option value="Loja fisica">Loja fisica</option>
          <option value="Revendedor">Revendedor</option>
          <option value="Outro">Outro</option>
        </Select>

        <Input label="Nome do cliente" name="customer_name" placeholder="Opcional" />
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-horebe-gray">Produtos da venda</p>
            <p className="mt-1 text-sm text-horebe-soft">Adicione um ou mais produtos no mesmo atendimento.</p>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-horebe-gold/45 px-4 py-2 text-sm font-semibold text-horebe-gold hover:bg-horebe-gold hover:text-horebe-black"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Adicionar produto
          </button>
        </div>

        <div className="grid gap-4 p-4">
          {items.map((item, index) => {
            const selectedProduct = item.productId ? productMap.get(item.productId) ?? null : null;
            const subtotal = getItemSubtotal(item);
            const unitCost = selectedProduct?.cost_price ?? 0;
            const unitProfit = calculateProfit(item.unitPrice, unitCost);
            const itemProfit = unitProfit * Math.max(item.quantity, 0);
            const itemMargin = calculateMargin(item.unitPrice, unitCost);

            return (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-horebe-soft">Item {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-horebe-gray hover:border-red-400/40 hover:text-red-100"
                    aria-label="Remover produto"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_120px_140px_140px]">
                  <Select
                    label="Produto"
                    name="product_id"
                    value={item.productId}
                    onChange={(event) => updateItem(item.id, { productId: event.target.value })}
                  >
                    <option value="">Selecione</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - estoque {product.stock_quantity ?? 0}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Qtd."
                    name="quantity"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => updateItem(item.id, { quantity: Number(event.target.value) })}
                    required={Boolean(item.productId)}
                  />

                  <Input
                    label="Preco unit."
                    name="unit_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(event) => updateItem(item.id, { unitPrice: event.target.value })}
                    required={Boolean(item.productId)}
                  />

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-horebe-gray">Subtotal</p>
                    <div className="flex h-12 items-center rounded-xl border border-white/10 bg-black/25 px-4 font-semibold text-horebe-soft">
                      {formatCurrency(subtotal) ?? "R$ 0,00"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-horebe-gray sm:grid-cols-4">
                  <p>Estoque disponivel: {selectedProduct?.stock_quantity ?? 0}</p>
                  <p>Custo unit.: {formatCurrency(unitCost) ?? "R$ 0,00"}</p>
                  <p>Lucro item: {formatCurrency(itemProfit) ?? "R$ 0,00"}</p>
                  <p>Margem: {formatMargin(itemMargin)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <Textarea label="Observacao" name="notes" rows={4} placeholder="Opcional" />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Desconto da venda"
            value={discountOption}
            onChange={(event) => setDiscountOption(event.target.value)}
          >
            {discountOptions.map((option) => (
              <option key={option} value={option}>
                {option === "custom" ? "Personalizado" : option === "0" ? "Sem desconto / 0%" : `${option}%`}
              </option>
            ))}
          </Select>

          {discountOption === "custom" ? (
            <Input
              label="Desconto personalizado (%)"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={customDiscount}
              onChange={(event) => setCustomDiscount(event.target.value)}
              placeholder="0 a 100"
              aria-invalid={hasInvalidDiscount}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Itens vendidos" value={totalQuantity.toString()} />
        <SummaryCard label="Subtotal" value={formatCurrency(subtotalValue) ?? "R$ 0,00"} />
        <SummaryCard label="Valor do desconto" value={formatCurrency(discountValue) ?? "R$ 0,00"} />
        <SummaryCard label="Total final" value={formatCurrency(totalValue) ?? "R$ 0,00"} />
        <SummaryCard label="Custo total" value={formatCurrency(totalCost) ?? "R$ 0,00"} />
        <SummaryCard label="Lucro estimado" value={formatCurrency(estimatedProfit) ?? "R$ 0,00"} />
        <SummaryCard label="Estoque" value={hasStockWarning ? "Revise" : "Validado"} />
      </div>

      {products.length === 0 ? (
        <Message tone="warning">Cadastre produtos ativos antes de registrar vendas.</Message>
      ) : null}

      {stockWarnings.map((warning) => (
        <Message key={warning} tone="danger">
          {warning}
        </Message>
      ))}

      {hasInvalidItem ? <Message tone="danger">Revise as quantidades informadas.</Message> : null}

      {hasInvalidDiscount ? <Message tone="danger">Desconto invalido.</Message> : null}

      {state.error ? <Message tone="danger">{state.error}</Message> : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={pending || !canSubmit}>
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-horebe-gray">{label}</p>
      <p className="mt-2 font-display text-3xl text-horebe-soft">{value}</p>
    </div>
  );
}

function Message({ children, tone }: { children: React.ReactNode; tone: "danger" | "warning" }) {
  const className =
    tone === "danger"
      ? "border-red-400/25 bg-red-500/10 text-red-100"
      : "border-horebe-gold/30 bg-horebe-gold/10 text-horebe-soft";

  return <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${className}`}>{children}</div>;
}

function getItemSubtotal(item: SaleFormItem) {
  const unitPrice = Number(item.unitPrice.replace(",", "."));
  if (!Number.isFinite(unitPrice) || unitPrice < 0 || item.quantity <= 0) return 0;

  return unitPrice * item.quantity;
}

function getItemCost(item: SaleFormItem, productMap: Map<string, Product>) {
  const product = item.productId ? productMap.get(item.productId) : null;
  const unitCost = Number(product?.cost_price ?? 0);

  if (!Number.isFinite(unitCost) || unitCost < 0 || item.quantity <= 0) return 0;

  return unitCost * item.quantity;
}

function getDiscountPercent(discountOption: string, customDiscount: string) {
  const value = discountOption === "custom" ? customDiscount : discountOption;
  const parsed = Number(value.replace(",", "."));

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return 0;

  return parsed;
}

function isValidCustomDiscount(value: string) {
  if (!value.trim()) return false;

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100;
}

function getStockWarnings(items: SaleFormItem[], productMap: Map<string, Product>) {
  const quantityByProduct = new Map<string, number>();

  items.forEach((item) => {
    if (!item.productId || item.quantity <= 0) return;
    quantityByProduct.set(item.productId, (quantityByProduct.get(item.productId) ?? 0) + item.quantity);
  });

  return [...quantityByProduct.entries()]
    .map(([productId, quantity]) => {
      const product = productMap.get(productId);
      const stock = product?.stock_quantity ?? 0;

      if (!product || quantity <= stock) return null;

      return `${product.name}: estoque disponivel ${stock}, solicitado ${quantity}.`;
    })
    .filter((warning): warning is string => Boolean(warning));
}

function createEmptyItem(): SaleFormItem {
  return {
    id: crypto.randomUUID(),
    productId: "",
    quantity: 1,
    unitPrice: ""
  };
}
