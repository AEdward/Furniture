import PageBlockEditor from "@/components/PageBlockEditor";

export default function NewPagePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-semibold text-ink">Add page</h1>
      <PageBlockEditor mode="create" />
    </div>
  );
}
