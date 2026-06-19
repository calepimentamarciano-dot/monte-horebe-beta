"use client";

import { Save } from "lucide-react";
import type { ReactNode } from "react";
import { useActionState } from "react";
import {
  createStockMovementAction,
  type StockActionState,
  updateStockAction
} from "@/app/admin/estoque/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product, StockMovement } from "@/lib/types";

type StockManagerProps = {
  products: Product[];
  movements: StockMovement[];
};

const initialState: StockActionState = {};

export function StockManager({ products, movements }: StockManagerProps) {
  const [movementState, movementAction, movementPending] = useActionState(createStockMovementAction, initialState);
  const [updateState, updateAction, updatePending] = useActionState(updateStockAction, initialState);

  return (
    <div className="grid gap-6">
      <form action={movementAction} className="glass-panel rounded-2xl p-5">
        <h2 className="font-display text-3xl text-horebe-soft">Registrar movimentação</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Select label="Produto" name="product_id" required>
            <option value="">Selecione</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - estoque {product.stock_quantity ?? 0}
              </option>
            ))}
          </Select>
          <Select label="Tipo" name="type" defaultValue="entrada">
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
            <option value="ajuste">Ajuste</option>
          </Select>
          <Input label="Quantidade" name="quantity" type="number" min="1" required />
          <Input label="Motivo" name="reason" placeholder="Compra, perda, conferência..." />
        </div>
        <div className="mt-4">
          <Textarea label="Observação" name="notes" rows={3} placeholder="Opcional" />
        </div>

        {movementState.error ? <Message tone="error">{movementState.error}</Message> : null}
        {movementState.success ? <Message tone="success">{movementState.success}</Message> : null}

        <div className="mt-5">
          <Button type="submit" disabled={movementPending || products.length === 0}>
            <Save className="h-4 w-4" aria-hidden />
            {movementPending ? "Registrando..." : "Registrar movimentação"}
          </Button>
        </div>
      </form>

      <section className="glass-panel overflow-hidden rounded-2xl">
        <div className="border-b border-white/10 p-5">
          <h2 className="font-display text-3xl text-horebe-soft">Produtos em estoque</h2>
          {updateState.error ? <Message tone="error">{updateState.error}</Message> : null}
          {updateState.success ? <Message tone="success">{updateState.success}</Message> : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.16em] text-horebe-gray">
              <tr>
                <th className="px-5 py-4">Produto</th>
                <th className="px-5 py-4">Estoque atual</th>
                <th className="px-5 py-4">Estoque mínimo</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4 font-semibold text-horebe-soft">{product.name}</td>
                  <td className="px-5 py-4 text-horebe-gray">{product.stock_quantity ?? 0}</td>
                  <td className="px-5 py-4 text-horebe-gray">{product.min_stock ?? 0}</td>
                  <td className="px-5 py-4">
                    <StockStatus product={product} />
                  </td>
                  <td className="px-5 py-4">
                    <form action={updateAction} className="flex flex-wrap items-end gap-2">
                      <input type="hidden" name="product_id" value={product.id} />
                      <label className="grid gap-1">
                        <span className="text-[11px] uppercase tracking-[0.12em] text-horebe-gray">Atual</span>
                        <input
                          name="stock_quantity"
                          type="number"
                          min="0"
                          defaultValue={product.stock_quantity ?? 0}
                          className="focus-ring h-10 w-24 rounded-full border border-white/10 bg-black/30 px-3 text-sm text-horebe-soft"
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-[11px] uppercase tracking-[0.12em] text-horebe-gray">Mínimo</span>
                        <input
                          name="min_stock"
                          type="number"
                          min="0"
                          defaultValue={product.min_stock ?? 0}
                          className="focus-ring h-10 w-24 rounded-full border border-white/10 bg-black/30 px-3 text-sm text-horebe-soft"
                        />
                      </label>
                      <Button type="submit" disabled={updatePending} className="px-4 py-2">
                        Ajustar
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 ? (
            <p className="p-5 text-sm text-horebe-gray">Nenhum produto cadastrado para controlar estoque.</p>
          ) : null}
        </div>
      </section>

      <section className="glass-panel overflow-hidden rounded-2xl">
        <div className="border-b border-white/10 p-5">
          <h2 className="font-display text-3xl text-horebe-soft">Últimas movimentações</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.16em] text-horebe-gray">
              <tr>
                <th className="px-5 py-4">Data</th>
                <th className="px-5 py-4">Produto</th>
                <th className="px-5 py-4">Tipo</th>
                <th className="px-5 py-4">Quantidade</th>
                <th className="px-5 py-4">Estoque anterior</th>
                <th className="px-5 py-4">Novo estoque</th>
                <th className="px-5 py-4">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td className="px-5 py-4 text-horebe-gray">{formatDate(movement.created_at)}</td>
                  <td className="px-5 py-4 font-semibold text-horebe-soft">{movement.product_name}</td>
                  <td className="px-5 py-4 text-horebe-gray">{movementLabel(movement.type)}</td>
                  <td className="px-5 py-4 text-horebe-gray">{formatMovementQuantity(movement)}</td>
                  <td className="px-5 py-4 text-horebe-gray">{movement.previous_stock}</td>
                  <td className="px-5 py-4 text-horebe-gray">{movement.new_stock}</td>
                  <td className="px-5 py-4 text-horebe-gray">{movement.reason ?? "Sem motivo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {movements.length === 0 ? (
            <p className="p-5 text-sm text-horebe-gray">Nenhuma movimentação registrada ainda.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function StockStatus({ product }: { product: Product }) {
  const stock = product.stock_quantity ?? 0;
  const minStock = product.min_stock ?? 0;

  if (stock <= 0) {
    return <StatusBadge className="border-red-400/30 bg-red-500/10 text-red-100">Sem estoque</StatusBadge>;
  }

  if (stock <= minStock) {
    return <StatusBadge className="border-yellow-400/30 bg-yellow-500/10 text-yellow-100">Estoque baixo</StatusBadge>;
  }

  return <StatusBadge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-100">OK</StatusBadge>;
}

function StatusBadge({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function Message({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <div
      className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
        tone === "error" ? "border-red-400/25 bg-red-500/10 text-red-100" : "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
      }`}
    >
      {children}
    </div>
  );
}

function movementLabel(type: StockMovement["type"]) {
  const labels: Record<StockMovement["type"], string> = {
    entrada: "Entrada",
    saida: "Saída",
    venda: "Venda",
    ajuste: "Ajuste",
    cancelamento: "Cancelamento"
  };

  return labels[type];
}

function formatMovementQuantity(movement: StockMovement) {
  if (movement.type === "entrada" || movement.type === "cancelamento") {
    return `+${movement.quantity}`;
  }

  if (movement.type === "saida" || movement.type === "venda") {
    return `-${movement.quantity}`;
  }

  return movement.quantity;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(new Date(value));
}
