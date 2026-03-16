# Fourth & Forever — CFB Manager

## Setup (30 seconds)

1. Download both files into the same folder:
   - `index.html`
   - `names.js`

2. Open `names.js` and paste your names into the NAMES object. The structure is already there — just fill in the arrays.

3. Double-click `index.html` to open in Chrome.

That's it. No install, no server, no dependencies.

---

## names.js Format

```js
const NAMES = {
  southeast: {
    first: {
      black:    ["DeShawn", "Malik", ...],
      white:    ["Tucker", "Colt", ...],
      hispanic: ["Marco", "Diego", ...]
    },
    last: {
      black:    ["Williams", "Jackson", ...],
      white:    ["Smith", "Johnson", ...],
      hispanic: ["Martinez", "Rodriguez", ...]
    }
  },
  southwest: { ... },
  midwest:   { ... },
  northeast: { ... },
  west:      { ... },
  exotic: {
    first: ["Ky'Ron", "D'Andre", ...],
    last:  ["Nwaneri", "Ogbuehi", ...]
  }
};
```

Exotic names = higher probability of generating a needle-in-the-haystack recruit.

---

## What's Built

- 250 D1 programs across all conferences with real ESPN logos
- Coach name screen
- School select with conference filtering and prestige ratings
- Dashboard: This Week / Roster / Recruiting / Boosters / Portal
- Recruiting: My Board + National views, 900 procedurally generated recruits
- Slot machine action system: Phone calls, in-home visits, official visits, NIL pitches
- Pipeline stages: Identified → Offered → Warm → Hot → Committed
- Scout system: deploy scouts, reveal hidden OVR on needles
- Rival pressure: runs every week advance, alerts on big rival moves
- Player cards with full ratings, NIL management
- Game simulation with win probability
- Booster relationship management
- Team color gradient backgrounds
- Play-calling game simulation mechanic
- Full NIL cap management

---

## Coming Next


- Coach carousel / firing system
- Signing Day event
- Season-to-season dynasty mode
