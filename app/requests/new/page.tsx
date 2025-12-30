import RequestForm from "@/components/RequestForm";

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">New Request</h1>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <RequestForm />
      </div>
    </div>
  );
}
