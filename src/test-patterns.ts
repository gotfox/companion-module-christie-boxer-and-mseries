import type { ProjectorType } from './utils.js'

export interface TestPattern {
	id: number
	label: string
}

const MSERIES_TEST_PATTERNS: TestPattern[] = [
	{ id: 0, label: 'Off' },
	{ id: 1, label: 'Grid' },
	{ id: 2, label: 'Grayscale 16' },
	{ id: 3, label: 'White' },
	{ id: 4, label: 'Flat Grey' },
	{ id: 5, label: 'Black' },
	{ id: 6, label: 'Checker' },
	{ id: 7, label: '13 Point' },
	{ id: 8, label: 'Color Bars' },
	{ id: 11, label: 'Aspect Ratio' },
	{ id: 12, label: 'Edge Blend' },
	{ id: 14, label: 'Boresight' },
]

const BOXER_TEST_PATTERNS: TestPattern[] = [
	{ id: 0, label: 'Off' },
	{ id: 1, label: 'Grid' },
	{ id: 2, label: 'Grey Scale 16' },
	{ id: 3, label: 'Flat White' },
	{ id: 4, label: 'Flat Grey' },
	{ id: 5, label: 'Flat Black' },
	{ id: 6, label: 'Checker' },
	{ id: 7, label: '17 Point' },
	{ id: 8, label: 'Edge Blend' },
	{ id: 9, label: 'Color Bars' },
	{ id: 10, label: 'Multi Color' },
	{ id: 11, label: 'RGBW Ramp' },
	{ id: 12, label: 'Horizontal Ramp' },
	{ id: 13, label: 'Vertical Ramp' },
	{ id: 14, label: 'Diagonal Ramp' },
	{ id: 15, label: 'Square Grid' },
	{ id: 16, label: 'Diagonal Grid' },
	{ id: 17, label: 'Maximum Activity' },
	{ id: 18, label: 'Prism/Convergence' },
	{ id: 21, label: 'Boresight' },
	{ id: 22, label: 'Convergence' },
	{ id: 23, label: 'Integrator Rod' },
	{ id: 25, label: 'Resolution Demo' },
]

/** Test patterns (ITP values) supported by the projector type. Boxer is used until the type is known. */
export function getTestPatterns(projectorType: ProjectorType): TestPattern[] {
	return projectorType === 'mseries' ? MSERIES_TEST_PATTERNS : BOXER_TEST_PATTERNS
}

/** M-Series input slots: `SIN <slot><input>`; the installed cards have two inputs each */
export const MSERIES_INPUT_SLOTS = [1, 2, 3, 4]
export const MSERIES_INPUTS_PER_SLOT = [1, 2]
