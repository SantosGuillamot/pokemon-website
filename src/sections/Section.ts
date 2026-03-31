import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";

type SectionProps = {
	children: HtmlEscapedString | Promise<HtmlEscapedString>;
	class?: string;
	attrs?: string;
	bgColor?: string;
};

const Section = ({
	children,
	class: className = "",
	attrs = "",
	bgColor,
}: SectionProps) => {
	const style = bgColor ? `style="background-color: ${bgColor}"` : "";
	return html`
		<section class="px-6 py-16 ${className}" ${raw(attrs)} ${raw(style)}>
			<div class="max-w-content mx-auto">
				${children}
			</div>
		</section>
	`;
};

export default Section;
