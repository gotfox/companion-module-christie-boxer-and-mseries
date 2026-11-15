import {
	combineRgb,
	type CompanionAdvancedFeedbackResult,
	type CompanionFeedbackDefinitions,
	type SomeCompanionFeedbackInputField,
} from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { optionString } from './utils.js'
import { legacyPowerState, legacyShutterState } from './legacy-variables.js'
import { getTestPatterns } from './test-patterns.js'

/** Variables that hold the signal state of every Boxer input / the M-Series main input */
const BOXER_SIGNAL_VARIABLES = [
	'signal_hdbaset',
	'signal_card0_input1',
	'signal_card0_input2',
	'signal_card0_input3',
	'signal_card0_input4',
	'signal_card1_input1',
	'signal_card1_input2',
	'signal_card2_input1',
	'signal_card2_input2',
	'signal_card3_input1',
	'signal_card3_input2',
	'signal_card4_input1',
	'signal_card4_input2',
]

/** Normalised (lower case) power status text, e.g. "on", "standby mode", "cooling down", "warming up" */
function getPowerStatus(self: ModuleInstance): string {
	return optionString(self.getVariableValue('power_status')).toLowerCase()
}

/** Normalised (lower case) shutter status text: "open" or "closed" */
function getShutterStatus(self: ModuleInstance): string {
	return optionString(self.getVariableValue('shutter_status')).toLowerCase()
}

function isSignalGood(value: unknown): boolean {
	const text = optionString(value).toLowerCase()
	return text !== '' && !/no signal|unknown|n\/a|^none$/.test(text)
}

/** Color options shared by the christie-projector feedbacks below (same ids, so stored buttons keep their colors) */
function colorOption(id: string, label: string, color: number): SomeCompanionFeedbackInputField {
	return { id, type: 'colorpicker', label, default: color }
}

/** Foreground / background of an old-style "one color per state" feedback */
function stateStyle(options: Record<string, unknown>, fg: string, bg: string): CompanionAdvancedFeedbackResult {
	return { color: Number(options[fg]), bgcolor: Number(options[bg]) }
}

/**
 * Advanced (one color per state) feedbacks ported from companion-module-christie-projector.
 * They keep the option ids of the original so buttons that used them keep their colors.
 */
