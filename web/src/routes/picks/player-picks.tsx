import { createFileRoute } from "@tanstack/react-router";
import { PicksLayout } from "@/components/picks/picks-layout";
import {
  PlayerPicksComponent,
  type PlayerPicksHandle,
} from "@/components/picks/player-picks";
import { useRef } from "react";

// Fake data for player awards - Golden Boot (top scorer)
const FAKE_GOLDEN_BOOT_PLAYERS: Player[] = [
  {
    id: "mbappe",
    name: "Kylian Mbappé",
    country: "France",
    flag: "🇫🇷",
    points: 30,
  },
  {
    id: "messi",
    name: "Lionel Messi",
    country: "Argentina",
    flag: "🇦🇷",
    points: 28,
  },
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    country: "Portugal",
    flag: "🇵🇹",
    points: 27,
  },
  {
    id: "haaland",
    name: "Erling Haaland",
    country: "Norway",
    flag: "🇳🇴",
    points: 25,
  },
  {
    id: "kane",
    name: "Harry Kane",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 24,
  },
  {
    id: "vinicius",
    name: "Vinícius Júnior",
    country: "Brazil",
    flag: "🇧🇷",
    points: 23,
  },
  {
    id: "benzema",
    name: "Karim Benzema",
    country: "France",
    flag: "🇫🇷",
    points: 22,
  },
  {
    id: "lewandowski",
    name: "Robert Lewandowski",
    country: "Poland",
    flag: "🇵🇱",
    points: 21,
  },
  {
    id: "neymar",
    name: "Neymar Jr",
    country: "Brazil",
    flag: "🇧🇷",
    points: 20,
  },
  {
    id: "salah",
    name: "Mohamed Salah",
    country: "Egypt",
    flag: "🇪🇬",
    points: 19,
  },
  {
    id: "son",
    name: "Son Heung-min",
    country: "South Korea",
    flag: "🇰🇷",
    points: 18,
  },
  {
    id: "debruyne",
    name: "Kevin De Bruyne",
    country: "Belgium",
    flag: "🇧🇪",
    points: 17,
  },
  {
    id: "modric",
    name: "Luka Modrić",
    country: "Croatia",
    flag: "🇭🇷",
    points: 16,
  },
  {
    id: "bellingham",
    name: "Jude Bellingham",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 15,
  },
  { id: "pedri", name: "Pedri", country: "Spain", flag: "🇪🇸", points: 14 },
  { id: "gavi", name: "Gavi", country: "Spain", flag: "🇪🇸", points: 13 },
  {
    id: "foden",
    name: "Phil Foden",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 12,
  },
].slice(0, 10);

// Fake data for Golden Ball (best player)
const FAKE_GOLDEN_BALL_PLAYERS: Player[] = [
  {
    id: "messi-ball",
    name: "Lionel Messi",
    country: "Argentina",
    flag: "🇦🇷",
    points: 40,
  },
  {
    id: "mbappe-ball",
    name: "Kylian Mbappé",
    country: "France",
    flag: "🇫🇷",
    points: 38,
  },
  {
    id: "modric-ball",
    name: "Luka Modrić",
    country: "Croatia",
    flag: "🇭🇷",
    points: 36,
  },
  {
    id: "debruyne-ball",
    name: "Kevin De Bruyne",
    country: "Belgium",
    flag: "🇧🇪",
    points: 35,
  },
  {
    id: "bellingham-ball",
    name: "Jude Bellingham",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 34,
  },
  {
    id: "vinicius-ball",
    name: "Vinícius Júnior",
    country: "Brazil",
    flag: "🇧🇷",
    points: 33,
  },
  { id: "pedri-ball", name: "Pedri", country: "Spain", flag: "🇪🇸", points: 32 },
  {
    id: "musiala-ball",
    name: "Jamal Musiala",
    country: "Germany",
    flag: "🇩🇪",
    points: 31,
  },
  { id: "gavi-ball", name: "Gavi", country: "Spain", flag: "🇪🇸", points: 30 },
  {
    id: "foden-ball",
    name: "Phil Foden",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 29,
  },
].slice(0, 10);

// Fake data for Golden Glove (best goalkeeper)
const FAKE_GOLDEN_GLOVE_PLAYERS: Player[] = [
  {
    id: "martinez",
    name: "Emiliano Martínez",
    country: "Argentina",
    flag: "🇦🇷",
    points: 25,
  },
  {
    id: "courtois",
    name: "Thibaut Courtois",
    country: "Belgium",
    flag: "🇧🇪",
    points: 24,
  },
  {
    id: "alisson",
    name: "Alisson Becker",
    country: "Brazil",
    flag: "🇧🇷",
    points: 23,
  },
  {
    id: "neuer",
    name: "Manuel Neuer",
    country: "Germany",
    flag: "🇩🇪",
    points: 22,
  },
  {
    id: "donnarumma",
    name: "Gianluigi Donnarumma",
    country: "Italy",
    flag: "🇮🇹",
    points: 21,
  },
  {
    id: "oblak",
    name: "Jan Oblak",
    country: "Slovenia",
    flag: "🇸🇮",
    points: 20,
  },
  {
    id: "terstegen",
    name: "Marc-André ter Stegen",
    country: "Germany",
    flag: "🇩🇪",
    points: 19,
  },
  { id: "ederson", name: "Ederson", country: "Brazil", flag: "🇧🇷", points: 18 },
  {
    id: "mendy",
    name: "Édouard Mendy",
    country: "Senegal",
    flag: "🇸🇳",
    points: 17,
  },
  {
    id: "pickford",
    name: "Jordan Pickford",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 16,
  },
].slice(0, 10);

// Fake data for FIFA Young Player Award
const FAKE_YOUNG_PLAYER_PLAYERS: Player[] = [
  {
    id: "bellingham-yp",
    name: "Jude Bellingham",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 20,
  },
  { id: "pedri-yp", name: "Pedri", country: "Spain", flag: "🇪🇸", points: 19 },
  { id: "gavi-yp", name: "Gavi", country: "Spain", flag: "🇪🇸", points: 18 },
  {
    id: "musiala-yp",
    name: "Jamal Musiala",
    country: "Germany",
    flag: "🇩🇪",
    points: 17,
  },
  {
    id: "foden-yp",
    name: "Phil Foden",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 16,
  },
  {
    id: "saka-yp",
    name: "Bukayo Saka",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    points: 15,
  },
  {
    id: "camavinga-yp",
    name: "Eduardo Camavinga",
    country: "France",
    flag: "🇫🇷",
    points: 14,
  },
  {
    id: "wirtz-yp",
    name: "Florian Wirtz",
    country: "Germany",
    flag: "🇩🇪",
    points: 13,
  },
  {
    id: "endrick-yp",
    name: "Endrick",
    country: "Brazil",
    flag: "🇧🇷",
    points: 12,
  },
  {
    id: "yamal-yp",
    name: "Lamine Yamal",
    country: "Spain",
    flag: "🇪🇸",
    points: 11,
  },
].slice(0, 10);

export const Route = createFileRoute("/picks/player-picks")({
  component: PlayerPicksPage,
});

function PlayerPicksPage() {
  const componentRef = useRef<PlayerPicksHandle>(null);

  const handleSubmit = async () => {
    if (componentRef.current) {
      await componentRef.current.submit();
    }
  };

  const isValid = () => {
    return componentRef.current?.isValid() ?? false;
  };

  return (
    <PicksLayout slug="player-picks" onSubmit={handleSubmit} isValid={isValid}>
      <PlayerPicksComponent ref={componentRef} />
    </PicksLayout>
  );
}
