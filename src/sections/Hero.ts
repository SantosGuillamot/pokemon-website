import { html } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";

type HeroProps = {
	children: HtmlEscapedString | Promise<HtmlEscapedString>;
	class?: string;
};

const Hero = ({ children, class: className = "" }: HeroProps) => {
	return html`
		<section class="hero relative px-6 py-16 text-center ${className}">
			<div class="max-w-content mx-auto">
				${children}
			</div>
		</section>
	`;
};

export default Hero;
