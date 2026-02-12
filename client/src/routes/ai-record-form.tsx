import { createFileRoute } from "@tanstack/react-router";
import { AiRecordForm } from "@/components/ai-record/ai-record-form";

export const Route = createFileRoute("/ai-record-form")({
  component: AiRecordForm,
});
