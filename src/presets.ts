import {
	combineRgb,
	type CompanionPresetDefinitions,
	type CompanionPresetSection,
	type CompanionLayeredButtonPresetDefinition,
} from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { MSERIES_INPUT_SLOTS, MSERIES_INPUTS_PER_SLOT, getTestPatterns } from './test-patterns.js'
import type { ModuleTypes } from './types.js'
import type { ProjectorType } from './utils.js'
import { LEGACY_PRESETS } from './legacy-presets.js'

type LayeredPreset = CompanionLayeredButtonPresetDefinition<ModuleTypes>

const WHITE = combineRgb(255, 255, 255)

/**
 * Button face: a full-size background box plus a centred text layer.
 * The text is set to font size 100 with shrink-to-fit so it never gets truncated.
 */
function buttonFace(text: string, bgcolor: number): LayeredPreset['elements'] {
	return [
		{ id: 'bg', type: 'box', name: 'Background', x: 0, y: 0, width: 100, height: 100, color: bgcolor },
		{
			id: 'label',
			type: 'text',
			name: 'Label',
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			text,
			fontsize: 100,
			fontsizeAllowShrink: true,
			color: WHITE,
			halign: 'center',
			valign: 'center',
		},
	]
}

/**
 * Button that moves the lens for as long as it is held:
 * movement starts on press and stops on release
 */
function lensHoldPreset(name: string, text: string, bgcolor: number, actionId: string): LayeredPreset {
	return {
		type: 'layered',
		name,
		elements: buttonFace(text, bgcolor),
		steps: [
			{
				down: [{ actionId, options: { speed: 50, action: 'start' } }],
				up: [{ actionId, options: { speed: 50, action: 'stop' } }],
			},
		],
		feedbacks: [],
	}
}

function toggleStatePreset(
	name: string,
	text: string,
	bgcolor: number,
	actionId: 'power' | 'shutter',
	state: number,
	feedbackId: 'power_state' | 'shutter_state',
	feedbackState: string,
	activeBgcolor: number,
): LayeredPreset {
	return {
		type: 'layered',
		name,
		elements: buttonFace(text, bgcolor),
		steps: [{ down: [{ actionId, options: { state } }], up: [] }],
		feedbacks: [
			{
				feedbackId,
				options: { state: feedbackState },
				styleOverrides: [{ elementId: 'bg', elementProperty: 'color', override: activeBgcolor }],
			},
		],
	}
}

/** Single-action button (press to run the action, no feedback) */
function actionPreset(
	name: string,
	text: string,
	bgcolor: number,
	actionId: string,
	options: { [key: string]: number },
): LayeredPreset {
	return {
		type: 'layered',
		name,
		elements: buttonFace(text, bgcolor),
		steps: [{ down: [{ actionId, options }], up: [] }],
		feedbacks: [],
	}
}

/**
 * Test pattern button: dim until its pattern is displayed, then highlighted.
 * The other pattern buttons stay dim, so only the active one looks selected.
 */
function testPatternPreset(pattern: { id: number; label: string }): LayeredPreset {
	const isOff = pattern.id === 0
	return {
		type: 'layered',
		name: `Test Pattern: ${pattern.label}`,
		elements: buttonFace(isOff ? 'TEST\nOFF' : pattern.label, isOff ? combineRgb(100, 0, 0) : combineRgb(60, 60, 60)),
		steps: [{ down: [{ actionId: 'test_pattern', options: { pattern: pattern.id } }], up: [] }],
		feedbacks: [
			{
				feedbackId: 'test_pattern_active',
				options: { pattern: pattern.id },
				styleOverrides: [
					{
						elementId: 'bg',
						elementProperty: 'color',
						override: isOff ? combineRgb(200, 0, 0) : combineRgb(0, 170, 0),
					},
				],
			},
		],
	}
}

