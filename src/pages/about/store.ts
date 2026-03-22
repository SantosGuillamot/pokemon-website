import { store } from "@wordpress/interactivity";
import "@wordpress/interactivity-router";
import type { PokemonStore } from "@pokemon-website/stores/pokemons";
import "@pokemon-website/stores/pokemons";

const { state: pokemonState } = store<PokemonStore>("pokemon", {});

store("about", {
	state: {
		get greeting() {
			return `Welcome! Current pokemon is ${pokemonState.pokemon?.name ?? "none"}`;
		},
	},
});
