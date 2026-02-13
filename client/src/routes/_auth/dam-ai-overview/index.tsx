import { createFileRoute } from "@tanstack/react-router";
import { DamAiOverviewPage } from "@/components/dam-ai-overview/dam-ai-overview-page";

export const Route = createFileRoute("/_auth/dam-ai-overview/")({
  component: DamAiOverviewPage,
});
