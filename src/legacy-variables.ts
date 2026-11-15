import { optionString } from './utils.js'

/**
 * Variables with the ids used by companion-module-christie-projector (4.1.0).
 *
 * Buttons built with that module reference them as e.g. `$(label:signal_state)`. They are kept up to date
 * from this module's own variables, so existing button text keeps working after the switch.
 *
 * Not carried over (this module has no source for them): standby, osd_enabled, input_channel,
 * input_slot and pip_enabled.
 */
export const LEGACY_VARIABLES: { variableId: string; name: string }[] = [
	{ variableId: 'lamp_1', name: 'Total Hours On Lamp 1' },
	{ variableId: 'lamp_2', name: 'Total Hours On Lamp 2' },
	{ variableId: 'power_state', name: 'Power State' },
	{ variableId: 'shutter_closed', name: 'Shutter State' },
	{ variableId: 'motorposition_h', name: 'Motor Position - Horizontal' },
	{ variableId: 'motorposition_v', name: 'Motor Position - Vertical' },
	{ variableId: 'motorposition_z', name: 'Motor Position - Zoom' },
	{ variableId: 'motorposition_f', name: 'Motor Position - Focus' },
	{ variableId: 'signal_state', name: 'Signal State' },
	{ variableId: 'input_frequency', name: 'Input Frequency' },
	{ variableId: 'sync_width', name: 'Sync Width' },
	{ variableId: 'sync_type', name: 'Sync Type' },
	{ variableId: 'signal_type', name: 'Signal Type' },
	{ variableId: 'pixel_rate', name: 'Pixel Rate' },
	{ variableId: 'pip_signal_state', name: 'PIP Signal State' },
	{ variableId: 'pip_input_frequency', name: 'PIP Input Frequency' },
	{ variableId: 'pip_sync_width', name: 'PIP Sync Width' },
	{ variableId: 'pip_sync_type', name: 'PIP Sync Type' },
	{ variableId: 'pip_signal_type', name: 'PIP Signal Type' },
	{ variableId: 'pip_pixel_rate', name: 'PIP Pixel Rate' },
]

/** New variable id -> old variable id, for values that are copied unchanged */
const DIRECT_ALIASES: Record<string, string> = {
	lamp_1_hours: 'lamp_1',
	lamp_2_hours: 'lamp_2',
	lens_horizontal_offset: 'motorposition_h',
	lens_vertical_offset: 'motorposition_v',
	lens_zoom: 'motorposition_z',
	lens_focus: 'motorposition_f',
	// The old module read sub-code 000 of SST+SIGN as "signal_state". On a Boxer that is the HDBaseT input.
	signal_hdbaset: 'signal_state',
	main_signal_state: 'signal_state',
	main_signal_frequency: 'input_frequency',
	main_signal_sync_width: 'sync_width',
	main_signal_sync_type: 'sync_type',
	main_signal_type: 'signal_type',
	main_signal_pixel_rate: 'pixel_rate',
	pip_signal_frequency: 'pip_input_frequency',
	pip_signal_sync_width: 'pip_sync_width',
	pip_signal_sync_type: 'pip_sync_type',
	pip_signal_pixel_rate: 'pip_pixel_rate',
}

/** Power status text of this module -> the states the old module reported ("On", "Off", "Boot", "Cool Down", "Warm Up") */
export function legacyPowerState(status: string): string {
	const text = status.toLowerCase()
	if (text.startsWith('on')) return 'On'
	if (text.startsWith('standby') || text.startsWith('off')) return 'Off'
	if (text.startsWith('cool')) return 'Cool Down'
	if (text.startsWith('warm')) return 'Warm Up'
	if (text.startsWith('boot')) return 'Boot'
	return ''
}

/** "Closed" / "Open" as reported by the old module */
export function legacyShutterState(status: string): string {
	const text = status.toLowerCase()
	if (text.startsWith('closed') || text.startsWith('close')) return 'Closed'
	if (text.startsWith('open')) return 'Open'
	return ''
}

/**
 * Old-style variable values that correspond to the given new-style values.
 * Only variables that are present in `values` produce an alias.
 */
export function getLegacyVariableValues(values: Record<string, unknown>): Record<string, string> {
	const aliases: Record<string, string> = {}

	for (const [variableId, value] of Object.entries(values)) {
		if (value === undefined) continue

		const legacyId = DIRECT_ALIASES[variableId]
		if (legacyId) {
			aliases[legacyId] = optionString(value)
		} else if (variableId === 'power_status') {
			aliases.power_state = legacyPowerState(optionString(value))
		} else if (variableId === 'shutter_status') {
			aliases.shutter_closed = legacyShutterState(optionString(value))
		}
	}

	return aliases
}
