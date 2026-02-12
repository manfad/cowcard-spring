import { createFileRoute } from "@tanstack/react-router";
import { colorApi } from "@/lib/api";
import { LookupPage } from "@/components/lookup-page";

export const Route = createFileRoute("/_auth/colors/")({
  component: ColorsPage,
});

function ColorsPage() {
  return (
    <LookupPage
      title="Colors"
      subtitle="Manage cow color classifications"
      listTitle="Color List"
      queryKey={["colors"]}
      queryFn={async () => {
        const res = await colorApi.getAll();
        return res.data.data ?? [];
      }}
      toggleActiveFn={(id) => colorApi.toggleActive(id)}
      createFn={(data) => colorApi.create(data)}
      updateFn={(id, data) => colorApi.update(id, data)}
      entityLabel="Color"
      emptyMessage="No colors found."
    />
  );
}
