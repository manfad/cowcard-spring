import { createFileRoute } from "@tanstack/react-router";
import { CalfForm } from "@/components/calf-form";

export const Route = createFileRoute("/calf-form")({
  component: CalfForm,
});
