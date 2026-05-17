import ClientForm from "@/components/ClientForm";

export const metadata = { title: "New Client" };

export default function NewClientPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Add Client</h1>
      <ClientForm />
    </div>
  );
}