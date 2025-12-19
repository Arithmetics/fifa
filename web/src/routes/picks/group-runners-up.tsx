import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import { GroupRunnersUpComponent } from "@/components/picks/group-runners-up";

export const Route = createFileRoute("/picks/group-runners-up")({
  component: GroupRunnersUpPage,
});

function GroupRunnersUpPage() {
  return (
    <PicksLayout slug="group-runners-up">
      <GroupRunnersUpComponent />
    </PicksLayout>
  );
}
