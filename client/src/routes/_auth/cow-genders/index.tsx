import { createFileRoute } from "@tanstack/react-router";
import { cowGenderApi } from "@/lib/api";
import { LookupPage } from "@/components/lookup-page";

export const Route = createFileRoute("/_auth/cow-genders/")({
  component: CowGendersPage,
});

function CowGendersPage() {
  return (
    <LookupPage
      title="Cow Genders"
      subtitle="Manage cow gender classifications"
      listTitle="Cow Gender List"
      queryKey={["cow-genders"]}
      queryFn={async () => {
        const res = await cowGenderApi.getAll();
        return res.data.data ?? [];
      }}
      toggleActiveFn={(id) => cowGenderApi.toggleActive(id)}
      createFn={(data) => cowGenderApi.create(data)}
      updateFn={(id, data) => cowGenderApi.update(id, data)}
      entityLabel="Cow Gender"
      emptyMessage="No cow genders found."
      detailPath="/cow-genders"
    />
  );
}
