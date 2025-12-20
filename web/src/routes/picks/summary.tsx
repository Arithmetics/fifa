import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import { PicksSummary } from "@/components/picks/picks-summary";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Edit } from "lucide-react";

export const Route = createFileRoute("/picks/summary")({
  component: SummaryPage,
});

function SummaryPage() {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate({ to: "/picks/group-winners" as any });
  };

  return (
    <PicksLayout slug="summary">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={handleEdit} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Picks
          </Button>
        </div>
        <PicksSummary />
      </div>
    </PicksLayout>
  );
}
