# Special Attack Comparison Page

> Source: `.claude/issues/special-attack.md` (local Markdown issue tracker).
> This file is self-contained; agents do not need to open the source issue.

## Goal

Users can find out which Pokémon has the higher Special Attack stat, through a
dedicated page for comparing Pokémon by their Special Attack — the equivalent of what
the "Who's Faster?" page does for the Speed stat.

## Context

- Model page: the existing "Who's Faster?" experience, implemented on the Speeds page
  (`src/pages/speeds.ts`). Its related issue is `.claude/issues/speeds-table.md`. The
  new page should offer an equivalent experience for Special Attack instead of Speed.

## Assumptions / directions to explore

- Mirror the structure of the Speeds page — hero, section cards, the head-to-head
  "guess which is higher" quiz, and a sortable data table — swapping the Speed stat for
  Special Attack. *(Open — the agents may confirm or revise how much to reuse from the
  existing page versus generalize it.)*
