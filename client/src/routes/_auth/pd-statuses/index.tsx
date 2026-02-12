import { createFileRoute } from "@tanstack/react-router";
import { pdStatusApi } from "@/lib/api";
import { LookupPage } from "@/components/lookup-page";

export const Route = createFileRoute("/_auth/pd-statuses/")({
  component: PdStatusesPage,
});

function PdStatusesPage() {
  return (
    <LookupPage
      title="PD Statuses"
      subtitle="Manage pregnancy diagnosis status types"
      listTitle="PD Status List"
      queryKey={["pd-statuses"]}
      queryFn={async () => {
        const res = await pdStatusApi.getAll();
        return res.data.data ?? [];
      }}
      toggleActiveFn={(id) => pdStatusApi.toggleActive(id)}
      createFn={(data) => pdStatusApi.create(data)}
      updateFn={(id, data) => pdStatusApi.update(id, data)}
      entityLabel="PD Status"
      emptyMessage="No PD statuses found."
    />
  );
}
