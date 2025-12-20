import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GROUPS,
  GROUP_WINNERS_STORAGE_KEY,
  GROUP_RUNNERS_UP_STORAGE_KEY,
  THIRD_PLACE_STORAGE_KEY,
  type GroupWinnersState,
  type GroupRunnersUpState,
  type ThirdPlaceAdvancersState,
} from "@/lib/picks-data";
import { useEffect, useState } from "react";

const ROUND_OF_32_STORAGE_KEY = "fifa_round_of_32_winners";
const ROUND_OF_16_STORAGE_KEY = "fifa_round_of_16_winners";
const QUARTERFINALS_STORAGE_KEY = "fifa_quarterfinals_winners";
const SEMIFINALS_STORAGE_KEY = "fifa_semifinals_winners";
const CHAMPIONSHIP_STORAGE_KEY = "fifa_championship_winner";
const PLAYER_PICKS_STORAGE_KEY = "fifa_player_picks";

// Fake team data for bracket display
const TEAM_DATA: Record<
  string,
  { name: string; flag: string; points: number }
> = {
  // Round of 32
  "1": { name: "Brazil", flag: "🇧🇷", points: 15 },
  "2": { name: "Argentina", flag: "🇦🇷", points: 14 },
  "3": { name: "France", flag: "🇫🇷", points: 13 },
  "4": { name: "Spain", flag: "🇪🇸", points: 12 },
  "5": { name: "Germany", flag: "🇩🇪", points: 11 },
  "6": { name: "Italy", flag: "🇮🇹", points: 10 },
  "7": { name: "Portugal", flag: "🇵🇹", points: 9 },
  "8": { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 8 },
  "9": { name: "Netherlands", flag: "🇳🇱", points: 7 },
  "10": { name: "Belgium", flag: "🇧🇪", points: 6 },
  "11": { name: "Croatia", flag: "🇭🇷", points: 5 },
  "12": { name: "Uruguay", flag: "🇺🇾", points: 4 },
  "13": { name: "Mexico", flag: "🇲🇽", points: 3 },
  "14": { name: "Japan", flag: "🇯🇵", points: 2 },
  "15": { name: "South Korea", flag: "🇰🇷", points: 1 },
  "16": { name: "Morocco", flag: "🇲🇦", points: 0 },
  "17": { name: "Senegal", flag: "🇸🇳", points: 0 },
  "18": { name: "USA", flag: "🇺🇸", points: 1 },
  "19": { name: "Colombia", flag: "🇨🇴", points: 2 },
  "20": { name: "Chile", flag: "🇨🇱", points: 3 },
  "21": { name: "Denmark", flag: "🇩🇰", points: 4 },
  "22": { name: "Switzerland", flag: "🇨🇭", points: 5 },
  "23": { name: "Sweden", flag: "🇸🇪", points: 6 },
  "24": { name: "Poland", flag: "🇵🇱", points: 7 },
  "25": { name: "Serbia", flag: "🇷🇸", points: 8 },
  "26": { name: "Ukraine", flag: "🇺🇦", points: 9 },
  "27": { name: "Czech Republic", flag: "🇨🇿", points: 10 },
  "28": { name: "Austria", flag: "🇦🇹", points: 11 },
  "29": { name: "Nigeria", flag: "🇳🇬", points: 12 },
  "30": { name: "Algeria", flag: "🇩🇿", points: 13 },
  "31": { name: "Egypt", flag: "🇪🇬", points: 14 },
  "32": { name: "Ghana", flag: "🇬🇭", points: 15 },
  // Round of 16
  "r16-1": { name: "Brazil", flag: "🇧🇷", points: 20 },
  "r16-2": { name: "Argentina", flag: "🇦🇷", points: 19 },
  "r16-3": { name: "France", flag: "🇫🇷", points: 18 },
  "r16-4": { name: "Spain", flag: "🇪🇸", points: 17 },
  "r16-5": { name: "Germany", flag: "🇩🇪", points: 16 },
  "r16-6": { name: "Italy", flag: "🇮🇹", points: 15 },
  "r16-7": { name: "Portugal", flag: "🇵🇹", points: 14 },
  "r16-8": { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 13 },
  "r16-9": { name: "Netherlands", flag: "🇳🇱", points: 12 },
  "r16-10": { name: "Belgium", flag: "🇧🇪", points: 11 },
  "r16-11": { name: "Croatia", flag: "🇭🇷", points: 10 },
  "r16-12": { name: "Uruguay", flag: "🇺🇾", points: 9 },
  "r16-13": { name: "Mexico", flag: "🇲🇽", points: 8 },
  "r16-14": { name: "Japan", flag: "🇯🇵", points: 7 },
  "r16-15": { name: "USA", flag: "🇺🇸", points: 6 },
  "r16-16": { name: "Colombia", flag: "🇨🇴", points: 5 },
  // Quarterfinals
  "qf-1": { name: "Brazil", flag: "🇧🇷", points: 25 },
  "qf-2": { name: "Argentina", flag: "🇦🇷", points: 24 },
  "qf-3": { name: "France", flag: "🇫🇷", points: 23 },
  "qf-4": { name: "Spain", flag: "🇪🇸", points: 22 },
  "qf-5": { name: "Germany", flag: "🇩🇪", points: 21 },
  "qf-6": { name: "Italy", flag: "🇮🇹", points: 20 },
  "qf-7": { name: "Portugal", flag: "🇵🇹", points: 19 },
  "qf-8": { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 18 },
  // Semifinals
  "sf-1": { name: "Brazil", flag: "🇧🇷", points: 30 },
  "sf-2": { name: "Argentina", flag: "🇦🇷", points: 29 },
  "sf-3": { name: "France", flag: "🇫🇷", points: 28 },
  "sf-4": { name: "Spain", flag: "🇪🇸", points: 27 },
  // Championship
  "champ-1": { name: "Brazil", flag: "🇧🇷", points: 50 },
  "champ-2": { name: "Argentina", flag: "🇦🇷", points: 45 },
};

