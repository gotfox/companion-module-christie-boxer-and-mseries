import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

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
					default: '1',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: 'On' },
						{ id: '2', label: 'Cooling' },
						{ id: '3', label: 'Warming' },
					],
				},
			],
			callback: (feedback) => {
				const powerStatus = self.getVariableValue('power_status')
				return powerStatus === feedback.options.state
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
					default: '0',
					choices: [
						{ id: '0', label: 'Open' },
						{ id: '1', label: 'Closed' },
					],
				},
			],
			callback: (feedback) => {
				const shutterStatus = self.getVariableValue('shutter_status')
				return shutterStatus === feedback.options.state
			},
		},

		signal_present: {
			name: 'Signal Present',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 200, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				const signalStatus = self.getVariableValue('signal_status')
				// Signal is present if status is '1' or any non-zero value
				return signalStatus === '1' || (signalStatus !== '0' && signalStatus !== '')
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
						{ id: 'lamp_3_hours', label: 'Lamp 3' },
						{ id: 'lamp_4_hours', label: 'Lamp 4' },
						{ id: 'lamp_5_hours', label: 'Lamp 5' },
						{ id: 'lamp_6_hours', label: 'Lamp 6' },
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
				const lampHoursStr = self.getVariableValue(feedback.options.lamp as string)
				if (!lampHoursStr || lampHoursStr === 'Unknown' || lampHoursStr === 'N/A') {
					return false
				}

				// Parse hours from format "314:41" -> 314
				const hoursMatch = lampHoursStr.toString().match(/^(\d+):/)
				if (!hoursMatch) {
					return false
				}

				const hours = parseInt(hoursMatch[1], 10)
				return hours >= Number(feedback.options.threshold)
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
			callback: () => {
				const powerStatus = self.getVariableValue('power_status')
				return powerStatus === '1'
			},
		},

		power_off: {
			name: 'Power Is Off',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(64, 64, 64),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				const powerStatus = self.getVariableValue('power_status')
				return powerStatus === '0'
			},
		},

		shutter_open: {
			name: 'Shutter Is Open',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 200, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				const shutterStatus = self.getVariableValue('shutter_status')
				return shutterStatus === '0'
			},
		},

		shutter_closed: {
			name: 'Shutter Is Closed',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(200, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				const shutterStatus = self.getVariableValue('shutter_status')
				return shutterStatus === '1'
			},
		},
	}

	self.setFeedbackDefinitions(feedbacks)
}
