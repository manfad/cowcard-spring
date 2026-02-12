import { createFileRoute } from "@tanstack/react-router";
import { FeedlotManagementPage } from "@/components/feedlot/feedlot-management-page";

export const Route = createFileRoute("/_auth/feedlot-management/")({
  component: FeedlotManagementPage,
});
