import { Regex, type SomeCompanionConfigField } from '@companion-module/base'
import type { ProjectorType } from './utils.js'

export type ModuleConfig = {
	host: string
	port: number
	projectorType: 'auto' | 'boxer' | 'mseries'
	pollingInterval: number
}

const PROJECTOR_TYPE_LABELS: Record<ProjectorType, string> = {
	boxer: 'Boxer 4K',
	mseries: 'M-Series',
	unknown: 'Not detected yet (check the connection, then reopen this window)',
}

export function GetConfigFields(detectedProjectorType: ProjectorType = 'unknown'): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Target Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 3002,
		},
		{
			type: 'dropdown',
			id: 'projectorType',
			label: 'Projector Type',
			width: 6,
			default: 'auto',
			choices: [
				{ id: 'auto', label: 'Auto-detect' },
				{ id: 'boxer', label: 'Boxer 4K' },
				{ id: 'mseries', label: 'M-Series' },
			],
		},
		{
			type: 'static-text',
			id: 'detectedProjectorType',
			label: 'Auto-detected Projector Type',
			width: 12,
			value: PROJECTOR_TYPE_LABELS[detectedProjectorType],
			isVisibleExpression: '$(options:projectorType) == "auto"',
		},
		{
			type: 'number',
			id: 'pollingInterval',
			label: 'Polling Interval (ms)',
			width: 6,
			min: 500,
			max: 30000,
			default: 3000,
		},
	]
}
