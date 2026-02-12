import { createFileRoute } from "@tanstack/react-router";
import { calfStatusApi } from "@/lib/api";
import { LookupPage } from "@/components/lookup-page";

export const Route = createFileRoute("/_auth/calf-statuses/")({
  component: CalfStatusesPage,
});

function CalfStatusesPage() {
  return (
    <LookupPage
      title="Calf Statuses"
      subtitle="Manage calf status classifications"
      listTitle="Calf Status List"
      queryKey={["calf-statuses"]}
      queryFn={async () => {
        const res = await calfStatusApi.getAll();
        return res.data.data ?? [];
      }}
      toggleActiveFn={(id) => calfStatusApi.toggleActive(id)}
      createFn={(data) => calfStatusApi.create(data)}
      updateFn={(id, data) => calfStatusApi.update(id, data)}
      entityLabel="Calf Status"
      emptyMessage="No calf statuses found."
    />
  );
}
