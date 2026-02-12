import { createFileRoute } from "@tanstack/react-router";
import { aiStatusApi } from "@/lib/api";
import { LookupPage } from "@/components/lookup-page";

export const Route = createFileRoute("/_auth/ai-statuses/")({
  component: AiStatusesPage,
});

function AiStatusesPage() {
  return (
    <LookupPage
      title="AI Statuses"
      subtitle="Manage artificial insemination status types"
      listTitle="AI Status List"
      queryKey={["ai-statuses"]}
      queryFn={async () => {
        const res = await aiStatusApi.getAll();
        return res.data.data ?? [];
      }}
      toggleActiveFn={(id) => aiStatusApi.toggleActive(id)}
      createFn={(data) => aiStatusApi.create(data)}
      updateFn={(id, data) => aiStatusApi.update(id, data)}
      entityLabel="AI Status"
      emptyMessage="No AI statuses found."
    />
  );
}
