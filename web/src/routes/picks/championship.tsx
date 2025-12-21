import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  PlayoffRoundComponent,
  type PlayoffRoundHandle,
} from "@/components/picks/playoff-round";
import { useRef } from "react";

export const Route = createFileRoute("/picks/championship")({
  component: ChampionshipPage,
});

function ChampionshipPage() {
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
    <PicksLayout slug="championship" onSubmit={handleSubmit} isValid={isValid}>
      <PlayoffRoundComponent ref={componentRef} stepSlug="championship" />
    </PicksLayout>
  );
}
