import { createFileRoute } from "@tanstack/react-router";
import { cowStatusApi } from "@/lib/api";
import { LookupPage } from "@/components/lookup-page";

export const Route = createFileRoute("/_auth/cow-statuses/")({
  component: CowStatusesPage,
});

function CowStatusesPage() {
  return (
    <LookupPage
      title="Cow Statuses"
      subtitle="Manage cow status classifications"
      listTitle="Cow Status List"
      queryKey={["cow-statuses"]}
      queryFn={async () => {
        const res = await cowStatusApi.getAll();
        return res.data.data ?? [];
      }}
      toggleActiveFn={(id) => cowStatusApi.toggleActive(id)}
      createFn={(data) => cowStatusApi.create(data)}
      updateFn={(id, data) => cowStatusApi.update(id, data)}
      entityLabel="Cow Status"
      emptyMessage="No cow statuses found."
      detailPath="/cow-statuses"
    />
  );
}
