import { html } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import QuizStatus from "./QuizStatus.js";
import Section from "./Section.js";

type QuizSectionProps = {
	sectionId: string;
	quizContext: Record<string, unknown>;
	watchCallback: string;
	restartAction: string;
	children: HtmlEscapedString | Promise<HtmlEscapedString>;
	/** Extra properties merged into the outer section data-wp-context alongside sectionId. */
	sectionContext?: Record<string, unknown>;
	/** Extra CSS classes for the inner quiz wrapper div. */
	innerClass?: string;
};

const QuizSection = ({
	sectionId,
	quizContext,
	watchCallback,
	restartAction,
	children,
	sectionContext,
	innerClass,
}: QuizSectionProps) => {
	const outerContext = { sectionId, ...sectionContext };
	const innerClasses = ["quiz-bg overflow-hidden", innerClass]
		.filter(Boolean)
		.join(" ");

	return Section({
		class: "section-diagonal py-32",
		attrs: `data-wp-context='${JSON.stringify(outerContext)}' data-wp-bind--hidden="!state.isCurrentSection"`,
		children: html`
			<div
				class="${innerClasses}"
				data-wp-context='${JSON.stringify(quizContext)}'
				data-wp-watch="${watchCallback}"
			>
				${QuizStatus(restartAction)}
				${children}
			</div>
		`,
	});
};

export default QuizSection;
