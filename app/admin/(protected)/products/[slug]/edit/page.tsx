import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { getProductBySlug } from "@/lib/db";

export default async function EditProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-semibold text-ink">
        Edit {product.name}
      </h1>
      <ProductForm mode="edit" initial={product} />
    </div>
  );
}