export function UpdatePresets(self: ModuleInstance, projectorType: ProjectorType = 'unknown'): void {
	const presets: CompanionPresetDefinitions<ModuleTypes> = {
		power_on: toggleStatePreset(
			'Power On',
			'POWER\nON',
			combineRgb(0, 60, 0),
			'power',
			1,
			'power_state',
			'on',
			combineRgb(0, 170, 0),
		),
		power_off: toggleStatePreset(
			'Power Off',
			'POWER\nOFF',
			combineRgb(60, 60, 60),
			'power',
			0,
			'power_state',
			'standby',
			combineRgb(150, 0, 0),
		),
		shutter_open: toggleStatePreset(
			'Shutter Open',
			'SHUTTER\nOPEN',
			combineRgb(0, 60, 0),
			'shutter',
			0,
			'shutter_state',
			'open',
			combineRgb(0, 170, 0),
		),
		shutter_close: toggleStatePreset(
			'Shutter Close',
			'SHUTTER\nCLOSE',
			combineRgb(60, 0, 0),
			'shutter',
			1,
			'shutter_state',
			'closed',
			combineRgb(200, 0, 0),
		),

		lens_focus_near: lensHoldPreset('Focus + (Near)', 'FOCUS\nNEAR', combineRgb(0, 0, 136), 'lens_focus_increase'),
		lens_focus_far: lensHoldPreset('Focus - (Far)', 'FOCUS\nFAR', combineRgb(0, 0, 136), 'lens_focus_decrease'),

		lens_zoom_in: lensHoldPreset('Zoom + (In)', 'ZOOM\nIN', combineRgb(136, 0, 136), 'lens_zoom_increase'),
		lens_zoom_out: lensHoldPreset('Zoom - (Out)', 'ZOOM\nOUT', combineRgb(136, 0, 136), 'lens_zoom_decrease'),

		lens_vertical_up: lensHoldPreset(
			'Vertical Offset + (Up)',
			'▲',
			combineRgb(0, 120, 120),
			'lens_vertical_offset_increase',
		),
		lens_vertical_down: lensHoldPreset(
			'Vertical Offset - (Down)',
			'▼',
			combineRgb(0, 120, 120),
			'lens_vertical_offset_decrease',
		),
		lens_horizontal_right: lensHoldPreset(
			'Horizontal Offset + (Right)',
			'▶',
			combineRgb(0, 120, 120),
			'lens_horizontal_offset_increase',
		),
		lens_horizontal_left: lensHoldPreset(
			'Horizontal Offset - (Left)',
			'◀',
			combineRgb(0, 120, 120),
			'lens_horizontal_offset_decrease',
		),
	}

	// OSD
	presets.osd_on = actionPreset('OSD On', 'OSD\nON', combineRgb(0, 60, 0), 'osd', { state: 1 })
	presets.osd_off = actionPreset('OSD Off', 'OSD\nOFF', combineRgb(60, 60, 60), 'osd', { state: 0 })

	// Input slots (M-Series selects "<slot><input>", e.g. SIN 12 = slot 1 input 2)
	const inputPresetIds: string[] = []
	if (projectorType === 'mseries') {
		for (const slot of MSERIES_INPUT_SLOTS) {
			for (const input of MSERIES_INPUTS_PER_SLOT) {
				const id = `input_slot${slot}_input${input}`
				presets[id] = actionPreset(
					`Slot ${slot} Input ${input}`,
					`SLOT ${slot}\nINPUT ${input}`,
					combineRgb(0, 0, 100),
					'input_select',
					{ input: slot * 10 + input },
				)
				inputPresetIds.push(id)
			}
		}
	}

	// Test patterns (the list depends on the projector type)
	const testPatternPresetIds: string[] = []
	for (const pattern of getTestPatterns(projectorType)) {
		const id = `test_pattern_${pattern.id}`
		presets[id] = testPatternPreset(pattern)
		testPatternPresetIds.push(id)
	}

	const structure: CompanionPresetSection<ModuleTypes>[] = [
		{
			id: 'power',
			name: 'Power',
			definitions: [{ id: 'power_buttons', type: 'simple', name: 'Power', presets: ['power_on', 'power_off'] }],
		},
		{
			id: 'shutter',
			name: 'Shutter',
			definitions: [
				{ id: 'shutter_buttons', type: 'simple', name: 'Shutter', presets: ['shutter_open', 'shutter_close'] },
			],
		},
		{
			id: 'osd',
			name: 'On-Screen Display',
			definitions: [{ id: 'osd_buttons', type: 'simple', name: 'OSD', presets: ['osd_on', 'osd_off'] }],
		},
		...(inputPresetIds.length > 0
			? [
					{
						id: 'inputs',
						name: 'Inputs',
						definitions: [{ id: 'input_slots', type: 'simple' as const, name: 'Input Slots', presets: inputPresetIds }],
					},
				]
			: []),
		{
			id: 'test_patterns',
			name: 'Test Patterns',
			definitions: [
				{ id: 'test_pattern_buttons', type: 'simple', name: 'Test Patterns', presets: testPatternPresetIds },
			],
		},
		{
			id: 'lens',
			name: 'Lens',
			description: 'Hold the button to move the lens, release to stop',
			definitions: [
				{ id: 'lens_focus', type: 'simple', name: 'Focus', presets: ['lens_focus_near', 'lens_focus_far'] },
				{ id: 'lens_zoom', type: 'simple', name: 'Zoom', presets: ['lens_zoom_in', 'lens_zoom_out'] },
				{
					id: 'lens_offset',
					type: 'simple',
					name: 'Offset',
					presets: ['lens_vertical_up', 'lens_vertical_down', 'lens_horizontal_left', 'lens_horizontal_right'],
				},
			],
		},
	]

	// Presets of companion-module-christie-projector, grouped by their original categories
	const legacyDefinitions = new Map<string, string[]>()
	LEGACY_PRESETS.forEach((legacy, index) => {
		const id = `legacy_${index}`
		presets[id] = {
			type: 'simple',
			name: legacy.n,
			style: {
				text: legacy.t.replace('$(LABEL:', `$(${self.label}:`),
				size: legacy.sz as '18',
				color: legacy.fg,
				bgcolor: legacy.bg,
			},
			steps: legacy.s,
			feedbacks: legacy.f,
		}
		const ids = legacyDefinitions.get(legacy.c) ?? []
		ids.push(id)
		legacyDefinitions.set(legacy.c, ids)
	})

	structure.push({
		id: 'legacy',
		name: 'Christie Projector (legacy)',
		description: 'Presets of the christie-projector module, using its action ids',
		definitions: [...legacyDefinitions].map(([category, ids]) => ({
			id: `legacy_${category.replace(/\W+/g, '_').toLowerCase()}`,
			type: 'simple' as const,
			name: category,
			presets: ids,
		})),
	})

	self.setPresetDefinitions(structure, presets)
}