function getLegacyFeedbacks(self: ModuleInstance): CompanionFeedbackDefinitions {
	return {
		// Renamed from `power_state` by the upgrade script, that id is the boolean feedback above
		power_state_colors: {
			type: 'advanced',
			name: 'Power State - colors per state (christie-projector)',
			description: 'Change colors of the button depending on the power state',
			affectedProperties: ['color', 'bgcolor'],
			options: [
				colorOption('fg1', 'Foreground color light', combineRgb(255, 255, 255)),
				colorOption('fg2', 'Foreground color dark', combineRgb(0, 0, 0)),
				colorOption('bg1', 'Background color on', combineRgb(0, 204, 0)),
				colorOption('bg2', 'Background color off', combineRgb(255, 0, 0)),
				colorOption('bg3', 'Background color boot mode', combineRgb(255, 255, 0)),
				colorOption('bg4', 'Background color cooldown', combineRgb(255, 255, 0)),
				colorOption('bg5', 'Background color warm up', combineRgb(255, 255, 0)),
			],
			callback: (feedback) => {
				switch (legacyPowerState(getPowerStatus(self))) {
					case 'On':
						return stateStyle(feedback.options, 'fg1', 'bg1')
					case 'Off':
						return stateStyle(feedback.options, 'fg1', 'bg2')
					case 'Boot':
						return stateStyle(feedback.options, 'fg2', 'bg3')
					case 'Cool Down':
						return stateStyle(feedback.options, 'fg2', 'bg4')
					case 'Warm Up':
						return stateStyle(feedback.options, 'fg2', 'bg5')
					default:
						return {}
				}
			},
		},

		shutter_closed: {
			type: 'advanced',
			name: 'Shutter State - colors per state (christie-projector)',
			description: 'Change colors of the button depending on the shutter state',
			affectedProperties: ['color', 'bgcolor'],
			options: [
				colorOption('fg1', 'Foreground color', combineRgb(255, 255, 255)),
				colorOption('bg1', 'Background color closed', combineRgb(255, 0, 0)),
				colorOption('bg2', 'Background color open', combineRgb(0, 204, 0)),
			],
			callback: (feedback) => {
				switch (legacyShutterState(getShutterStatus(self))) {
					case 'Closed':
						return stateStyle(feedback.options, 'fg1', 'bg1')
					case 'Open':
						return stateStyle(feedback.options, 'fg1', 'bg2')
					default:
						return {}
				}
			},
		},

		signal_state: {
			type: 'advanced',
			name: 'Signal Status - colors per state (christie-projector)',
			description: 'Change colors of the button depending on the signal status',
			affectedProperties: ['color', 'bgcolor'],
			options: [
				colorOption('fg1', 'Foreground color light', combineRgb(255, 255, 255)),
				colorOption('fg2', 'Foreground color dark', combineRgb(0, 0, 0)),
				colorOption('bg1', 'Background color good signal', combineRgb(0, 204, 0)),
				colorOption('bg2', 'Background color signal missing', combineRgb(255, 0, 0)),
				colorOption('bg3', 'Background color bad sync', combineRgb(255, 255, 0)),
			],
			callback: (feedback) => {
				// SST+SIGN sub-code 000: main signal state (M-Series) / HDBaseT (Boxer), as in christie-projector
				const state = optionString(self.getVariableValue('signal_state'))
				if (state === 'Good Signal') return stateStyle(feedback.options, 'fg1', 'bg1')
				if (state === 'Signal Missing') return stateStyle(feedback.options, 'fg1', 'bg2')
				if (state === 'Bad Sync') return stateStyle(feedback.options, 'fg2', 'bg3')
				return {}
			},
		},
	}
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	const feedbacks: CompanionFeedbackDefinitions = {
		power_state: {
			name: 'Power State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'on',
					choices: [
						{ id: 'standby', label: 'Standby' },
						{ id: 'on', label: 'On' },
						{ id: 'cooling', label: 'Cooling Down' },
						{ id: 'warming', label: 'Warming Up' },
					],
				},
			],
			callback: (feedback) => {
				return getPowerStatus(self).startsWith(optionString(feedback.options.state))
			},
		},

		shutter_state: {
			name: 'Shutter State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 165, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'open',
					choices: [
						{ id: 'open', label: 'Open' },
						{ id: 'closed', label: 'Closed' },
					],
				},
			],
			callback: (feedback) => {
				return getShutterStatus(self) === optionString(feedback.options.state)
			},
		},

		signal_present: {
			name: 'Signal Present',
			description: 'Active when any input (Boxer) or the main input (M-Series) reports a signal',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 200, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				if (self.getProjectorType() === 'mseries') {
					return isSignalGood(self.getVariableValue('main_signal_state'))
				}
				return BOXER_SIGNAL_VARIABLES.some((variableId) => isSignalGood(self.getVariableValue(variableId)))
			},
		},

		test_pattern_active: {
			name: 'Test Pattern Active',
			description: 'Active while the selected test pattern is displayed',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 170, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'pattern',
					type: 'dropdown',
					label: 'Pattern',
					default: 0,
					// The list depends on the projector type, the feedbacks are rebuilt once it is known
					choices: getTestPatterns(self.getProjectorType()).map(({ id, label }) => ({ id, label })),
				},
			],
			callback: (feedback) => {
				const current = optionString(self.getVariableValue('test_pattern_id'))
				return current !== '' && Number(current) === Number(feedback.options.pattern)
			},
		},

		lamp_hours_threshold: {
			name: 'Lamp Hours Threshold',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'lamp',
					type: 'dropdown',
					label: 'Lamp',
					default: 'lamp_1_hours',
					choices: [
						{ id: 'lamp_1_hours', label: 'Lamp 1' },
						{ id: 'lamp_2_hours', label: 'Lamp 2' },
						{ id: 'lamp_3_hours', label: 'Lamp 3 (Boxer only)' },
						{ id: 'lamp_4_hours', label: 'Lamp 4 (Boxer only)' },
						{ id: 'lamp_5_hours', label: 'Lamp 5 (Boxer only)' },
						{ id: 'lamp_6_hours', label: 'Lamp 6 (Boxer only)' },
					],
				},
				{
					id: 'threshold',
					type: 'number',
					label: 'Threshold (hours)',
					default: 1000,
					min: 0,
					max: 10000,
				},
			],
			callback: (feedback) => {
				const lampHoursStr = self.getVariableValue(optionString(feedback.options.lamp))

				// Parse hours from format "314:41" -> 314
				const hoursMatch = optionString(lampHoursStr).match(/^(\d+):/)
				if (!hoursMatch) {
					return false
				}

				return parseInt(hoursMatch[1], 10) >= Number(feedback.options.threshold)
			},
		},
	}

	self.setFeedbackDefinitions({ ...feedbacks, ...getLegacyFeedbacks(self) })
}
