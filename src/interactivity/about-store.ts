import { store } from "@wordpress/interactivity";
import type { PokemonStore } from "./index-store.js";
import "./index-store.js";

const { state: pokemonState } = store<PokemonStore>("pokemon", {});

store("about", {
  state: {
    get greeting() {
      return `Welcome! Current pokemon is ${pokemonState.pokemon.name}`;
    },
  },
});
