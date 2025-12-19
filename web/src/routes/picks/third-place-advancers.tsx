import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import { ThirdPlaceAdvancersComponent } from "@/components/picks/third-place-advancers";

export const Route = createFileRoute("/picks/third-place-advancers")({
  component: ThirdPlaceAdvancersPage,
});

function ThirdPlaceAdvancersPage() {
  return (
    <PicksLayout slug="third-place-advancers">
      <ThirdPlaceAdvancersComponent />
    </PicksLayout>
  );
}
