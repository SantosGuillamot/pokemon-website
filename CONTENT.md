# Content & Pages

Game scope: **Pokemon Champions** (releasing April 2026). The available Pokemon pool will be updated in the database as information becomes available.

---

## 1. Homepage

Landing page introducing the site and linking to all features.

- Brief presentation/hero section
- One card per feature page (Who's Faster, KO or Not, Learn Types, Damage Calculator, Team Building)

---

## 2. Who's Faster

Minigame to train speed knowledge. No auth required.

- Show two Pokemon side by side
- User guesses which one is faster (or equal if same speed stat)
- Streak-based: one wrong answer ends the run
- Display the current streak count

---

## 3. KO or Not

Minigame to train damage intuition. No auth required.

- Present a battle scenario: attacker, defender, move, and field conditions
- The defender can have less than 100% HP (e.g., 75%)
- Show relevant stats, types, abilities, and conditions so the user can reason through it
- User guesses: does this one-hit KO the defender? Yes or no
- Streak-based: one wrong answer ends the run
- Display the current streak count

**Example scenario:** Mega Charizard Y with Sun uses Heat Wave against Blastoise at 75% HP.

---

## 4. Learn Types

Page dedicated to learning type effectiveness. No auth required. Two separate modes:

### Mode A — Fill the Type Chart
- Show an empty type effectiveness table
- User fills in each cell (super effective, not very effective, no effect, neutral)
- Show results as a test with a score at the end

### Mode B — Guess the Weaknesses
- Show a Pokemon with its type(s)
- User guesses what types it is weak to
- Streak-based: one wrong answer ends the run
- Display the current streak count

---

## 5. Damage Calculator

Full damage calculator for Pokemon Champions. No auth required.

- Reference: https://calc.pokemonshowdown.com/
- Select attacker and defender Pokemon (with images)
- Configure: moves, abilities, items, EVs/IVs, nature, level
- Configure field conditions: weather, terrain, screens, etc.
- Output: damage range (min–max), percentage of defender HP, KO probability (OHKO, 2HKO, etc.)

---

## 6. Team Building

Theory crafting tool for competitive teams. **Requires auth** (to save teams).

### Team Composition
- Select 6 Pokemon with their moves, stats (EVs/IVs), items, abilities, and natures

### Type Coverage Analysis
- Show how the team covers every type
- Highlight which Pokemon handle which types well and which types are uncovered/weak

### Meta Matchup Analysis
- Predefined meta teams/Pokemon (manually defined by site owner)
- Compare your team against the meta: strengths, weaknesses, and gaps
