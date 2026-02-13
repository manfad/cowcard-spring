import { createFileRoute } from "@tanstack/react-router";
import { LookupPage } from "@/components/lookup-page";
import { inseminatorApi } from "@/lib/api";

export const Route = createFileRoute("/_auth/inseminators/")({
  component: InseminatorsPage,
});

function InseminatorsPage() {
  return (
    <LookupPage
      title="Inseminators"
      subtitle="Manage inseminator records"
      listTitle="Inseminator List"
      queryKey={["inseminators"]}
      queryFn={async () => {
        const res = await inseminatorApi.getAll();
        return res.data.data ?? [];
      }}
      toggleActiveFn={(id) => inseminatorApi.toggleActive(id)}
      createFn={(data) => inseminatorApi.create(data)}
      updateFn={(id, data) => inseminatorApi.update(id, data)}
      entityLabel="Inseminator"
      emptyMessage="No inseminators found."
      detailPath="/inseminators"
    />
  );
}
