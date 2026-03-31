import Card from "./Card.js";

type QuizModeCardProps = {
	title: string;
	description: string;
	sectionId: string;
	ariaPressed?: boolean;
};

/**
 * A Card preconfigured for quiz section selection buttons.
 * Used in both the types and speeds pages.
 */
const QuizModeCard = ({
	title,
	description,
	sectionId,
	ariaPressed = false,
}: QuizModeCardProps) => {
	const ariaPressedAttr = ariaPressed
		? ' data-wp-bind--aria-pressed="state.isCurrentSection"'
		: "";

	return Card({
		title,
		description,
		element: "button",
		className: "max-w-sm w-full sm:max-w-xs sm:flex-1",
		attrs: `type="button" data-wp-context='${JSON.stringify({ sectionId })}' data-wp-class--card-squared-active="state.isCurrentSection"${ariaPressedAttr} data-wp-on--click="actions.selectSection"`,
	});
};

export default QuizModeCard;
