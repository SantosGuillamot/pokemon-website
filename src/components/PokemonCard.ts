import { html } from "hono/html";

const PokemonCard = () => {
	return html`
		<div class="pokemon-card">
			<div class="pokemon-card-image">
				<img
					data-wp-bind--src="pokemon::state.pokemon.imageUrl"
					data-wp-bind--alt="pokemon::state.pokemonName"
					width="400"
					height="400"
				/>
			</div>
			<div class="pokemon-card-info">
				<h4 data-wp-text="pokemon::state.pokemonName"></h4>
				<div class="pokemon-card-types">
					<template data-wp-each="pokemon::state.pokemonTypes">
						<img
							data-wp-bind--src="pokemon::context.item.imageSmall"
							data-wp-bind--alt="pokemon::context.item.name"
							class="pokemon-card-type-icon"
							width="24"
							height="24"
							loading="lazy"
						/>
					</template>
				</div>
			</div>
		</div>
	`;
};

export default PokemonCard;
