import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";

type CardProps = {
	title: string;
	href?: string;
	icon?: string;
	children: HtmlEscapedString | Promise<HtmlEscapedString>;
};

const Card = ({ title, href, icon, children }: CardProps) => {
	const content = html`
		${icon ? html`<div class="card-icon" aria-hidden="true">${raw(icon)}</div>` : ""}
		<h4>${title}</h4>
		${children}
	`;

	if (href) {
		return html`<a href="${href}" class="card-squared">${content}</a>`;
	}
	return html`<div class="card-squared">${content}</div>`;
};

export default Card;
