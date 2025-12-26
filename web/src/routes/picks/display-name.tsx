import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import { DisplayNameComponent } from "@/components/picks/display-name";

export const Route = createFileRoute("/picks/display-name")({
  component: DisplayNamePage,
});

function DisplayNamePage() {
  return (
    <PicksLayout slug="display-name">
      <DisplayNameComponent />
    </PicksLayout>
  );
}

