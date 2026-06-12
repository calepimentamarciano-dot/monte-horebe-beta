import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories } from "@/lib/categories";
import { getProductById } from "@/lib/products";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getAdminCategories()]);

  if (!product) {
    notFound();
  }

  return (
    <>
      <AdminHeader
        title="Editar Produto"
        description={`Atualize dados, imagem e status de ${product.name}.`}
      />
      <ProductForm product={product} categories={categories} />
    </>
  );
}
