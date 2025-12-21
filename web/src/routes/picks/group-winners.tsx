import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  GroupWinnersComponent,
  type GroupWinnersHandle,
} from "@/components/picks/group-winners";
import { useRef } from "react";

export const Route = createFileRoute("/picks/group-winners")({
  component: GroupWinnersPage,
});

function GroupWinnersPage() {
  const componentRef = useRef<GroupWinnersHandle>(null);

  const handleSubmit = async () => {
    if (componentRef.current) {
      await componentRef.current.submit();
    }
  };

  const isValid = () => {
    return componentRef.current?.isValid() ?? false;
  };

  return (
    <PicksLayout slug="group-winners" onSubmit={handleSubmit} isValid={isValid}>
      <GroupWinnersComponent ref={componentRef} />
    </PicksLayout>
  );
}
