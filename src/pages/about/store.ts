import { store } from "@wordpress/interactivity";
import type { PokemonStore } from "../../global-stores/pokemon.js";
import "../../global-stores/pokemon.js";

const { state: pokemonState } = store<PokemonStore>("pokemon", {});

store("about", {
	state: {
		get greeting() {
			return `Welcome! Current pokemon is ${pokemonState.pokemon.name}`;
		},
	},
});
