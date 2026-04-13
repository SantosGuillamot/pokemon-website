import type { MetaPokemon, Team } from "@pokemon-website/types/team-builder";
import { store } from "@wordpress/interactivity";
import {
	createMetaPokemon,
	createTeam,
	deleteMetaPokemon,
	deleteTeam,
	getAllMetaPokemons,
	getAllTeams,
	saveMetaPokemon,
	saveTeam,
} from "~/client/lib/team-builder-storage";

type TeamBuilderState = {
	metaPokemons: MetaPokemon[];
	teams: Team[];
};

export type TeamBuilderStore = {
	state: TeamBuilderState;
	actions: {
		createMetaPokemon: (
			draft: Omit<MetaPokemon, "id" | "createdAt" | "updatedAt">,
		) => void;
		saveMetaPokemon: (pokemon: MetaPokemon) => void;
		deleteMetaPokemon: (id: string) => void;
		createTeam: (
			draft: Omit<Team, "id" | "createdAt" | "updatedAt">,
		) => void;
		saveTeam: (team: Team) => void;
		deleteTeam: (id: string) => void;
	};
};

const { state } = store("pokemon/team-builder", {
	state: {
		metaPokemons: [] as MetaPokemon[],
		teams: [] as Team[],
	},
	actions: {
		createMetaPokemon(
			draft: Omit<MetaPokemon, "id" | "createdAt" | "updatedAt">,
		) {
			const s = state as TeamBuilderState;
			const pokemon = createMetaPokemon(draft);
			s.metaPokemons = [...s.metaPokemons, pokemon];
		},
		saveMetaPokemon(pokemon: MetaPokemon) {
			const s = state as TeamBuilderState;
			const updated = saveMetaPokemon(pokemon);
			s.metaPokemons = s.metaPokemons.map((mp) =>
				mp.id === updated.id ? updated : mp,
			);
		},
		deleteMetaPokemon(id: string) {
			const s = state as TeamBuilderState;
			deleteMetaPokemon(id);
			s.metaPokemons = s.metaPokemons.filter((mp) => mp.id !== id);
			// Nullify references in in-memory teams to stay in sync with storage cascade
			const now = new Date().toISOString();
			s.teams = s.teams.map((team) => {
				if (!team.members.includes(id)) return team;
				return {
					...team,
					members: team.members.map((memberId) =>
						memberId === id ? null : memberId,
					) as Team["members"],
					updatedAt: now,
				};
			});
		},
		createTeam(draft: Omit<Team, "id" | "createdAt" | "updatedAt">) {
			const s = state as TeamBuilderState;
			const team = createTeam(draft);
			s.teams = [...s.teams, team];
		},
		saveTeam(team: Team) {
			const s = state as TeamBuilderState;
			const updated = saveTeam(team);
			s.teams = s.teams.map((t) => (t.id === updated.id ? updated : t));
		},
		deleteTeam(id: string) {
			const s = state as TeamBuilderState;
			deleteTeam(id);
			s.teams = s.teams.filter((t) => t.id !== id);
		},
	},
	callbacks: {
		init() {
			const s = state as TeamBuilderState;
			s.metaPokemons = getAllMetaPokemons();
			s.teams = getAllTeams();
		},
	},
});
