import { Card } from "@/components/ui/card";

export type Player = {
  id: string;
  name: string;
  country: string;
  flag: string;
  points: number;
};

type PlayerListProps = {
  players: Player[];
  onPlayerSelect?: (player: Player) => void;
  selectedPlayerId?: string | null;
  maxSelections?: number;
};

export function PlayerList({
  players,
  onPlayerSelect,
  selectedPlayerId,
  maxSelections = 1,
}: PlayerListProps) {
  const handlePlayerClick = (player: Player) => {
    if (onPlayerSelect) {
      onPlayerSelect(player);
    }
  };

  const isPlayerSelected = (playerId: string) => {
    return selectedPlayerId === playerId;
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-2">
        {players.map((player) => {
          const isSelected = isPlayerSelected(player.id);
          const canSelect = !maxSelections || isSelected || !selectedPlayerId;

          return (
            <Card
              key={player.id}
              className={`p-2 transition-colors ${
                canSelect ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              } ${
                isSelected
                  ? "border-primary bg-primary/10 border-2"
                  : canSelect
                    ? "border-border hover:border-primary/50 border-2"
                    : "border-border border-2"
              }`}
              onClick={() => canSelect && handlePlayerClick(player)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{player.flag}</span>
                  <span className="font-medium text-sm">{player.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({player.country})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {player.points} pts
                  </span>
                  {isSelected && (
                    <span className="text-primary font-bold text-sm">✓</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
