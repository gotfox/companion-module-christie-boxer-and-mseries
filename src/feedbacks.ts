import { combineRgb, type CompanionFeedbackDefinitions } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { optionString } from './utils.js'

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

		power_on: {
			name: 'Power Is On',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => getPowerStatus(self) === 'on',
		},

		power_off: {
			name: 'Power Is Off',
			description: 'Active while the projector is in standby',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(64, 64, 64),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => getPowerStatus(self).startsWith('standby'),
		},

		shutter_open: {
			name: 'Shutter Is Open',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 200, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => getShutterStatus(self) === 'open',
		},

		shutter_closed: {
			name: 'Shutter Is Closed',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(200, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => getShutterStatus(self) === 'closed',
		},
	}

	self.setFeedbackDefinitions(feedbacks)
}
