import type { PokemonStore } from "@pokemon-website/stores/pokemons";
import type { PokemonContext } from "@pokemon-website/types/pokemons";
import { getContext, store } from "@wordpress/interactivity";
import "@pokemon-website/stores/pokemons";

export type QuizPokemon = {
	dexNumber: number;
	formName: string | null;
};

const { state: pokemonState } = store<PokemonStore>("pokemon", {});

export function randomizeSingle(context: {
	randomPokemon: QuizPokemon | null;
}) {
	const pokemons = pokemonState.getRandomPokemons(1);
	if (pokemons.length < 1) return;
	context.randomPokemon = {
		dexNumber: pokemons[0].dexNumber,
		formName: pokemons[0].formName,
	};
}

export function syncPokemonContext(data: QuizPokemon) {
	const pokemonContext = getContext<PokemonContext>("pokemon");
	pokemonContext._pokemonDexNumber = data.dexNumber.toString();
	pokemonContext._pokemonFormName = data.formName;
}

export { isCurrentSection, selectSection } from "@pokemon-website/stores/section-utils";

export function isWaiting(namespace: string): boolean {
	const context = getContext<{ quizState: string }>(namespace);
	return context.quizState === "waiting";
}

export function isIncorrect(namespace: string): boolean {
	const context = getContext<{ quizState: string }>(namespace);
	return context.quizState === "incorrect";
}

