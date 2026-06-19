"use client";

import { XCircle } from "lucide-react";
import { useActionState, useState } from "react";
import { cancelSaleAction, type SaleActionState } from "@/app/admin/vendas/actions";
import { Button } from "@/components/ui/button";

type CancelSaleFormProps = {
  saleId: string;
};

const initialState: SaleActionState = {};

export function CancelSaleForm({ saleId }: CancelSaleFormProps) {
  const [state, formAction, pending] = useActionState(cancelSaleAction, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex items-center gap-2 rounded-full border border-red-400/30 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/10"
      >
        <XCircle className="h-4 w-4" aria-hidden />
        Cancelar
      </button>
    );
  }

  return (
    <form action={formAction} className="grid max-w-sm gap-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-3">
      <input type="hidden" name="sale_id" value={saleId} />
      <p className="text-xs leading-5 text-red-100">
        Tem certeza que deseja cancelar esta venda? O estoque será devolvido automaticamente e a venda deixará de contar no faturamento.
      </p>
      <textarea
        name="cancel_reason"
        rows={3}
        placeholder="Motivo opcional"
        className="focus-ring w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-horebe-soft placeholder:text-horebe-gray"
      />

      {state.error ? <p className="text-xs text-red-100">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-emerald-100">{state.success}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="danger" disabled={pending} className="px-3 py-2 text-xs">
          {pending ? "Cancelando..." : "Confirmar cancelamento"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="focus-ring rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-horebe-soft hover:border-horebe-gold hover:text-horebe-gold"
        >
          Voltar
        </button>
      </div>
    </form>
  );
}
