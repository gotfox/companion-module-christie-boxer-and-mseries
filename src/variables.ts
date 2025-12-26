import type { CompanionVariableDefinition } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import type { ProjectorType } from './utils.js'

export function UpdateVariableDefinitions(self: ModuleInstance, projectorType: ProjectorType = 'unknown'): void {
	const variables: CompanionVariableDefinition[] = [
		// General status variables
		{ variableId: 'projector_type', name: 'Projector Type' },
		{ variableId: 'power_status', name: 'Power Status' },
		{ variableId: 'shutter_status', name: 'Shutter Status' },
		{ variableId: 'signal_status', name: 'Signal Status' },
		{ variableId: 'current_input', name: 'Current Input' },

		// Lamp 1 variables (common to both Boxer and M-Series)
		{ variableId: 'lamp_1_state', name: 'Lamp 1 State' },
		{ variableId: 'lamp_1_hours', name: 'Lamp 1 Hours' },
		{ variableId: 'lamp_1_status', name: 'Lamp 1 Status' },
		{ variableId: 'lamp_1_voltage', name: 'Lamp 1 Voltage' },
		{ variableId: 'lamp_1_serial', name: 'Lamp 1 Serial Number' },
		{ variableId: 'lamp_1_install_date', name: 'Lamp 1 Install Date' },

		// Lamp 2 variables (common to both Boxer and M-Series)
		{ variableId: 'lamp_2_state', name: 'Lamp 2 State' },
		{ variableId: 'lamp_2_hours', name: 'Lamp 2 Hours' },
		{ variableId: 'lamp_2_status', name: 'Lamp 2 Status' },
		{ variableId: 'lamp_2_voltage', name: 'Lamp 2 Voltage' },
		{ variableId: 'lamp_2_serial', name: 'Lamp 2 Serial Number' },
		{ variableId: 'lamp_2_install_date', name: 'Lamp 2 Install Date' },
	]

	// Only add lamps 3-6 for Boxer projectors
	if (projectorType === 'boxer' || projectorType === 'unknown') {
		variables.push(
			// Lamp 3 variables (Boxer only)
			{ variableId: 'lamp_3_state', name: 'Lamp 3 State' },
			{ variableId: 'lamp_3_hours', name: 'Lamp 3 Hours' },
			{ variableId: 'lamp_3_status', name: 'Lamp 3 Status' },
			{ variableId: 'lamp_3_voltage', name: 'Lamp 3 Voltage' },
			{ variableId: 'lamp_3_serial', name: 'Lamp 3 Serial Number' },
			{ variableId: 'lamp_3_install_date', name: 'Lamp 3 Install Date' },

			// Lamp 4 variables (Boxer only)
			{ variableId: 'lamp_4_state', name: 'Lamp 4 State' },
			{ variableId: 'lamp_4_hours', name: 'Lamp 4 Hours' },
			{ variableId: 'lamp_4_status', name: 'Lamp 4 Status' },
			{ variableId: 'lamp_4_voltage', name: 'Lamp 4 Voltage' },
			{ variableId: 'lamp_4_serial', name: 'Lamp 4 Serial Number' },
			{ variableId: 'lamp_4_install_date', name: 'Lamp 4 Install Date' },

			// Lamp 5 variables (Boxer only)
			{ variableId: 'lamp_5_state', name: 'Lamp 5 State' },
			{ variableId: 'lamp_5_hours', name: 'Lamp 5 Hours' },
			{ variableId: 'lamp_5_status', name: 'Lamp 5 Status' },
			{ variableId: 'lamp_5_voltage', name: 'Lamp 5 Voltage' },
			{ variableId: 'lamp_5_serial', name: 'Lamp 5 Serial Number' },
			{ variableId: 'lamp_5_install_date', name: 'Lamp 5 Install Date' },

			// Lamp 6 variables (Boxer only)
			{ variableId: 'lamp_6_state', name: 'Lamp 6 State' },
			{ variableId: 'lamp_6_hours', name: 'Lamp 6 Hours' },
			{ variableId: 'lamp_6_status', name: 'Lamp 6 Status' },
			{ variableId: 'lamp_6_voltage', name: 'Lamp 6 Voltage' },
			{ variableId: 'lamp_6_serial', name: 'Lamp 6 Serial Number' },
			{ variableId: 'lamp_6_install_date', name: 'Lamp 6 Install Date' },
		)
	}

	self.setVariableDefinitions(variables)

	// Set initial values for common variables
	const initialValues: Record<string, string> = {
		projector_type: 'Unknown',
		power_status: 'Unknown',
		shutter_status: 'Unknown',
		signal_status: 'Unknown',
		current_input: 'Unknown',

		lamp_1_state: 'Unknown',
		lamp_1_hours: 'Unknown',
		lamp_1_status: 'Unknown',
		lamp_1_voltage: 'Unknown',
		lamp_1_serial: 'Unknown',
		lamp_1_install_date: 'Unknown',

		lamp_2_state: 'Unknown',
		lamp_2_hours: 'Unknown',
		lamp_2_status: 'Unknown',
		lamp_2_voltage: 'Unknown',
		lamp_2_serial: 'Unknown',
		lamp_2_install_date: 'Unknown',
	}

	// Only set initial values for lamps 3-6 if Boxer or unknown
	if (projectorType === 'boxer' || projectorType === 'unknown') {
		Object.assign(initialValues, {
			lamp_3_state: 'Unknown',
			lamp_3_hours: 'Unknown',
			lamp_3_status: 'Unknown',
			lamp_3_voltage: 'Unknown',
			lamp_3_serial: 'Unknown',
			lamp_3_install_date: 'Unknown',

			lamp_4_state: 'Unknown',
			lamp_4_hours: 'Unknown',
			lamp_4_status: 'Unknown',
			lamp_4_voltage: 'Unknown',
			lamp_4_serial: 'Unknown',
			lamp_4_install_date: 'Unknown',

			lamp_5_state: 'Unknown',
			lamp_5_hours: 'Unknown',
			lamp_5_status: 'Unknown',
			lamp_5_voltage: 'Unknown',
			lamp_5_serial: 'Unknown',
			lamp_5_install_date: 'Unknown',

			lamp_6_state: 'Unknown',
			lamp_6_hours: 'Unknown',
			lamp_6_status: 'Unknown',
			lamp_6_voltage: 'Unknown',
			lamp_6_serial: 'Unknown',
			lamp_6_install_date: 'Unknown',
		})
	}

	self.setVariableValues(initialValues)
}
