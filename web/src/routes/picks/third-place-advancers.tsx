import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  ThirdPlaceAdvancersComponent,
  type ThirdPlaceAdvancersHandle,
} from "@/components/picks/third-place-advancers";
import { useRef } from "react";

export const Route = createFileRoute("/picks/third-place-advancers")({
  component: ThirdPlaceAdvancersPage,
});

function ThirdPlaceAdvancersPage() {
  const componentRef = useRef<ThirdPlaceAdvancersHandle>(null);

  const handleSubmit = async () => {
    if (componentRef.current) {
      await componentRef.current.submit();
    }
  };

  const isValid = () => {
    return componentRef.current?.isValid() ?? false;
  };

  return (
    <PicksLayout
      slug="third-place-advancers"
      onSubmit={handleSubmit}
      isValid={isValid}
    >
      <ThirdPlaceAdvancersComponent ref={componentRef} />
    </PicksLayout>
  );
}