// Fake player data
const PLAYER_DATA: Record<
  string,
  { name: string; country: string; flag: string; points: number }
> = {
  // Golden Boot
  mbappe: { name: "Kylian Mbappé", country: "France", flag: "🇫🇷", points: 30 },
  messi: { name: "Lionel Messi", country: "Argentina", flag: "🇦🇷", points: 28 },
  ronaldo: {
    name: "Cristiano Ronaldo",
    country: "Portugal",
    flag: "🇵🇹",
    points: 27,
  },
  haaland: {
    name: "Erling Haaland",
    country: "Norway",
    flag: "🇳🇴",
    points: 25,
  },
  kane: { name: "Harry Kane", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 24 },
  vinicius: {
    name: "Vinícius Júnior",
    country: "Brazil",
    flag: "🇧🇷",
    points: 23,
  },
  benzema: { name: "Karim Benzema", country: "France", flag: "🇫🇷", points: 22 },
  lewandowski: {
    name: "Robert Lewandowski",
    country: "Poland",
    flag: "🇵🇱",
    points: 21,
  },
  neymar: { name: "Neymar Jr", country: "Brazil", flag: "🇧🇷", points: 20 },
  salah: { name: "Mohamed Salah", country: "Egypt", flag: "🇪🇬", points: 19 },
  son: {
    name: "Son Heung-min",
    country: "South Korea",
    flag: "🇰🇷",
    points: 18,
  },
  debruyne: {
    name: "Kevin De Bruyne",
    country: "Belgium",
    flag: "🇧🇪",
    points: 17,
  },
  modric: { name: "Luka Modrić", country: "Croatia", flag: "🇭🇷", points: 16 },
  bellingham: {
    name: "Jude Bellingham",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 15,
  },
  pedri: { name: "Pedri", country: "Spain", flag: "🇪🇸", points: 14 },
  gavi: { name: "Gavi", country: "Spain", flag: "🇪🇸", points: 13 },
  foden: { name: "Phil Foden", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 12 },
  // Golden Ball
  "messi-ball": {
    name: "Lionel Messi",
    country: "Argentina",
    flag: "🇦🇷",
    points: 40,
  },
  "mbappe-ball": {
    name: "Kylian Mbappé",
    country: "France",
    flag: "🇫🇷",
    points: 38,
  },
  "modric-ball": {
    name: "Luka Modrić",
    country: "Croatia",
    flag: "🇭🇷",
    points: 36,
  },
  "debruyne-ball": {
    name: "Kevin De Bruyne",
    country: "Belgium",
    flag: "🇧🇪",
    points: 35,
  },
  "bellingham-ball": {
    name: "Jude Bellingham",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 34,
  },
  "vinicius-ball": {
    name: "Vinícius Júnior",
    country: "Brazil",
    flag: "🇧🇷",
    points: 33,
  },
  "pedri-ball": { name: "Pedri", country: "Spain", flag: "🇪🇸", points: 32 },
  "musiala-ball": {
    name: "Jamal Musiala",
    country: "Germany",
    flag: "🇩🇪",
    points: 31,
  },
  "gavi-ball": { name: "Gavi", country: "Spain", flag: "🇪🇸", points: 30 },
  "foden-ball": {
    name: "Phil Foden",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 29,
  },
  // Golden Glove
  martinez: {
    name: "Emiliano Martínez",
    country: "Argentina",
    flag: "🇦🇷",
    points: 25,
  },
  courtois: {
    name: "Thibaut Courtois",
    country: "Belgium",
    flag: "🇧🇪",
    points: 24,
  },
  alisson: {
    name: "Alisson Becker",
    country: "Brazil",
    flag: "🇧🇷",
    points: 23,
  },
  neuer: { name: "Manuel Neuer", country: "Germany", flag: "🇩🇪", points: 22 },
  donnarumma: {
    name: "Gianluigi Donnarumma",
    country: "Italy",
    flag: "🇮🇹",
    points: 21,
  },
  oblak: { name: "Jan Oblak", country: "Slovenia", flag: "🇸🇮", points: 20 },
  terstegen: {
    name: "Marc-André ter Stegen",
    country: "Germany",
    flag: "🇩🇪",
    points: 19,
  },
  ederson: { name: "Ederson", country: "Brazil", flag: "🇧🇷", points: 18 },
  mendy: { name: "Édouard Mendy", country: "Senegal", flag: "🇸🇳", points: 17 },
  pickford: {
    name: "Jordan Pickford",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 16,
  },
  // Young Player
  "bellingham-yp": {
    name: "Jude Bellingham",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 20,
  },
  "pedri-yp": { name: "Pedri", country: "Spain", flag: "🇪🇸", points: 19 },
  "gavi-yp": { name: "Gavi", country: "Spain", flag: "🇪🇸", points: 18 },
  "musiala-yp": {
    name: "Jamal Musiala",
    country: "Germany",
    flag: "🇩🇪",
    points: 17,
  },
  "foden-yp": {
    name: "Phil Foden",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 16,
  },
  "saka-yp": {
    name: "Bukayo Saka",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 15,
  },
  "camavinga-yp": {
    name: "Eduardo Camavinga",
    country: "France",
    flag: "🇫🇷",
    points: 14,
  },
  "wirtz-yp": {
    name: "Florian Wirtz",
    country: "Germany",
    flag: "🇩🇪",
    points: 13,
  },
  "endrick-yp": { name: "Endrick", country: "Brazil", flag: "🇧🇷", points: 12 },
  "yamal-yp": {
    name: "Lamine Yamal",
    country: "Spain",
    flag: "🇪🇸",
    points: 11,
  },
};

