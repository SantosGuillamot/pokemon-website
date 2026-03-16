import 'dotenv/config';
import { db } from '../src/db/client';
import {
  types,
  typeMatchups,
  abilities,
  natures,
  pokemon,
  pokemonTypes,
  pokemonAbilities,
} from '../src/db/schema/index';
import { eq } from 'drizzle-orm';

const BASE_URL = 'https://pokeapi.co/api/v2';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Types ───────────────────────────────────────────────────────────────────

async function seedTypes() {
  console.log('Seeding types...');

  const res = await fetch(`${BASE_URL}/type?limit=100`);
  const data = (await res.json()) as { results: { name: string; url: string }[] };

  // PokéAPI includes "unknown" and "shadow" which are not real battle types; keep all 18 main types
  const mainTypes = data.results.filter(
    (t) => t.name !== 'unknown' && t.name !== 'shadow'
  );

  for (const t of mainTypes) {
    await db.insert(types).values({ name: t.name }).onConflictDoNothing();
    await sleep(100);
  }

  console.log(`  Inserted ${mainTypes.length} types.`);
}

// ─── Type Matchups ────────────────────────────────────────────────────────────

async function seedTypeMatchups() {
  console.log('Seeding type matchups...');

  const allTypes = await db.select().from(types);
  const typeIdByName = Object.fromEntries(allTypes.map((t) => [t.name, t.id]));

  let count = 0;

  for (const t of allTypes) {
    const res = await fetch(`${BASE_URL}/type/${t.name}`);
    const data = (await res.json()) as {
      damage_relations: {
        double_damage_to: { name: string }[];
        half_damage_to: { name: string }[];
        no_damage_to: { name: string }[];
      };
    };

    const { double_damage_to, half_damage_to, no_damage_to } =
      data.damage_relations;

    const matchups: { attackerTypeId: number; defenderTypeId: number; multiplier: string }[] = [];

    for (const defender of double_damage_to) {
      const defId = typeIdByName[defender.name];
      if (defId !== undefined) {
        matchups.push({ attackerTypeId: t.id, defenderTypeId: defId, multiplier: '2.00' });
      }
    }
    for (const defender of half_damage_to) {
      const defId = typeIdByName[defender.name];
      if (defId !== undefined) {
        matchups.push({ attackerTypeId: t.id, defenderTypeId: defId, multiplier: '0.50' });
      }
    }
    for (const defender of no_damage_to) {
      const defId = typeIdByName[defender.name];
      if (defId !== undefined) {
        matchups.push({ attackerTypeId: t.id, defenderTypeId: defId, multiplier: '0.00' });
      }
    }

    if (matchups.length > 0) {
      await db.insert(typeMatchups).values(matchups).onConflictDoNothing();
      count += matchups.length;
    }

    await sleep(100);
  }

  console.log(`  Inserted ${count} type matchup rows.`);
}

// ─── Abilities ────────────────────────────────────────────────────────────────

async function seedAbilities() {
  console.log('Seeding abilities...');

  const res = await fetch(`${BASE_URL}/ability?limit=300`);
  const data = (await res.json()) as { results: { name: string; url: string }[] };

  let count = 0;

  for (const a of data.results) {
    const abilityRes = await fetch(a.url);
    const abilityData = (await abilityRes.json()) as {
      name: string;
      effect_entries: { short_effect: string; language: { name: string } }[];
    };

    const shortEffect =
      abilityData.effect_entries.find((e) => e.language.name === 'en')
        ?.short_effect ?? null;

    await db
      .insert(abilities)
      .values({ name: abilityData.name, effect: shortEffect })
      .onConflictDoNothing();

    count++;
    await sleep(100);
  }

  console.log(`  Inserted ${count} abilities.`);
}

// ─── Natures ──────────────────────────────────────────────────────────────────

type StatEnumValue = 'hp' | 'attack' | 'defense' | 'sp_attack' | 'sp_defense' | 'speed' | 'none';

function mapStat(apiStatName: string | undefined): StatEnumValue {
  if (!apiStatName) return 'none';
  const map: Record<string, StatEnumValue> = {
    'special-attack': 'sp_attack',
    'special-defense': 'sp_defense',
    hp: 'hp',
    attack: 'attack',
    defense: 'defense',
    speed: 'speed',
  };
  return map[apiStatName] ?? 'none';
}

