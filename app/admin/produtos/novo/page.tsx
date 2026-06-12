import { AdminHeader } from "@/components/admin/admin-header";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories } from "@/lib/categories";

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <>
      <AdminHeader
        title="Novo Produto"
        description="Cadastre um produto com descrição, preço, categoria, notas sensoriais e imagem principal."
      />
      <ProductForm categories={categories} />
    </>
  );
}
