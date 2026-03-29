import { html } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";

type HeroProps = {
	title: string;
	description: string;
	image: string;
	imageBg?: string;
	children?: HtmlEscapedString | Promise<HtmlEscapedString>;
	class?: string;
};

const Hero = ({
	title,
	description,
	image,
	imageBg,
	children,
	class: className = "",
}: HeroProps) => {
	return html`
		<section class="hero relative px-6 pb-18 ${className}">
			<div class="max-w-content mx-auto flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12">
				<div class="flex-1 space-y-4">
					<h1>${title}</h1>
					<p class="text-paragraph-lg text-darker-gray">
						${description}
					</p>
					${children}
				</div>
				<div class="hero-image flex-1 flex justify-center self-end">
					<div class="hero-image-stack">
						${
							imageBg
								? html`<img
								src="${imageBg}"
								alt=""
								class="hero-image-bg"
							/>`
								: ""
						}
						<img
							src="${image}"
							alt=""
							class="hero-image-fg"
						/>
					</div>
				</div>
			</div>
		</section>
	`;
};

export default Hero;
