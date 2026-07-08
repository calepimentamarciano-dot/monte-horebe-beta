import { Boxes, FolderTree, Plus } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { ModuleNav } from "@/components/admin/module-nav";
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
      <ModuleNav
        items={[
          { href: "/admin/produtos", label: "Gerenciar produtos", icon: Boxes, active: true },
          { href: "/admin/produtos/novo", label: "Novo produto", icon: Plus },
          { href: "/admin/categorias", label: "Categorias", icon: FolderTree }
        ]}
      />
      <ProductTable products={products} />
    </>
  );
}
