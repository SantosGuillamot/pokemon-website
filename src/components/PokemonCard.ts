import { html } from "hono/html";

const PokemonCard = ({ id }: { id: number }) => {
	return html`
		<div
			class="pokemon-card"
			data-wp-context='{"_pokemonId": "${id}"}'
		>
			<div class="pokemon-card-image">
				<img
					data-wp-bind--src="state.pokemon.imageUrl"
					data-wp-bind--alt="state.pokemon.name"
					width="400"
					height="400"
				/>
			</div>
			<div class="pokemon-card-info">
				<h4 data-wp-text="state.pokemon.name"></h4>
				<div class="pokemon-card-types">
					<template data-wp-each="state.pokemonTypes">
						<img
							data-wp-bind--src="context.item.imageSmall"
							data-wp-bind--alt="context.item.name"
							class="pokemon-card-type-icon"
							width="24"
							height="24"
						/>
					</template>
				</div>
			</div>
		</div>
	`;
};

export default PokemonCard;
