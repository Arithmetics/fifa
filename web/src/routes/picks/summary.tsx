import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import { PicksSummary } from "@/components/picks/picks-summary";

export const Route = createFileRoute("/picks/summary")({
  component: SummaryPage,
});

function SummaryPage() {
  return (
    <PicksLayout slug="summary">
      <PicksSummary />
    </PicksLayout>
  );
}
