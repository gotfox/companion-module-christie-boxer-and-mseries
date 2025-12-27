import type { CompanionActionDefinitions, CompanionActionEvent } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

// Track active lens movements
const activeLensMovements = new Map<string, NodeJS.Timeout>()

export function UpdateActions(self: ModuleInstance): void {
	const actions: CompanionActionDefinitions = {
		power: {
			name: 'Power',
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 1,
					choices: [
						{ id: 0, label: 'Off' },
						{ id: 1, label: 'On' },
					],
				},
			],
			callback: async (event) => {
				try {
					await self.connection.sendCommand(`PWR ${event.options.state}`)
					self.log('info', `Power ${event.options.state === 1 ? 'on' : 'off'} command sent`)
				} catch (error) {
					self.log('error', `Power command failed: ${error}`)
				}
			},
		},

		shutter: {
			name: 'Shutter',
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 0,
					choices: [
						{ id: 0, label: 'Open' },
						{ id: 1, label: 'Close' },
					],
				},
			],
			callback: async (event) => {
				try {
					await self.connection.sendCommand(`SHU ${event.options.state}`)
					self.log('info', `Shutter ${event.options.state === 0 ? 'open' : 'close'} command sent`)
				} catch (error) {
					self.log('error', `Shutter command failed: ${error}`)
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
			name: 'Lens Focus - Set Position',
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

		lens_focus_increase: {
			name: 'Lens Focus - Increase (Near)',
			options: [
				{
					id: 'speed',
					type: 'dropdown',
					label: 'Speed',
					default: 50,
					choices: [
						{ id: 25, label: 'Slow' },
						{ id: 50, label: 'Medium' },
						{ id: 100, label: 'Fast' },
					],
				},
				{
					id: 'action',
					type: 'dropdown',
					label: 'Action',
					default: 'toggle',
					choices: [
						{ id: 'start', label: 'Start Movement' },
						{ id: 'stop', label: 'Stop Movement' },
						{ id: 'toggle', label: 'Toggle (Start/Stop)' },
					],
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const speed = Number(event.options.speed)
				const action = String(event.options.action)
				handleLensMovement(self, 'focus', 'increase', speed, action)
			},
		},

		lens_focus_decrease: {
			name: 'Lens Focus - Decrease (Far)',
			options: [
				{
					id: 'speed',
					type: 'dropdown',
					label: 'Speed',
					default: 50,
					choices: [
						{ id: 25, label: 'Slow' },
						{ id: 50, label: 'Medium' },
						{ id: 100, label: 'Fast' },
					],
				},
				{
					id: 'action',
					type: 'dropdown',
					label: 'Action',
					default: 'toggle',
					choices: [
						{ id: 'start', label: 'Start Movement' },
						{ id: 'stop', label: 'Stop Movement' },
						{ id: 'toggle', label: 'Toggle (Start/Stop)' },
					],
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const speed = Number(event.options.speed)
				const action = String(event.options.action)
				handleLensMovement(self, 'focus', 'decrease', speed, action)
			},
		},

		lens_zoom: {
			name: 'Lens Zoom - Set Position',
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

		lens_zoom_increase: {
			name: 'Lens Zoom - Increase (In)',
			options: [
				{
					id: 'speed',
					type: 'dropdown',
					label: 'Speed',
					default: 50,
					choices: [
						{ id: 25, label: 'Slow' },
						{ id: 50, label: 'Medium' },
						{ id: 100, label: 'Fast' },
					],
				},
				{
					id: 'action',
					type: 'dropdown',
					label: 'Action',
					default: 'toggle',
					choices: [
						{ id: 'start', label: 'Start Movement' },
						{ id: 'stop', label: 'Stop Movement' },
						{ id: 'toggle', label: 'Toggle (Start/Stop)' },
					],
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const speed = Number(event.options.speed)
				const action = String(event.options.action)
				handleLensMovement(self, 'zoom', 'increase', speed, action)
			},
		},

		lens_zoom_decrease: {
			name: 'Lens Zoom - Decrease (Out)',
			options: [
				{
					id: 'speed',
					type: 'dropdown',
					label: 'Speed',
					default: 50,
					choices: [
						{ id: 25, label: 'Slow' },
						{ id: 50, label: 'Medium' },
						{ id: 100, label: 'Fast' },
					],
				},
				{
					id: 'action',
					type: 'dropdown',
					label: 'Action',
					default: 'toggle',
					choices: [
						{ id: 'start', label: 'Start Movement' },
						{ id: 'stop', label: 'Stop Movement' },
						{ id: 'toggle', label: 'Toggle (Start/Stop)' },
					],
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const speed = Number(event.options.speed)
				const action = String(event.options.action)
				handleLensMovement(self, 'zoom', 'decrease', speed, action)
			},
		},

		lens_horizontal_offset: {
			name: 'Lens Horizontal Offset - Set Position',
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

		lens_horizontal_offset_increase: {
			name: 'Lens Horizontal Offset - Increase (Right)',
			options: [
				{
					id: 'speed',
					type: 'dropdown',
					label: 'Speed',
					default: 50,
					choices: [
						{ id: 25, label: 'Slow' },
						{ id: 50, label: 'Medium' },
						{ id: 100, label: 'Fast' },
					],
				},
				{
					id: 'action',
					type: 'dropdown',
					label: 'Action',
					default: 'toggle',
					choices: [
						{ id: 'start', label: 'Start Movement' },
						{ id: 'stop', label: 'Stop Movement' },
						{ id: 'toggle', label: 'Toggle (Start/Stop)' },
					],
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const speed = Number(event.options.speed)
				const action = String(event.options.action)
				handleLensMovement(self, 'horizontal', 'increase', speed, action)
			},
		},

		lens_horizontal_offset_decrease: {
			name: 'Lens Horizontal Offset - Decrease (Left)',
			options: [
				{
					id: 'speed',
					type: 'dropdown',
					label: 'Speed',
					default: 50,
					choices: [
						{ id: 25, label: 'Slow' },
						{ id: 50, label: 'Medium' },
						{ id: 100, label: 'Fast' },
					],
				},
				{
					id: 'action',
					type: 'dropdown',
					label: 'Action',
					default: 'toggle',
					choices: [
						{ id: 'start', label: 'Start Movement' },
						{ id: 'stop', label: 'Stop Movement' },
						{ id: 'toggle', label: 'Toggle (Start/Stop)' },
					],
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const speed = Number(event.options.speed)
				const action = String(event.options.action)
				handleLensMovement(self, 'horizontal', 'decrease', speed, action)
			},
		},

		lens_vertical_offset: {
			name: 'Lens Vertical Offset - Set Position',
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

		lens_vertical_offset_increase: {
			name: 'Lens Vertical Offset - Increase (Up)',
			options: [
				{
					id: 'speed',
					type: 'dropdown',
					label: 'Speed',
					default: 50,
					choices: [
						{ id: 25, label: 'Slow' },
						{ id: 50, label: 'Medium' },
						{ id: 100, label: 'Fast' },
					],
				},
				{
					id: 'action',
					type: 'dropdown',
					label: 'Action',
					default: 'toggle',
					choices: [
						{ id: 'start', label: 'Start Movement' },
						{ id: 'stop', label: 'Stop Movement' },
						{ id: 'toggle', label: 'Toggle (Start/Stop)' },
					],
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const speed = Number(event.options.speed)
				const action = String(event.options.action)
				handleLensMovement(self, 'vertical', 'increase', speed, action)
			},
		},

		lens_vertical_offset_decrease: {
			name: 'Lens Vertical Offset - Decrease (Down)',
			options: [
				{
					id: 'speed',
					type: 'dropdown',
					label: 'Speed',
					default: 50,
					choices: [
						{ id: 25, label: 'Slow' },
						{ id: 50, label: 'Medium' },
						{ id: 100, label: 'Fast' },
					],
				},
				{
					id: 'action',
					type: 'dropdown',
					label: 'Action',
					default: 'toggle',
					choices: [
						{ id: 'start', label: 'Start Movement' },
						{ id: 'stop', label: 'Stop Movement' },
						{ id: 'toggle', label: 'Toggle (Start/Stop)' },
					],
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const speed = Number(event.options.speed)
				const action = String(event.options.action)
				handleLensMovement(self, 'vertical', 'decrease', speed, action)
			},
		},

		input_select: {
			name: 'Select Input',
			options: [
				{
					id: 'input',
					type: 'dropdown',
					label: 'Input',
					default: 0,
					choices: [
						{ id: 0, label: 'Input 0' },
						{ id: 1, label: 'Input 1' },
						{ id: 2, label: 'Input 2' },
						{ id: 3, label: 'Input 3' },
						{ id: 4, label: 'Input 4' },
						{ id: 5, label: 'Input 5' },
						{ id: 6, label: 'Input 6' },
						{ id: 7, label: 'Input 7' },
						{ id: 8, label: 'Input 8' },
						{ id: 9, label: 'Input 9' },
						{ id: 10, label: 'Input 10' },
						{ id: 11, label: 'Input 11' },
						{ id: 12, label: 'Input 12' },
						{ id: 13, label: 'Input 13' },
						{ id: 14, label: 'Input 14' },
						{ id: 15, label: 'Input 15' },
						{ id: 16, label: 'Input 16' },
						{ id: 17, label: 'Input 17' },
						{ id: 18, label: 'Input 18' },
						{ id: 19, label: 'Input 19' },
						{ id: 20, label: 'Input 20' },
					],
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

/**
 * Handle continuous lens movement
 * @param action - 'start', 'stop', or 'toggle'
 */
function handleLensMovement(
	self: ModuleInstance,
	axis: 'focus' | 'zoom' | 'horizontal' | 'vertical',
	direction: 'increase' | 'decrease',
	speed: number,
	action: string,
): void {
	const key = `${axis}_${direction}`
	const isActive = activeLensMovements.has(key)

	// Determine what to do based on action parameter
	let shouldStart = false
	if (action === 'start') {
		shouldStart = true
	} else if (action === 'stop') {
		shouldStart = false
	} else {
		// toggle
		shouldStart = !isActive
	}

	// Stop movement if requested or if toggling to stop
	if (!shouldStart) {
		const timer = activeLensMovements.get(key)
		if (timer) {
			clearInterval(timer)
			activeLensMovements.delete(key)
			self.log('debug', `Lens ${axis} ${direction} stopped`)
		}
		return
	}

	// Don't start if already active (prevent multiple timers)
	if (isActive) {
		self.log('debug', `Lens ${axis} ${direction} already active`)
		return
	}

	// Get command prefix and limits based on axis
	let command: string
	let min: number
	let max: number
	let variableId: string

	switch (axis) {
		case 'focus':
			command = 'FCS'
			min = -5000
			max = 5000
			variableId = 'lens_focus'
			break
		case 'zoom':
			command = 'ZOM'
			min = -5000
			max = 5000
			variableId = 'lens_zoom'
			break
		case 'horizontal':
			command = 'LHO'
			min = -1600
			max = 1600
			variableId = 'lens_horizontal_offset'
			break
		case 'vertical':
			command = 'LVO'
			min = -1600
			max = 1600
			variableId = 'lens_vertical_offset'
			break
	}

	// Calculate step size and interval based on speed
	const step = direction === 'increase' ? speed : -speed
	const interval = 100 // Send command every 100ms

	// Start continuous movement
	const timer = setInterval(() => {
		// Get current position from variable
		const currentPosStr = self.getVariableValue(variableId) as string
		const currentPos = parseInt(currentPosStr) || 0

		// Calculate new position
		const newPos = Math.max(min, Math.min(max, currentPos + step))

		// Send command
		void self.connection.sendCommand(`${command} ${newPos}`).catch((error) => {
			self.log('warn', `Lens ${axis} movement error: ${error}`)
		})

		// Stop if we've reached the limit
		if (newPos === min || newPos === max) {
			const timer = activeLensMovements.get(key)
			if (timer) {
				clearInterval(timer)
				activeLensMovements.delete(key)
				self.log('debug', `Lens ${axis} reached limit`)
			}
		}
	}, interval)

	activeLensMovements.set(key, timer)
	self.log('debug', `Lens ${axis} ${direction} started at speed ${speed}`)
}

/**
 * Stop all active lens movements
 */
export function stopAllLensMovements(): void {
	for (const timer of activeLensMovements.values()) {
		clearInterval(timer)
	}
	activeLensMovements.clear()
}
