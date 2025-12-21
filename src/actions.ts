import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateActions(self: ModuleInstance): void {
	const actions: CompanionActionDefinitions = {
		power_on: {
			name: 'Power On',
			options: [],
			callback: async () => {
				try {
					await self.connection.sendCommand('PWR 1')
					self.log('info', 'Power on command sent')
				} catch (error) {
					self.log('error', `Power on failed: ${error}`)
				}
			},
		},

		power_off: {
			name: 'Power Off',
			options: [],
			callback: async () => {
				try {
					await self.connection.sendCommand('PWR 0')
					self.log('info', 'Power off command sent')
				} catch (error) {
					self.log('error', `Power off failed: ${error}`)
				}
			},
		},

		shutter_open: {
			name: 'Shutter Open',
			options: [],
			callback: async () => {
				try {
					await self.connection.sendCommand('SHU 0')
					self.log('info', 'Shutter open command sent')
				} catch (error) {
					self.log('error', `Shutter open failed: ${error}`)
				}
			},
		},

		shutter_close: {
			name: 'Shutter Close',
			options: [],
			callback: async () => {
				try {
					await self.connection.sendCommand('SHU 1')
					self.log('info', 'Shutter close command sent')
				} catch (error) {
					self.log('error', `Shutter close failed: ${error}`)
				}
			},
		},

		test_pattern: {
			name: 'Test Pattern',
			options: [
				{
					id: 'pattern',
					type: 'dropdown',
					label: 'Pattern',
					default: 0,
					choices: [
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
					],
				},
			],
			callback: async (event) => {
				try {
					await self.connection.sendCommand(`ITP ${event.options.pattern}`)
					self.log('info', `Test pattern ${event.options.pattern} sent`)
				} catch (error) {
					self.log('error', `Test pattern failed: ${error}`)
				}
			},
		},

		lens_focus: {
			name: 'Lens Focus',
			options: [
				{
					id: 'position',
					type: 'number',
					label: 'Position',
					default: 0,
					min: -5000,
					max: 5000,
				},
			],
			callback: async (event) => {
				try {
					await self.connection.sendCommand(`FCS ${event.options.position}`)
					self.log('info', `Lens focus set to ${event.options.position}`)
				} catch (error) {
					self.log('error', `Lens focus failed: ${error}`)
				}
			},
		},

		lens_zoom: {
			name: 'Lens Zoom',
			options: [
				{
					id: 'position',
					type: 'number',
					label: 'Position',
					default: 0,
					min: -5000,
					max: 5000,
				},
			],
			callback: async (event) => {
				try {
					await self.connection.sendCommand(`ZOM ${event.options.position}`)
					self.log('info', `Lens zoom set to ${event.options.position}`)
				} catch (error) {
					self.log('error', `Lens zoom failed: ${error}`)
				}
			},
		},

		lens_horizontal_offset: {
			name: 'Lens Horizontal Offset',
			options: [
				{
					id: 'position',
					type: 'number',
					label: 'Position',
					default: 0,
					min: -1600,
					max: 1600,
				},
			],
			callback: async (event) => {
				try {
					await self.connection.sendCommand(`LHO ${event.options.position}`)
					self.log('info', `Lens horizontal offset set to ${event.options.position}`)
				} catch (error) {
					self.log('error', `Lens horizontal offset failed: ${error}`)
				}
			},
		},

		lens_vertical_offset: {
			name: 'Lens Vertical Offset',
			options: [
				{
					id: 'position',
					type: 'number',
					label: 'Position',
					default: 0,
					min: -1600,
					max: 1600,
				},
			],
			callback: async (event) => {
				try {
					await self.connection.sendCommand(`LVO ${event.options.position}`)
					self.log('info', `Lens vertical offset set to ${event.options.position}`)
				} catch (error) {
					self.log('error', `Lens vertical offset failed: ${error}`)
				}
			},
		},

		input_select: {
			name: 'Select Input',
			options: [
				{
					id: 'input',
					type: 'number',
					label: 'Input Number',
					default: 0,
					min: 0,
					max: 20,
				},
			],
			callback: async (event) => {
				try {
					await self.connection.sendCommand(`SIN ${event.options.input}`)
					self.log('info', `Input ${event.options.input} selected`)
				} catch (error) {
					self.log('error', `Input select failed: ${error}`)
				}
			},
		},

		custom_command: {
			name: 'Custom Command',
			options: [
				{
					id: 'command',
					type: 'textinput',
					label: 'Command',
					default: '',
					useVariables: true,
				},
			],
			callback: async (event) => {
				try {
					const cmd = await self.parseVariablesInString(event.options.command as string)
					await self.connection.sendCommand(cmd)
					self.log('info', `Custom command sent: ${cmd}`)
				} catch (error) {
					self.log('error', `Custom command failed: ${error}`)
				}
			},
		},
	}

	self.setActionDefinitions(actions)
}
