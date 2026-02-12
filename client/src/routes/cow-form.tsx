import { createFileRoute } from "@tanstack/react-router";
import { CowForm } from "@/components/cow/cow-form";

export const Route = createFileRoute("/cow-form")({
  component: CowForm,
});
