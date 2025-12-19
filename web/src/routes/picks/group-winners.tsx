import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import { GroupWinnersComponent } from "@/components/picks/group-winners";

export const Route = createFileRoute("/picks/group-winners")({
  component: GroupWinnersPage,
});

function GroupWinnersPage() {
  return (
    <PicksLayout slug="group-winners">
      <GroupWinnersComponent />
    </PicksLayout>
  );
}
