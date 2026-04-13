import Card from "./Card.js";

type SectionCardProps = {
	title: string;
	description: string;
	sectionId: string;
	ariaPressed?: boolean;
};

/**
 * A Card preconfigured for section selection buttons.
 * Used in quiz and non-quiz pages.
 */
const SectionCard = ({
	title,
	description,
	sectionId,
	ariaPressed = false,
}: SectionCardProps) => {
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

export default SectionCard;