export function PicksSummary() {
  const [groupWinners, setGroupWinners] = useState<GroupWinnersState>({});
  const [groupRunnersUp, setGroupRunnersUp] = useState<GroupRunnersUpState>({});
  const [thirdPlaceAdvancers, setThirdPlaceAdvancers] =
    useState<ThirdPlaceAdvancersState>({});
  const [roundOf32, setRoundOf32] = useState<string[]>([]);
  const [roundOf16, setRoundOf16] = useState<string[]>([]);
  const [quarterfinals, setQuarterfinals] = useState<string[]>([]);
  const [semifinals, setSemifinals] = useState<string[]>([]);
  const [championship, setChampionship] = useState<string[]>([]);
  const [playerPicks, setPlayerPicks] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load all picks from localStorage
    const loadPicks = () => {
      const gw = localStorage.getItem(GROUP_WINNERS_STORAGE_KEY);
      const gru = localStorage.getItem(GROUP_RUNNERS_UP_STORAGE_KEY);
      const tpa = localStorage.getItem(THIRD_PLACE_STORAGE_KEY);
      const r32 = localStorage.getItem(ROUND_OF_32_STORAGE_KEY);
      const r16 = localStorage.getItem(ROUND_OF_16_STORAGE_KEY);
      const qf = localStorage.getItem(QUARTERFINALS_STORAGE_KEY);
      const sf = localStorage.getItem(SEMIFINALS_STORAGE_KEY);
      const champ = localStorage.getItem(CHAMPIONSHIP_STORAGE_KEY);
      const pp = localStorage.getItem(PLAYER_PICKS_STORAGE_KEY);

      setGroupWinners(gw ? JSON.parse(gw) : {});
      setGroupRunnersUp(gru ? JSON.parse(gru) : {});
      setThirdPlaceAdvancers(tpa ? JSON.parse(tpa) : {});
      setRoundOf32(r32 ? JSON.parse(r32) : []);
      setRoundOf16(r16 ? JSON.parse(r16) : []);
      setQuarterfinals(qf ? JSON.parse(qf) : []);
      setSemifinals(sf ? JSON.parse(sf) : []);
      setChampionship(champ ? JSON.parse(champ) : []);
      setPlayerPicks(pp ? JSON.parse(pp) : {});
    };

    loadPicks();
    // Listen for storage changes
    window.addEventListener("storage", loadPicks);
    return () => window.removeEventListener("storage", loadPicks);
  }, []);

  // Helper to get advancing teams for a group
  const getAdvancingTeams = (groupLetter: string) => {
    const winner = groupWinners[groupLetter];
    const runnerUp = groupRunnersUp[groupLetter];
    const thirdPlace = thirdPlaceAdvancers[groupLetter] || [];
    return { winner, runnerUp, thirdPlace };
  };

  // Helper to check if a team advances
  const isAdvancing = (groupLetter: string, countryName: string) => {
    const { winner, runnerUp, thirdPlace } = getAdvancingTeams(groupLetter);
    return (
      countryName === winner ||
      countryName === runnerUp ||
      thirdPlace.includes(countryName)
    );
  };

  // Helper to get matchups for a round
  const getRoundMatchups = (round: string, _selectedTeamIds: string[]) => {
    const matchups: Array<{
      team1: string;
      team2: string;
      team1Id: string;
      team2Id: string;
    }> = [];

    if (round === "round-of-32") {
      // Matchups: teams 1-16 vs teams 17-32
      for (let i = 0; i < 16; i++) {
        const team1Id = String(i + 1);
        const team2Id = String(i + 17);
        matchups.push({ team1: team1Id, team2: team2Id, team1Id, team2Id });
      }
    } else if (round === "round-of-16") {
      // Matchups: teams 1-8 vs teams 9-16
      for (let i = 0; i < 8; i++) {
        const team1Id = `r16-${i + 1}`;
        const team2Id = `r16-${i + 9}`;
        matchups.push({ team1: team1Id, team2: team2Id, team1Id, team2Id });
      }
    } else if (round === "quarterfinals") {
      // Matchups: teams 1-4 vs teams 5-8
      for (let i = 0; i < 4; i++) {
        const team1Id = `qf-${i + 1}`;
        const team2Id = `qf-${i + 5}`;
        matchups.push({ team1: team1Id, team2: team2Id, team1Id, team2Id });
      }
    } else if (round === "semifinals") {
      // Matchups: teams 1-2 vs teams 3-4
      for (let i = 0; i < 2; i++) {
        const team1Id = `sf-${i + 1}`;
        const team2Id = `sf-${i + 3}`;
        matchups.push({ team1: team1Id, team2: team2Id, team1Id, team2Id });
      }
    } else if (round === "championship") {
      // Single matchup
      matchups.push({
        team1: "champ-1",
        team2: "champ-2",
        team1Id: "champ-1",
        team2Id: "champ-2",
      });
    }

    return matchups;
  };

  return (
    <div className="space-y-6">
      {/* Bracket Summary - Most Important First */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Championship */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Championship</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {championship.length > 0 ? (
                getRoundMatchups("championship", championship).map(
                  (matchup, idx) => {
                    const team1 = TEAM_DATA[matchup.team1Id];
                    const team2 = TEAM_DATA[matchup.team2Id];
                    const team1Selected = championship.includes(
                      matchup.team1Id
                    );
                    const team2Selected = championship.includes(
                      matchup.team2Id
                    );

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className={
                            team1Selected ? "" : "line-through opacity-50"
                          }
                        >
                          {team1?.flag} {team1?.name}
                          {team1?.points !== undefined && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({team1.points} pts)
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground">vs</span>
                        <span
                          className={
                            team2Selected ? "" : "line-through opacity-50"
                          }
                        >
                          {team2?.flag} {team2?.name}
                          {team2?.points !== undefined && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({team2.points} pts)
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  }
                )
              ) : (
                <span className="text-sm text-muted-foreground">
                  No picks yet
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Semifinals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Semifinals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {semifinals.length > 0 ? (
                getRoundMatchups("semifinals", semifinals).map(
                  (matchup, idx) => {
                    const team1 = TEAM_DATA[matchup.team1Id];
                    const team2 = TEAM_DATA[matchup.team2Id];
                    const team1Selected = semifinals.includes(matchup.team1Id);
                    const team2Selected = semifinals.includes(matchup.team2Id);

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className={
                            team1Selected ? "" : "line-through opacity-50"
                          }
                        >
                          {team1?.flag} {team1?.name}
                          {team1?.points !== undefined && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({team1.points} pts)
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground">vs</span>
                        <span
                          className={
                            team2Selected ? "" : "line-through opacity-50"
                          }
                        >
                          {team2?.flag} {team2?.name}
                          {team2?.points !== undefined && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({team2.points} pts)
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  }
                )
              ) : (
                <span className="text-sm text-muted-foreground">
                  No picks yet
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quarterfinals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quarterfinals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quarterfinals.length > 0 ? (
                getRoundMatchups("quarterfinals", quarterfinals).map(
                  (matchup, idx) => {
                    const team1 = TEAM_DATA[matchup.team1Id];
                    const team2 = TEAM_DATA[matchup.team2Id];
                    const team1Selected = quarterfinals.includes(
                      matchup.team1Id
                    );
                    const team2Selected = quarterfinals.includes(
                      matchup.team2Id
                    );

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className={
                            team1Selected ? "" : "line-through opacity-50"
                          }
                        >
                          {team1?.flag} {team1?.name}
                          {team1?.points !== undefined && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({team1.points} pts)
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground">vs</span>
                        <span
                          className={
                            team2Selected ? "" : "line-through opacity-50"
                          }
                        >
                          {team2?.flag} {team2?.name}
                          {team2?.points !== undefined && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({team2.points} pts)
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  }
                )
              ) : (
                <span className="text-sm text-muted-foreground">
                  No picks yet
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Round of 16 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Round of 16</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roundOf16.length > 0 ? (
                getRoundMatchups("round-of-16", roundOf16).map(
                  (matchup, idx) => {
                    const team1 = TEAM_DATA[matchup.team1Id];
                    const team2 = TEAM_DATA[matchup.team2Id];
                    const team1Selected = roundOf16.includes(matchup.team1Id);
                    const team2Selected = roundOf16.includes(matchup.team2Id);

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className={
                            team1Selected ? "" : "line-through opacity-50"
                          }
                        >
                          {team1?.flag} {team1?.name}
                          {team1?.points !== undefined && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({team1.points} pts)
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground">vs</span>
                        <span
                          className={
                            team2Selected ? "" : "line-through opacity-50"
                          }
                        >
                          {team2?.flag} {team2?.name}
                          {team2?.points !== undefined && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({team2.points} pts)
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  }
                )
              ) : (
                <span className="text-sm text-muted-foreground">
                  No picks yet
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Round of 32 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Round of 32</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roundOf32.length > 0 ? (
                getRoundMatchups("round-of-32", roundOf32).map(
                  (matchup, idx) => {
                    const team1 = TEAM_DATA[matchup.team1Id];
                    const team2 = TEAM_DATA[matchup.team2Id];
                    const team1Selected = roundOf32.includes(matchup.team1Id);
                    const team2Selected = roundOf32.includes(matchup.team2Id);

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className={
                            team1Selected ? "" : "line-through opacity-50"
                          }
                        >
                          {team1?.flag} {team1?.name}
                          {team1?.points !== undefined && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({team1.points} pts)
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground">vs</span>
                        <span
                          className={
                            team2Selected ? "" : "line-through opacity-50"
                          }
                        >
                          {team2?.flag} {team2?.name}
                          {team2?.points !== undefined && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({team2.points} pts)
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  }
                )
              ) : (
                <span className="text-sm text-muted-foreground">
                  No picks yet
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Awards Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Player Awards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playerPicks["golden-boot"] && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Golden Boot</h4>
                {(() => {
                  const player = PLAYER_DATA[playerPicks["golden-boot"]];
                  return player ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{player.flag}</span>
                      <span>{player.name}</span>
                      {player.points !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({player.points} pts)
                        </span>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            {playerPicks["golden-ball"] && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Golden Ball</h4>
                {(() => {
                  const player = PLAYER_DATA[playerPicks["golden-ball"]];
                  return player ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{player.flag}</span>
                      <span>{player.name}</span>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            {playerPicks["golden-glove"] && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Golden Glove</h4>
                {(() => {
                  const player = PLAYER_DATA[playerPicks["golden-glove"]];
                  return player ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{player.flag}</span>
                      <span>{player.name}</span>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            {playerPicks["young-player"] && (
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Young Player Award
                </h4>
                {(() => {
                  const player = PLAYER_DATA[playerPicks["young-player"]];
                  return player ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{player.flag}</span>
                      <span>{player.name}</span>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Group Stage Summary - Compact */}
      <Card>
        <CardHeader>
          <CardTitle>Group Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {Object.entries(GROUPS).map(([groupLetter, countries]) => {
              const { winner, runnerUp, thirdPlace } =
                getAdvancingTeams(groupLetter);

              // Determine standings for each country
              const getStanding = (countryName: string): number => {
                if (countryName === winner) return 1;
                if (countryName === runnerUp) return 2;
                if (thirdPlace.includes(countryName)) return 3;
                return 4;
              };

              // Get points for each country
              const getPoints = (countryName: string): number | null => {
                if (countryName === winner) {
                  const country = countries.find((c) => c.name === countryName);
                  return country?.winGroupPoints ?? null;
                }
                if (
                  countryName === runnerUp ||
                  thirdPlace.includes(countryName)
                ) {
                  const country = countries.find((c) => c.name === countryName);
                  return country?.qualifyPoints ?? null;
                }
                return null;
              };

              // Sort countries by standing
              const sortedCountries = [...countries].sort((a, b) => {
                return getStanding(a.name) - getStanding(b.name);
              });

              return (
                <div key={groupLetter} className="border rounded p-2">
                  <h4 className="font-semibold mb-1.5 text-xs">
                    Group {groupLetter}
                  </h4>
                  <div className="space-y-0.5">
                    {sortedCountries.map((country) => {
                      const advances = isAdvancing(groupLetter, country.name);
                      const standing = getStanding(country.name);
                      const points = getPoints(country.name);

                      return (
                        <div
                          key={country.name}
                          className={`flex items-center gap-1 text-xs ${
                            advances
                              ? "font-semibold"
                              : "text-muted-foreground line-through opacity-60"
                          }`}
                        >
                          <span className="text-xs font-bold w-3">
                            {standing}.
                          </span>
                          <span className="text-sm">{country.flag}</span>
                          <span className="truncate flex-1">
                            {country.name}
                          </span>
                          {points !== null && (
                            <span className="text-xs text-muted-foreground">
                              {points}
                            </span>
                          )}
                          {advances && (
                            <span className="text-primary text-xs">✓</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
