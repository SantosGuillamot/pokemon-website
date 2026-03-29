import { html } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";

type HeroProps = {
	title: string;
	description: string;
	image: string;
	children?: HtmlEscapedString | Promise<HtmlEscapedString>;
	class?: string;
};

const Hero = ({
	title,
	description,
	image,
	children,
	class: className = "",
}: HeroProps) => {
	return html`
		<section class="hero relative px-6 py-24 ${className}">
			<div class="max-w-content mx-auto flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12">
				<div class="flex-1 space-y-4">
					<h1>${title}</h1>
					<p class="text-paragraph-lg text-darker-gray">
						${description}
					</p>
					${children}
				</div>
				<div class="flex-1 flex justify-center">
					<img
						src="${image}"
						alt=""
						class="w-48 h-48 md:w-64 md:h-64"
					/>
				</div>
			</div>
		</section>
	`;
};

export default Hero;
