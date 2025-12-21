import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  PlayoffRoundComponent,
  type PlayoffRoundHandle,
} from "@/components/picks/playoff-round";
import { useRef } from "react";

export const Route = createFileRoute("/picks/round-of-32")({
  component: RoundOf32Page,
});

function RoundOf32Page() {
  const componentRef = useRef<PlayoffRoundHandle>(null);

  const handleSubmit = async () => {
    if (componentRef.current) {
      await componentRef.current.submit();
    }
  };

  const isValid = () => {
    return componentRef.current?.isValid() ?? false;
  };

  return (
    <PicksLayout slug="round-of-32" onSubmit={handleSubmit} isValid={isValid}>
      <PlayoffRoundComponent ref={componentRef} stepSlug="round-of-32" />
    </PicksLayout>
  );
}
