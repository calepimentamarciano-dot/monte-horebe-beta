import { AdminHeader } from "@/components/admin/admin-header";
import { CategoryForm } from "@/components/admin/category-form";
import { getAdminCategories } from "@/lib/categories";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <>
      <AdminHeader
        title="Categorias"
        description="Crie e mantenha as linhas de produto usadas no catálogo público."
      />
      <CategoryForm categories={categories} />
    </>
  );
}
