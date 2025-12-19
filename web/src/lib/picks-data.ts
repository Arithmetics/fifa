// Fake country data for groups
export const FAKE_COUNTRIES = [
  { name: "Brazil", flag: "🇧🇷", points: 100 },
  { name: "Argentina", flag: "🇦🇷", points: 95 },
  { name: "France", flag: "🇫🇷", points: 90 },
  { name: "Spain", flag: "🇪🇸", points: 85 },
  { name: "Germany", flag: "🇩🇪", points: 88 },
  { name: "Italy", flag: "🇮🇹", points: 82 },
  { name: "Portugal", flag: "🇵🇹", points: 80 },
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 87 },
  { name: "Netherlands", flag: "🇳🇱", points: 78 },
  { name: "Belgium", flag: "🇧🇪", points: 83 },
  { name: "Croatia", flag: "🇭🇷", points: 75 },
  { name: "Uruguay", flag: "🇺🇾", points: 77 },
  { name: "Mexico", flag: "🇲🇽", points: 72 },
  { name: "Japan", flag: "🇯🇵", points: 70 },
  { name: "South Korea", flag: "🇰🇷", points: 68 },
  { name: "Morocco", flag: "🇲🇦", points: 73 },
  { name: "Senegal", flag: "🇸🇳", points: 71 },
  { name: "Egypt", flag: "🇪🇬", points: 69 },
  { name: "USA", flag: "🇺🇸", points: 76 },
  { name: "Canada", flag: "🇨🇦", points: 65 },
  { name: "Colombia", flag: "🇨🇴", points: 74 },
  { name: "Chile", flag: "🇨🇱", points: 72 },
  { name: "Peru", flag: "🇵🇪", points: 66 },
  { name: "Ecuador", flag: "🇪🇨", points: 64 },
  { name: "Denmark", flag: "🇩🇰", points: 79 },
  { name: "Switzerland", flag: "🇨🇭", points: 76 },
  { name: "Sweden", flag: "🇸🇪", points: 74 },
  { name: "Norway", flag: "🇳🇴", points: 70 },
  { name: "Poland", flag: "🇵🇱", points: 73 },
  { name: "Serbia", flag: "🇷🇸", points: 71 },
  { name: "Turkey", flag: "🇹🇷", points: 68 },
  { name: "Russia", flag: "🇷🇺", points: 75 },
  { name: "Australia", flag: "🇦🇺", points: 67 },
  { name: "Iran", flag: "🇮🇷", points: 69 },
  { name: "Saudi Arabia", flag: "🇸🇦", points: 63 },
  { name: "Qatar", flag: "🇶🇦", points: 62 },
  { name: "Nigeria", flag: "🇳🇬", points: 72 },
  { name: "Ghana", flag: "🇬🇭", points: 70 },
  { name: "Tunisia", flag: "🇹🇳", points: 68 },
  { name: "Cameroon", flag: "🇨🇲", points: 67 },
  { name: "Costa Rica", flag: "🇨🇷", points: 65 },
  { name: "Panama", flag: "🇵🇦", points: 61 },
  { name: "Jamaica", flag: "🇯🇲", points: 60 },
  { name: "New Zealand", flag: "🇳🇿", points: 59 },
  { name: "Algeria", flag: "🇩🇿", points: 71 },
  { name: "Iceland", flag: "🇮🇸", points: 66 },
  { name: "Ukraine", flag: "🇺🇦", points: 74 },
  { name: "Czech Republic", flag: "🇨🇿", points: 72 },
  { name: "Austria", flag: "🇦🇹", points: 70 },
  { name: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", points: 69 },
];

// Generate groups A-L with 4 countries each
function generateGroups() {
  const groups: Record<string, typeof FAKE_COUNTRIES> = {};
  const letters = "ABCDEFGHIJKL";
  let countryIndex = 0;

  for (const letter of letters) {
    groups[letter] = FAKE_COUNTRIES.slice(countryIndex, countryIndex + 4);
    countryIndex += 4;
  }

  return groups;
}

export const GROUPS = generateGroups();

// Storage keys
export const GROUP_WINNERS_STORAGE_KEY = "fifa_group_winners";
export const GROUP_RUNNERS_UP_STORAGE_KEY = "fifa_group_runners_up";
export const THIRD_PLACE_STORAGE_KEY = "fifa_third_place_advancers";

// Types
export type GroupWinnersState = Record<string, string>;
export type GroupRunnersUpState = Record<string, string>;
export type ThirdPlaceAdvancersState = Record<string, string[]>;
