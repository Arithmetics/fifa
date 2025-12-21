import { useState } from "react";
import { PlayerList, type Player } from "@/components/picks/player-list";
import { usePlayerAwardLines } from "@/lib/lines";
import { useBetsByLineId, useSubmitBets } from "@/lib/bets";
import { StepFooter } from "./step-footer";

const AWARD_TITLE_TO_KEY: Record<string, string> = {
  "Golden Boot (Top Scorer)": "golden-boot",
  "Golden Ball (Best Player)": "golden-ball",
  "Golden Glove (Best Goalkeeper)": "golden-glove",
  "FIFA Young Player Award": "young-player",
};

export function PlayerPicksComponent() {
  const { data: lines } = usePlayerAwardLines();
  const submitBets = useSubmitBets();

  // Get line IDs for each award
  const lineMap: Record<string, string> = {};
  if (lines) {
    lines.forEach((line) => {
      const key = AWARD_TITLE_TO_KEY[line.title];
      if (key) {
        lineMap[key] = line.id;
      }
    });
  }

  // Load bets for each line
  const goldenBootBets = useBetsByLineId(lineMap["golden-boot"] || "");
  const goldenBallBets = useBetsByLineId(lineMap["golden-ball"] || "");
  const goldenGloveBets = useBetsByLineId(lineMap["golden-glove"] || "");
  const youngPlayerBets = useBetsByLineId(lineMap["young-player"] || "");

  // Initialize state from bets on first render
  const [selectedChoices, setSelectedChoices] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {};
    const allBets = [
      { key: "golden-boot", bets: goldenBootBets.data },
      { key: "golden-ball", bets: goldenBallBets.data },
      { key: "golden-glove", bets: goldenGloveBets.data },
      { key: "young-player", bets: youngPlayerBets.data },
    ];

    allBets.forEach(({ key, bets }) => {
      if (bets && bets.length > 0) {
        initial[key] = bets[0].choiceId;
      }
    });

    return initial;
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert lines to player lists
  const awardPlayers: Record<string, Player[]> = {};
  if (lines) {
    lines.forEach((line) => {
      const key = AWARD_TITLE_TO_KEY[line.title];
      if (key) {
        awardPlayers[key] = line.choices.map((choice) => ({
          id: choice.id,
          name: choice.title,
          country: "",
          flag: choice.flag || "",
          points: choice.primaryPoints,
        }));
      }
    });
  }

  const progressCount = Object.keys(selectedChoices).filter(
    (k) => selectedChoices[k]
  ).length;
  const isValid =
    !!selectedChoices["golden-boot"] &&
    !!selectedChoices["golden-ball"] &&
    !!selectedChoices["golden-glove"] &&
    !!selectedChoices["young-player"];

  const handlePlayerSelect = (awardKey: string, choiceId: string) => {
    setSelectedChoices((prev) => ({
      ...prev,
      [awardKey]: choiceId,
    }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      const errorMessage = "Please select a player for all 4 awards";
      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
      throw new Error(errorMessage);
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await Promise.all([
        submitBets.mutateAsync({
          choiceIds: [selectedChoices["golden-boot"]!],
        }),
        submitBets.mutateAsync({
          choiceIds: [selectedChoices["golden-ball"]!],
        }),
        submitBets.mutateAsync({
          choiceIds: [selectedChoices["golden-glove"]!],
        }),
        submitBets.mutateAsync({
          choiceIds: [selectedChoices["young-player"]!],
        }),
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit bets";
      setError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lines || lines.length === 0) {
    return null;
  }

  const goldenBootLine = lines.find(
    (l) => l.title === "Golden Boot (Top Scorer)"
  );
  const goldenBallLine = lines.find(
    (l) => l.title === "Golden Ball (Best Player)"
  );
  const goldenGloveLine = lines.find(
    (l) => l.title === "Golden Glove (Best Goalkeeper)"
  );
  const youngPlayerLine = lines.find(
    (l) => l.title === "FIFA Young Player Award"
  );

  return (
    <>
      <div className="space-y-4 pb-32" id="player-picks-content-top">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goldenBootLine && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Golden Boot (Top Scorer)
              </h3>
              <PlayerList
                players={awardPlayers["golden-boot"] || []}
                onPlayerSelect={(player) =>
                  handlePlayerSelect("golden-boot", player.id)
                }
                selectedPlayerId={selectedChoices["golden-boot"]}
                maxSelections={1}
              />
            </div>
          )}

          {goldenBallLine && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Golden Ball (Best Player)
              </h3>
              <PlayerList
                players={awardPlayers["golden-ball"] || []}
                onPlayerSelect={(player) =>
                  handlePlayerSelect("golden-ball", player.id)
                }
                selectedPlayerId={selectedChoices["golden-ball"]}
                maxSelections={1}
              />
            </div>
          )}

          {goldenGloveLine && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Golden Glove (Best Goalkeeper)
              </h3>
              <PlayerList
                players={awardPlayers["golden-glove"] || []}
                onPlayerSelect={(player) =>
                  handlePlayerSelect("golden-glove", player.id)
                }
                selectedPlayerId={selectedChoices["golden-glove"]}
                maxSelections={1}
              />
            </div>
          )}

          {youngPlayerLine && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                FIFA Young Player Award
              </h3>
              <PlayerList
                players={awardPlayers["young-player"] || []}
                onPlayerSelect={(player) =>
                  handlePlayerSelect("young-player", player.id)
                }
                selectedPlayerId={selectedChoices["young-player"]}
                maxSelections={1}
              />
            </div>
          )}
        </div>
      </div>
      <StepFooter
        slug="player-picks"
        progress={progressCount}
        progressTotal={4}
        progressLabel="Awards Selected"
        isValid={isValid}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </>
  );
}
