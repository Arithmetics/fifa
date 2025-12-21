backend database plan:

1. table 'line'

- id: whatever we are using (some uuid)
- title: string
- choiceLimit: int

2. table 'choice'

- id
- lineId (a line will have many choices, choice will have one line)
- title: string
- flag: string
- primaryPoints: int
- secondaryPoints: int
- isPrimaryWin: boolean

3. table 'bet'

- id
- choiceId (a choice will have many bets, a bet will have one choice)
- userId (or whatever our user table is) (a user will have many bets, a bet will belong to one user)
