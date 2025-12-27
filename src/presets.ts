import type { CompanionPresetDefinitions, CompanionButtonStyleProps } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {
		power_on: {
			type: 'button',
			category: 'Power',
			name: 'Power On',
			style: {
				text: 'POWER\\nON',
				size: '18',
				color: 0xffffff,
				bgcolor: 0x005500,
			} as CompanionButtonStyleProps,
			steps: [
				{
					down: [
						{
							actionId: 'power',
							options: {
								state: 1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'power_is_on',
					options: {},
					style: {
						bgcolor: 0x00aa00,
					},
				},
			],
		},

		power_off: {
			type: 'button',
			category: 'Power',
			name: 'Power Off',
			style: {
				text: 'POWER\\nOFF',
				size: '18',
				color: 0xffffff,
				bgcolor: 0x555555,
			} as CompanionButtonStyleProps,
			steps: [
				{
					down: [
						{
							actionId: 'power',
							options: {
								state: 0,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'power_is_off',
					options: {},
					style: {
						bgcolor: 0x333333,
					},
				},
			],
		},

		shutter_open: {
			type: 'button',
			category: 'Shutter',
			name: 'Shutter Open',
			style: {
				text: 'SHUTTER\\nOPEN',
				size: '18',
				color: 0xffffff,
				bgcolor: 0x005500,
			} as CompanionButtonStyleProps,
			steps: [
				{
					down: [
						{
							actionId: 'shutter',
							options: {
								state: 0,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'shutter_is_open',
					options: {},
					style: {
						bgcolor: 0x00aa00,
					},
				},
			],
		},

		shutter_close: {
			type: 'button',
			category: 'Shutter',
			name: 'Shutter Close',
			style: {
				text: 'SHUTTER\\nCLOSE',
				size: '18',
				color: 0xffffff,
				bgcolor: 0xaa0000,
			} as CompanionButtonStyleProps,
			steps: [
				{
					down: [
						{
							actionId: 'shutter',
							options: {
								state: 1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'shutter_is_closed',
					options: {},
					style: {
						bgcolor: 0xff0000,
					},
				},
			],
		},

		lens_focus_near: {
			type: 'button',
			category: 'Lens Focus',
			name: 'Focus Near (+)',
			style: {
				text: 'FOCUS\\nNEAR',
				size: '18',
				color: 0xffffff,
				bgcolor: 0x000088,
			} as CompanionButtonStyleProps,
			steps: [
				{
					down: [
						{
							actionId: 'lens_focus_increase',
							options: {
								speed: 50,
								action: 'start',
							},
						},
					],
					up: [
						{
							actionId: 'lens_focus_increase',
							options: {
								speed: 50,
								action: 'stop',
							},
						},
					],
				},
			],
			feedbacks: [],
		},

		lens_focus_far: {
			type: 'button',
			category: 'Lens Focus',
			name: 'Focus Far (-)',
			style: {
				text: 'FOCUS\\nFAR',
				size: '18',
				color: 0xffffff,
				bgcolor: 0x000088,
			} as CompanionButtonStyleProps,
			steps: [
				{
					down: [
						{
							actionId: 'lens_focus_decrease',
							options: {
								speed: 50,
								action: 'start',
							},
						},
					],
					up: [
						{
							actionId: 'lens_focus_decrease',
							options: {
								speed: 50,
								action: 'stop',
							},
						},
					],
				},
			],
			feedbacks: [],
		},

		lens_zoom_in: {
			type: 'button',
			category: 'Lens Zoom',
			name: 'Zoom In (+)',
			style: {
				text: 'ZOOM\\nIN',
				size: '18',
				color: 0xffffff,
				bgcolor: 0x880088,
			} as CompanionButtonStyleProps,
			steps: [
				{
					down: [
						{
							actionId: 'lens_zoom_increase',
							options: {
								speed: 50,
								action: 'start',
							},
						},
					],
					up: [
						{
							actionId: 'lens_zoom_increase',
							options: {
								speed: 50,
								action: 'stop',
							},
						},
					],
				},
			],
			feedbacks: [],
		},

		lens_zoom_out: {
			type: 'button',
			category: 'Lens Zoom',
			name: 'Zoom Out (-)',
			style: {
				text: 'ZOOM\\nOUT',
				size: '18',
				color: 0xffffff,
				bgcolor: 0x880088,
			} as CompanionButtonStyleProps,
			steps: [
				{
					down: [
						{
							actionId: 'lens_zoom_decrease',
							options: {
								speed: 50,
								action: 'start',
							},
						},
					],
					up: [
						{
							actionId: 'lens_zoom_decrease',
							options: {
								speed: 50,
								action: 'stop',
							},
						},
					],
				},
			],
			feedbacks: [],
		},

		lens_vertical_up: {
			type: 'button',
			category: 'Lens Offset',
			name: 'Vertical Up',
			style: {
				text: '▲',
				size: '44',
				color: 0xffffff,
				bgcolor: 0x008888,
			} as CompanionButtonStyleProps,
			steps: [
				{
					down: [
						{
							actionId: 'lens_vertical_offset_increase',
							options: {
								speed: 50,
								action: 'start',
							},
						},
					],
					up: [
						{
							actionId: 'lens_vertical_offset_increase',
							options: {
								speed: 50,
								action: 'stop',
							},
						},
					],
				},
			],
			feedbacks: [],
		},

		lens_vertical_down: {
			type: 'button',
			category: 'Lens Offset',
			name: 'Vertical Down',
			style: {
				text: '▼',
				size: '44',
				color: 0xffffff,
				bgcolor: 0x008888,
			} as CompanionButtonStyleProps,
			steps: [
				{
					down: [
						{
							actionId: 'lens_vertical_offset_decrease',
							options: {
								speed: 50,
								action: 'start',
							},
						},
					],
					up: [
						{
							actionId: 'lens_vertical_offset_decrease',
							options: {
								speed: 50,
								action: 'stop',
							},
						},
					],
				},
			],
			feedbacks: [],
		},

		lens_horizontal_right: {
			type: 'button',
			category: 'Lens Offset',
			name: 'Horizontal Right',
			style: {
				text: '▶',
				size: '44',
				color: 0xffffff,
				bgcolor: 0x008888,
			} as CompanionButtonStyleProps,
			steps: [
				{
					down: [
						{
							actionId: 'lens_horizontal_offset_increase',
							options: {
								speed: 50,
								action: 'start',
							},
						},
					],
					up: [
						{
							actionId: 'lens_horizontal_offset_increase',
							options: {
								speed: 50,
								action: 'stop',
							},
						},
					],
				},
			],
			feedbacks: [],
		},

		lens_horizontal_left: {
			type: 'button',
			category: 'Lens Offset',
			name: 'Horizontal Left',
			style: {
				text: '◀',
				size: '44',
				color: 0xffffff,
				bgcolor: 0x008888,
			} as CompanionButtonStyleProps,
			steps: [
				{
					down: [
						{
							actionId: 'lens_horizontal_offset_decrease',
							options: {
								speed: 50,
								action: 'start',
							},
						},
					],
					up: [
						{
							actionId: 'lens_horizontal_offset_decrease',
							options: {
								speed: 50,
								action: 'stop',
							},
						},
					],
				},
			],
			feedbacks: [],
		},
	}

	self.setPresetDefinitions(presets)
}
