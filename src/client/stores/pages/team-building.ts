import "@pokemon-website/stores/data-table";
import type { PokemonStore } from "@pokemon-website/stores/pokemons";
import {
	isCurrentSection,
	selectSection,
} from "@pokemon-website/stores/section-utils";
import type {
	DataTableContext,
	DataTableRow,
} from "@pokemon-website/types/data-table";
import type { Item, Nature } from "@pokemon-website/types/reference-data";
import type { MetaPokemon, Team } from "@pokemon-website/types/team-builder";
import type { Type } from "@pokemon-website/types/types";
import { getConfig, getContext, store } from "@wordpress/interactivity";
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
	isCurrentSection: boolean;
	metaPokemonRows: DataTableRow[];
};

export type TeamBuilderStore = {
	state: TeamBuilderState;
	actions: {
		createMetaPokemon: (
			draft: Omit<MetaPokemon, "id" | "createdAt" | "updatedAt">,
		) => void;
		saveMetaPokemon: (pokemon: MetaPokemon) => void;
		deleteMetaPokemon: (id: string) => void;
		deleteMetaPokemonWithConfirm: () => void;
		openNewEditor: () => void;
		createTeam: (draft: Omit<Team, "id" | "createdAt" | "updatedAt">) => void;
		saveTeam: (team: Team) => void;
		deleteTeam: (id: string) => void;
		selectSection: () => void;
	};
	callbacks: {
		init: () => void;
	};
};

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : "");

const { state } = store("pokemon/team-builder", {
	state: {
		metaPokemons: [] as MetaPokemon[],
		teams: [] as Team[],
		get isCurrentSection() {
			return isCurrentSection("pokemon/team-builder");
		},
		get metaPokemonRows(): DataTableRow[] {
			const s = state as TeamBuilderState;
			const pokemons = store<PokemonStore>("pokemon").state.pokemons;
			const config = getConfig("pokemon") as {
				types?: Record<string, Type>;
				items?: Record<string, Item>;
				natures?: Record<string, Nature>;
			};
			const types = config.types ?? {};
			const items = config.items ?? {};
			const natures = config.natures ?? {};

			const rows: DataTableRow[] = [];
			for (const mp of s.metaPokemons) {
				const p = pokemons[String(mp.pokemonId)];
				if (!p) continue;

				const typeRecords = p.typeIds
					.map((id) => types[String(id)])
					.filter((t): t is Type => !!t);
				const t1 = typeRecords[0];
				const t2 = typeRecords[1];

				const item =
					mp.itemId != null ? items[String(mp.itemId)] : undefined;

				rows.push({
					id: mp.id,
					sprite: p.imageUrl ?? "",
					itemImage: item?.imageUrl ?? "",
					itemName: item?.name ?? "",
					nickname: mp.nickname,
					type1: t1?.imageSmall ?? "",
					type1Name: t1?.name ?? "",
					type2: t2?.imageSmall ?? "",
					type2Name: t2?.name ?? "",
					natureName:
						mp.natureId != null
							? capitalize(natures[String(mp.natureId)]?.name ?? "")
							: "",
					hp: mp.statPoints.hp,
					attack: mp.statPoints.attack,
					defense: mp.statPoints.defense,
					spAttack: mp.statPoints.spAttack,
					spDefense: mp.statPoints.spDefense,
					speed: mp.statPoints.speed,
				});
			}
			return rows;
		},
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
		deleteMetaPokemonWithConfirm() {
			const ctx = getContext<DataTableContext>("pokemon/data-table");
			const item = ctx.item;
			if (!item) return;
			const nickname = String(item.nickname ?? "");
			if (!window.confirm(`Delete "${nickname}"?`)) return;
			(
				store("pokemon/team-builder") as TeamBuilderStore
			).actions.deleteMetaPokemon(String(item.id));
		},
		openNewEditor() {
			// Stub — editor lands in a later issue.
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
		selectSection() {
			selectSection("pokemon/team-builder");
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
