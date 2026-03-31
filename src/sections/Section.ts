import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";

type SectionProps = {
	children: HtmlEscapedString | Promise<HtmlEscapedString>;
	class?: string;
	attrs?: string;
};

const Section = ({ children, class: className = "", attrs = "" }: SectionProps) => {
	return html`
		<section class="px-6 py-12 ${className}" ${raw(attrs)}>
			<div class="max-w-content mx-auto">
				${children}
			</div>
		</section>
	`;
};

export default Section;
