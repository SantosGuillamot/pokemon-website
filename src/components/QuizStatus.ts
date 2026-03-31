import { html } from "hono/html";

const QuizStatus = (restartAction: string) => html`
	<div class="quiz-status font-heading-retro text-h3" aria-live="assertive">
		<p data-wp-bind--hidden="state.isIncorrect">
			Streak: <span data-wp-text="context.streak">0</span>
		</p>
		<div data-wp-bind--hidden="!state.isIncorrect" class="flex flex-wrap items-center gap-4 sm:gap-12">
			<p class="text-primary">GAME OVER</p>
			<p>Final streak: <span data-wp-text="context.finalStreak">0</span></p>
			<button
				type="button"
				class="btn btn-primary"
				data-wp-on--click="${restartAction}"
			>Try again</button>
		</div>
	</div>
`;

export default QuizStatus;
