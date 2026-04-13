import type {
	MetaPokemon,
	Team,
	TeamBuilderStorage,
} from "@pokemon-website/types/team-builder";

const STORAGE_KEY = "pokemon-team-builder";
const CURRENT_VERSION = 1;

function emptyStorage(): TeamBuilderStorage {
	return { version: 1, metaPokemons: {}, teams: {} };
}

/**
 * Handles schema version mismatches.
 *
 * WARNING: incrementing CURRENT_VERSION without writing a real migration body
 * will silently delete all user data. Always implement the migration before
 * bumping the version constant.
 *
 * NOTE: When this module is replaced with async API calls (e.g. after Better Auth
 * is added), store actions that call these functions must also become async.
 * That will require updates to any `data-wp-on` HTML directives that invoke them.
 */
function migrate(_raw: unknown): TeamBuilderStorage {
	// v1 is the initial version — no migration needed.
	return emptyStorage();
}

function loadRaw(): TeamBuilderStorage {
	try {
		const json = localStorage.getItem(STORAGE_KEY);
		if (!json) return emptyStorage();
		const parsed: unknown = JSON.parse(json);
		if (
			typeof parsed !== "object" ||
			parsed === null ||
			(parsed as TeamBuilderStorage).version !== CURRENT_VERSION
		) {
			return migrate(parsed);
		}
		return parsed as TeamBuilderStorage;
	} catch {
		return emptyStorage();
	}
}

function persist(storage: TeamBuilderStorage): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

// ---------------------------------------------------------------------------
// MetaPokemon CRUD
// ---------------------------------------------------------------------------

export function getAllMetaPokemons(): MetaPokemon[] {
	const storage = loadRaw();
	return Object.values(storage.metaPokemons).sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	);
}

function hasMetaPokemonNickname(
	storage: TeamBuilderStorage,
	nickname: string,
	excludeId?: string,
): boolean {
	return Object.values(storage.metaPokemons).some(
		(mp) => mp.nickname === nickname && mp.id !== excludeId,
	);
}

export function createMetaPokemon(
	draft: Omit<MetaPokemon, "id" | "createdAt" | "updatedAt">,
): MetaPokemon {
	const storage = loadRaw();
	if (hasMetaPokemonNickname(storage, draft.nickname)) {
		throw new Error(`A meta pokemon with nickname "${draft.nickname}" already exists.`);
	}
	const now = new Date().toISOString();
	const pokemon: MetaPokemon = {
		...draft,
		id: crypto.randomUUID(),
		createdAt: now,
		updatedAt: now,
	};
	storage.metaPokemons[pokemon.id] = pokemon;
	persist(storage);
	return pokemon;
}

export function saveMetaPokemon(pokemon: MetaPokemon): MetaPokemon {
	const storage = loadRaw();
	if (hasMetaPokemonNickname(storage, pokemon.nickname, pokemon.id)) {
		throw new Error(`A meta pokemon with nickname "${pokemon.nickname}" already exists.`);
	}
	const updated: MetaPokemon = {
		...pokemon,
		updatedAt: new Date().toISOString(),
	};
	storage.metaPokemons[updated.id] = updated;
	persist(storage);
	return updated;
}

/**
 * Deletes a meta pokemon and cascades by nullifying all references to it
 * in every team's members tuple.
 */
export function deleteMetaPokemon(id: string): void {
	const storage = loadRaw();
	delete storage.metaPokemons[id];
	const now = new Date().toISOString();
	for (const team of Object.values(storage.teams)) {
		if (team.members.includes(id)) {
			team.members = team.members.map((memberId) =>
				memberId === id ? null : memberId,
			) as Team["members"];
			team.updatedAt = now;
		}
	}
	persist(storage);
}

// ---------------------------------------------------------------------------
// Team CRUD
// ---------------------------------------------------------------------------

export function getAllTeams(): Team[] {
	const storage = loadRaw();
	return Object.values(storage.teams).sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	);
}

function hasTeamName(
	storage: TeamBuilderStorage,
	name: string,
	excludeId?: string,
): boolean {
	return Object.values(storage.teams).some(
		(t) => t.name === name && t.id !== excludeId,
	);
}

export function createTeam(
	draft: Omit<Team, "id" | "createdAt" | "updatedAt">,
): Team {
	const storage = loadRaw();
	if (hasTeamName(storage, draft.name)) {
		throw new Error(`A team with name "${draft.name}" already exists.`);
	}
	const now = new Date().toISOString();
	const team: Team = {
		...draft,
		id: crypto.randomUUID(),
		createdAt: now,
		updatedAt: now,
	};
	storage.teams[team.id] = team;
	persist(storage);
	return team;
}

export function saveTeam(team: Team): Team {
	const storage = loadRaw();
	if (hasTeamName(storage, team.name, team.id)) {
		throw new Error(`A team with name "${team.name}" already exists.`);
	}
	const updated: Team = {
		...team,
		updatedAt: new Date().toISOString(),
	};
	storage.teams[updated.id] = updated;
	persist(storage);
	return updated;
}

export function deleteTeam(id: string): void {
	const storage = loadRaw();
	delete storage.teams[id];
	persist(storage);
}
