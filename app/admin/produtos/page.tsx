import { Plus } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductTable } from "@/components/admin/product-table";
import { getAdminProducts } from "@/lib/products";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <>
      <AdminHeader
        title="Produtos"
        description="Gerencie imagens, categorias, status, destaques e informações comerciais do catálogo."
        action={
          <Link
            href="/admin/produtos/novo"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-horebe-gold px-5 py-3 text-sm font-semibold text-horebe-black"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Novo Produto
          </Link>
        }
      />
      <ProductTable products={products} />
    </>
  );
}
