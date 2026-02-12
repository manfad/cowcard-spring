import { createFileRoute } from "@tanstack/react-router";
import { CowPage } from "@/components/cow/cow-page";

export const Route = createFileRoute("/_auth/cows/")({
  component: CowPage,
});
