import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";

type CardProps = {
	title: string;
	href?: string;
	icon?: string;
	description?: string;
	children?: HtmlEscapedString | Promise<HtmlEscapedString>;
};

const Card = ({ title, href, icon, description, children }: CardProps) => {
	const content = html`
		${icon ? html`<div class="card-icon" aria-hidden="true">${raw(icon)}</div>` : ""}
		<h4 class="mb-2">${title}</h4>
		${description ? html`<p class="text-paragraph text-darker-gray">${description}</p>` : ""}
		${children}
	`;

	if (href) {
		return html`<a
			href="${href}"
			class="card-squared"
			data-wp-on--click="pokemon/router::actions.navigateTo"
			data-wp-on--mouseenter="pokemon/router::actions.prefetchPage"
		>${content}</a>`;
	}
	return html`<div class="card-squared">${content}</div>`;
};

export default Card;
