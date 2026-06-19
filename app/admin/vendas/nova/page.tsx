import { AdminHeader } from "@/components/admin/admin-header";
import { SaleForm } from "@/components/admin/sale-form";
import { getStockProducts } from "@/lib/stock";

export default async function NewSalePage() {
  const products = (await getStockProducts()).filter((product) => product.is_active);

  return (
    <>
      <AdminHeader
        title="Nova venda"
        description="Registre uma venda manualmente e dê baixa automática no estoque do produto."
      />
      <SaleForm products={products} />
    </>
  );
}
