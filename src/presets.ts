import {
	combineRgb,
	type CompanionPresetDefinitions,
	type CompanionPresetSection,
	type CompanionLayeredButtonPresetDefinition,
} from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import type { ModuleTypes } from './types.js'

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

export function UpdatePresets(self: ModuleInstance): void {
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

	self.setPresetDefinitions(structure, presets)
}
