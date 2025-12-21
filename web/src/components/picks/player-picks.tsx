import {
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import { PlayerList, type Player } from "@/components/picks/player-list";
import { usePlayerAwardLines } from "@/lib/lines";
import { useBetsByLineId, useSubmitBets } from "@/lib/bets";

export type PlayerPicksHandle = {
  submit: () => Promise<void>;
  isValid: () => boolean;
};

// Mapping from award title to key
const AWARD_TITLE_TO_KEY: Record<string, string> = {
  "Golden Boot (Top Scorer)": "golden-boot",
  "Golden Ball (Best Player)": "golden-ball",
  "Golden Glove (Best Goalkeeper)": "golden-glove",
  "FIFA Young Player Award": "young-player",
};

export const PlayerPicksComponent = forwardRef<PlayerPicksHandle>(
  function PlayerPicksComponent(_, ref) {
    const { data: lines, isLoading } = usePlayerAwardLines();
    const submitBets = useSubmitBets();

    // Map from award key to selected choice ID
    const [selectedChoices, setSelectedChoices] = useState<Map<string, string>>(
      new Map()
    );

    // Map from award key to line ID
    const lineMap = useMemo(() => {
      if (!lines) return new Map<string, string>();
      const map = new Map<string, string>();
      lines.forEach((line) => {
        const key = AWARD_TITLE_TO_KEY[line.title];
        if (key) {
          map.set(key, line.id);
        }
      });
      return map;
    }, [lines]);

    const goldenBootLineId = lineMap.get("golden-boot") || "";
    const goldenBallLineId = lineMap.get("golden-ball") || "";
    const goldenGloveLineId = lineMap.get("golden-glove") || "";
    const youngPlayerLineId = lineMap.get("young-player") || "";

    // Load bets for each line
    const goldenBootBets = useBetsByLineId(goldenBootLineId);
    const goldenBallBets = useBetsByLineId(goldenBallLineId);
    const goldenGloveBets = useBetsByLineId(goldenGloveLineId);
    const youngPlayerBets = useBetsByLineId(youngPlayerLineId);

    const [error, setError] = useState<string | null>(null);

    // Load existing bets into state
    useEffect(() => {
      if (!lines) return;

      const newSelected = new Map<string, string>();

      // Check each award's bets
      const allBets = [
        { key: "golden-boot", bets: goldenBootBets.data },
        { key: "golden-ball", bets: goldenBallBets.data },
        { key: "golden-glove", bets: goldenGloveBets.data },
        { key: "young-player", bets: youngPlayerBets.data },
      ];

      allBets.forEach(({ key, bets }) => {
        if (bets && bets.length > 0) {
          newSelected.set(key, bets[0].choiceId);
        }
      });

      setSelectedChoices(newSelected);
    }, [
      lines,
      goldenBootBets.data,
      goldenBallBets.data,
      goldenGloveBets.data,
      youngPlayerBets.data,
    ]);

    // Convert lines to player lists
    const awardPlayers = useMemo(() => {
      if (!lines) return new Map<string, Player[]>();

      const map = new Map<string, Player[]>();
      lines.forEach((line) => {
        const key = AWARD_TITLE_TO_KEY[line.title];
        if (key) {
          const players: Player[] = line.choices.map((choice) => ({
            id: choice.id,
            name: choice.title,
            country: "", // Not stored in choices
            flag: choice.flag || "",
            points: choice.primaryPoints,
          }));
          map.set(key, players);
        }
      });
      return map;
    }, [lines]);

    // Validation: must have all 4 awards selected
    const isValid = useMemo(() => {
      return (
        selectedChoices.has("golden-boot") &&
        selectedChoices.has("golden-ball") &&
        selectedChoices.has("golden-glove") &&
        selectedChoices.has("young-player")
      );
    }, [selectedChoices]);

    // Expose submit and isValid to parent
    useImperativeHandle(
      ref,
      () => ({
        submit: async () => {
          if (!isValid) {
            throw new Error("Please select a player for all 4 awards");
          }

          setError(null);

          try {
            // Submit each award separately (they're separate lines, so separate API calls)
            await Promise.all([
              submitBets.mutateAsync({
                choiceIds: [selectedChoices.get("golden-boot")!],
              }),
              submitBets.mutateAsync({
                choiceIds: [selectedChoices.get("golden-ball")!],
              }),
              submitBets.mutateAsync({
                choiceIds: [selectedChoices.get("golden-glove")!],
              }),
              submitBets.mutateAsync({
                choiceIds: [selectedChoices.get("young-player")!],
              }),
            ]);
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Failed to submit bets";
            setError(message);
            throw err;
          }
        },
        isValid: () => isValid,
      }),
      [isValid, selectedChoices, submitBets, lineMap]
    );

    const handlePlayerSelect = (awardKey: string, choiceId: string) => {
      const newSelected = new Map(selectedChoices);
      newSelected.set(awardKey, choiceId);
      setSelectedChoices(newSelected);
      setError(null);
    };

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading player data...</div>
        </div>
      );
    }

    if (!lines || lines.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">No player awards available</div>
        </div>
      );
    }

    // Get line for each award
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
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {!isValid && (
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-400">
            Please select a player for all 4 awards (
            {Array.from(selectedChoices.keys()).length}/4)
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Golden Boot */}
          {goldenBootLine && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Golden Boot (Top Scorer)
              </h3>
              <PlayerList
                players={awardPlayers.get("golden-boot") || []}
                onPlayerSelect={(player) =>
                  handlePlayerSelect("golden-boot", player.id)
                }
                selectedPlayerId={selectedChoices.get("golden-boot")}
                maxSelections={1}
              />
            </div>
          )}

          {/* Golden Ball */}
          {goldenBallLine && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Golden Ball (Best Player)
              </h3>
              <PlayerList
                players={awardPlayers.get("golden-ball") || []}
                onPlayerSelect={(player) =>
                  handlePlayerSelect("golden-ball", player.id)
                }
                selectedPlayerId={selectedChoices.get("golden-ball")}
                maxSelections={1}
              />
            </div>
          )}

          {/* Golden Glove */}
          {goldenGloveLine && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Golden Glove (Best Goalkeeper)
              </h3>
              <PlayerList
                players={awardPlayers.get("golden-glove") || []}
                onPlayerSelect={(player) =>
                  handlePlayerSelect("golden-glove", player.id)
                }
                selectedPlayerId={selectedChoices.get("golden-glove")}
                maxSelections={1}
              />
            </div>
          )}

          {/* FIFA Young Player Award */}
          {youngPlayerLine && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                FIFA Young Player Award
              </h3>
              <PlayerList
                players={awardPlayers.get("young-player") || []}
                onPlayerSelect={(player) =>
                  handlePlayerSelect("young-player", player.id)
                }
                selectedPlayerId={selectedChoices.get("young-player")}
                maxSelections={1}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);
