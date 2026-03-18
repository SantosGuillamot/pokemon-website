import { store } from '@wordpress/interactivity';

const { state } = store('pokemon', {
  state: {
    pokemon: {
      name: 'Bulbasaur',
    },
  },
  actions: {
    toggle: () => {
      const current = state.pokemon.name;
      state.pokemon.name = current === 'Bulbasaur' ? 'Pikachu' : 'Bulbasaur';
    },
  },
});
