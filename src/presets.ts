import {
	combineRgb,
	type CompanionPresetDefinitions,
	type CompanionPresetSection,
	type CompanionSimplePresetDefinition,
} from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import type { ModuleTypes } from './types.js'

type SimplePreset = CompanionSimplePresetDefinition<ModuleTypes>

const WHITE = combineRgb(255, 255, 255)

/**
 * Button that moves the lens for as long as it is held:
 * movement starts on press and stops on release
 */
function lensHoldPreset(
	name: string,
	text: string,
	size: '18' | '44',
	bgcolor: number,
	actionId: string,
): SimplePreset {
	return {
		type: 'simple',
		name,
		style: { text, size, color: WHITE, bgcolor },
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
	feedbackId: string,
	activeBgcolor: number,
): SimplePreset {
	return {
		type: 'simple',
		name,
		style: { text, size: '18', color: WHITE, bgcolor },
		steps: [{ down: [{ actionId, options: { state } }], up: [] }],
		feedbacks: [
			{
				feedbackId,
				options: {},
				style: { bgcolor: activeBgcolor, color: WHITE },
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
			'power_on',
			combineRgb(0, 170, 0),
		),
		power_off: toggleStatePreset(
			'Power Off',
			'POWER\nOFF',
			combineRgb(60, 60, 60),
			'power',
			0,
			'power_off',
			combineRgb(150, 0, 0),
		),
		shutter_open: toggleStatePreset(
			'Shutter Open',
			'SHUTTER\nOPEN',
			combineRgb(0, 60, 0),
			'shutter',
			0,
			'shutter_open',
			combineRgb(0, 170, 0),
		),
		shutter_close: toggleStatePreset(
			'Shutter Close',
			'SHUTTER\nCLOSE',
			combineRgb(60, 0, 0),
			'shutter',
			1,
			'shutter_closed',
			combineRgb(200, 0, 0),
		),

		lens_focus_near: lensHoldPreset(
			'Focus + (Near)',
			'FOCUS\nNEAR',
			'18',
			combineRgb(0, 0, 136),
			'lens_focus_increase',
		),
		lens_focus_far: lensHoldPreset('Focus - (Far)', 'FOCUS\nFAR', '18', combineRgb(0, 0, 136), 'lens_focus_decrease'),

		lens_zoom_in: lensHoldPreset('Zoom + (In)', 'ZOOM\nIN', '18', combineRgb(136, 0, 136), 'lens_zoom_increase'),
		lens_zoom_out: lensHoldPreset('Zoom - (Out)', 'ZOOM\nOUT', '18', combineRgb(136, 0, 136), 'lens_zoom_decrease'),

		lens_vertical_up: lensHoldPreset(
			'Vertical Offset + (Up)',
			'▲',
			'44',
			combineRgb(0, 120, 120),
			'lens_vertical_offset_increase',
		),
		lens_vertical_down: lensHoldPreset(
			'Vertical Offset - (Down)',
			'▼',
			'44',
			combineRgb(0, 120, 120),
			'lens_vertical_offset_decrease',
		),
		lens_horizontal_right: lensHoldPreset(
			'Horizontal Offset + (Right)',
			'▶',
			'44',
			combineRgb(0, 120, 120),
			'lens_horizontal_offset_increase',
		),
		lens_horizontal_left: lensHoldPreset(
			'Horizontal Offset - (Left)',
			'◀',
			'44',
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
