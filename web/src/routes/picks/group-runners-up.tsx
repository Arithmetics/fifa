import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  GroupRunnersUpComponent,
  type GroupRunnersUpHandle,
} from "@/components/picks/group-runners-up";
import { useRef } from "react";

export const Route = createFileRoute("/picks/group-runners-up")({
  component: GroupRunnersUpPage,
});

function GroupRunnersUpPage() {
  const componentRef = useRef<GroupRunnersUpHandle>(null);

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
      slug="group-runners-up"
      onSubmit={handleSubmit}
      isValid={isValid}
    >
      <GroupRunnersUpComponent ref={componentRef} />
    </PicksLayout>
  );
}