async function seedNatures() {
  console.log('Seeding natures...');

  const res = await fetch(`${BASE_URL}/nature?limit=50`);
  const data = (await res.json()) as { results: { name: string; url: string }[] };

  let count = 0;

  for (const n of data.results) {
    const natureRes = await fetch(n.url);
    const natureData = (await natureRes.json()) as {
      name: string;
      increased_stat: { name: string } | null;
      decreased_stat: { name: string } | null;
    };

    const increasedStat = mapStat(natureData.increased_stat?.name);
    const decreasedStat = mapStat(natureData.decreased_stat?.name);

    await db
      .insert(natures)
      .values({
        name: natureData.name,
        increasedStat,
        decreasedStat,
      })
      .onConflictDoNothing();

    count++;
    await sleep(100);
  }

  console.log(`  Inserted ${count} natures.`);
}

// ─── Pokemon ──────────────────────────────────────────────────────────────────

async function seedPokemon() {
  console.log('Seeding first 151 Pokemon...');

  const allTypes = await db.select().from(types);
  const typeIdByName = Object.fromEntries(allTypes.map((t) => [t.name, t.id]));

  const allAbilities = await db.select().from(abilities);
  const abilityIdByName = Object.fromEntries(allAbilities.map((a) => [a.name, a.id]));

  for (let id = 1; id <= 151; id++) {
    const res = await fetch(`${BASE_URL}/pokemon/${id}`);
    const data = (await res.json()) as {
      id: number;
      name: string;
      sprites: { other: { 'official-artwork': { front_default: string | null } } };
      stats: { base_stat: number; stat: { name: string } }[];
      types: { slot: number; type: { name: string } }[];
      abilities: { is_hidden: boolean; slot: number; ability: { name: string } }[];
    };

    const statsRecord: Record<string, number> = {};
    for (const s of data.stats) {
      statsRecord[s.stat.name] = s.base_stat;
    }

    const imageUrl =
      data.sprites.other['official-artwork'].front_default ?? null;

    const [inserted] = await db
      .insert(pokemon)
      .values({
        pokeApiId: data.id,
        name: data.name,
        imageUrl,
        hp: statsRecord['hp'] ?? 0,
        attack: statsRecord['attack'] ?? 0,
        defense: statsRecord['defense'] ?? 0,
        spAttack: statsRecord['special-attack'] ?? 0,
        spDefense: statsRecord['special-defense'] ?? 0,
        speed: statsRecord['speed'] ?? 0,
      })
      .onConflictDoNothing()
      .returning({ id: pokemon.id });

    // If the row already existed, look it up
    let pokemonId: number;
    if (inserted) {
      pokemonId = inserted.id;
    } else {
      const existing = await db
        .select({ id: pokemon.id })
        .from(pokemon)
        .where(eq(pokemon.pokeApiId, data.id))
        .limit(1);
      pokemonId = existing[0].id;
    }

    // Pokemon types
    for (const t of data.types) {
      const typeId = typeIdByName[t.type.name];
      if (typeId !== undefined) {
        await db
          .insert(pokemonTypes)
          .values({ pokemonId, typeId, slot: t.slot })
          .onConflictDoNothing();
      }
    }

    // Pokemon abilities
    for (const a of data.abilities) {
      const abilityId = abilityIdByName[a.ability.name];
      if (abilityId !== undefined) {
        await db
          .insert(pokemonAbilities)
          .values({
            pokemonId,
            abilityId,
            isHidden: a.is_hidden ? 1 : 0,
            slot: a.slot,
          })
          .onConflictDoNothing();
      }
    }

    if (id % 25 === 0) {
      console.log(`  Processed ${id}/151 Pokemon...`);
    }

    await sleep(100);
  }

  console.log('  Inserted up to 151 Pokemon with types and abilities.');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding...');
  await seedTypes();
  await seedTypeMatchups();
  await seedAbilities();
  await seedNatures();
  await seedPokemon();
  console.log('Done!');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
