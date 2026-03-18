import { store } from "@wordpress/interactivity";

export type PokemonStore = {
  state: {
    pokemon: {
      name: string;
    };
  };
};

const { state } = store("pokemon", {
  state: {
    pokemon: {
      name: "Bulbasaur",
    },
  },
  actions: {
    toggle: () => {
      const current = state.pokemon.name;
      state.pokemon.name = current === "Bulbasaur" ? "Pikachu" : "Bulbasaur";
    },
  },
});
