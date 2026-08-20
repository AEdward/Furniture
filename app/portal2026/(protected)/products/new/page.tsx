import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-semibold text-ink">Add product</h1>
      <ProductForm mode="create" />
    </div>
  );
}
