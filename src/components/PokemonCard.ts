import { html } from "hono/html";

type PokemonType = {
	id: number;
	name: string;
};

export type PokemonCardProps = {
	name: string;
	imageUrl?: string | null;
	types: PokemonType[];
};

const FALLBACK_IMAGE = "/public/icons/Pokeball.svg";

const PokemonCard = ({ name, imageUrl, types }: PokemonCardProps) => {
	const src = imageUrl || FALLBACK_IMAGE;

	const typeBadges = types.map(
		(t) =>
			html`<img
				src="/public/images/types/small/${t.id}.png"
				alt="${t.name} type"
				class="pokemon-card-type-icon"
				width="24"
				height="24"
				loading="lazy"
			/>`,
	);

	return html`
		<div class="pokemon-card">
			<div class="pokemon-card-image">
				<img
					src="${src}"
					alt="${name}"
					width="400"
					height="400"
					loading="lazy"
				/>
			</div>
			<div class="pokemon-card-info">
				<h4>${name}</h4>
				<div class="pokemon-card-types">${typeBadges}</div>
			</div>
		</div>
	`;
};

export default PokemonCard;
