import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";

type CardProps = {
	title: string;
	href?: string;
	element?: string;
	className?: string;
	attrs?: string;
	icon?: string;
	description?: string;
	children?: HtmlEscapedString | Promise<HtmlEscapedString>;
};

const Card = ({
	title,
	href,
	element,
	className,
	attrs = "",
	icon,
	description,
	children,
}: CardProps) => {
	const tag = href ? "a" : element || "div";
	const classes = className ? `card-squared ${className}` : "card-squared";
	const hrefAttrs = href
		? `href="${href}" data-wp-on--click="pokemon/router::actions.navigateTo" data-wp-on--mouseenter="pokemon/router::actions.prefetchPage"`
		: "";

	return html`${raw(`<${tag} class="${classes}" ${hrefAttrs} ${attrs}>`)}
		${icon ? html`<div class="card-icon" aria-hidden="true">${raw(icon)}</div>` : ""}
		<h4 class="mb-2">${title}</h4>
		${description ? html`<p class="text-paragraph text-darker-gray">${description}</p>` : ""}
		${children}
	${raw(`</${tag}>`)}`;
};

export default Card;
