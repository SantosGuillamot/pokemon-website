import { getContext } from "@wordpress/interactivity";

export function isCurrentSection(namespace: string): boolean {
	const context = getContext<{ currentSection: string; sectionId: string }>(
		namespace,
	);
	return context.currentSection === context.sectionId;
}

export function selectSection(namespace: string) {
	const ctx = getContext<{ currentSection: string; sectionId: string }>(
		namespace,
	);
	ctx.currentSection = ctx.sectionId;
}
