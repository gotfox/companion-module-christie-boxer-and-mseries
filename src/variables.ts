import type { CompanionVariableDefinition } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import type { ProjectorType } from './utils.js'

export function UpdateVariableDefinitions(self: ModuleInstance, projectorType: ProjectorType = 'unknown'): void {
	const variables: CompanionVariableDefinition[] = [
		// ====================
		// GENERAL STATUS
		// ====================
		{ variableId: 'projector_type', name: 'Projector Type' },
		{ variableId: 'power_status', name: 'Power Status' },
		{ variableId: 'shutter_status', name: 'Shutter Status' },
		{ variableId: 'current_input', name: 'Current Input' },
		{ variableId: 'test_pattern', name: 'Test Pattern' },
		{ variableId: 'current_date', name: 'Current Date' },
		{ variableId: 'current_time', name: 'Current Time' },

		// ====================
		// LENS POSITIONS
		// ====================
		{ variableId: 'lens_focus', name: 'Lens Focus Position' },
		{ variableId: 'lens_zoom', name: 'Lens Zoom Position' },
		{ variableId: 'lens_horizontal_offset', name: 'Lens Horizontal Offset' },
		{ variableId: 'lens_vertical_offset', name: 'Lens Vertical Offset' },

		// ====================
		// LAMP 1 (Common)
		// ====================
		{ variableId: 'lamp_1_state', name: 'Lamp 1 State' },
		{ variableId: 'lamp_1_hours', name: 'Lamp 1 Hours' },
		{ variableId: 'lamp_1_status', name: 'Lamp 1 Status' },
		{ variableId: 'lamp_1_voltage', name: 'Lamp 1 Voltage' },
		{ variableId: 'lamp_1_serial', name: 'Lamp 1 Serial Number' },
		{ variableId: 'lamp_1_install_date', name: 'Lamp 1 Install Date' },

		// ====================
		// LAMP 2 (Common)
		// ====================
		{ variableId: 'lamp_2_state', name: 'Lamp 2 State' },
		{ variableId: 'lamp_2_hours', name: 'Lamp 2 Hours' },
		{ variableId: 'lamp_2_status', name: 'Lamp 2 Status' },
		{ variableId: 'lamp_2_voltage', name: 'Lamp 2 Voltage' },
		{ variableId: 'lamp_2_serial', name: 'Lamp 2 Serial Number' },
		{ variableId: 'lamp_2_install_date', name: 'Lamp 2 Install Date' },
	]

	// ====================
	// BOXER-SPECIFIC VARIABLES
	// ====================
	if (projectorType === 'boxer' || projectorType === 'unknown') {
		variables.push(
			// Lamp 3-6 (Boxer only)
			{ variableId: 'lamp_3_state', name: 'Lamp 3 State' },
			{ variableId: 'lamp_3_hours', name: 'Lamp 3 Hours' },
			{ variableId: 'lamp_3_status', name: 'Lamp 3 Status' },
			{ variableId: 'lamp_3_voltage', name: 'Lamp 3 Voltage' },
			{ variableId: 'lamp_3_serial', name: 'Lamp 3 Serial Number' },
			{ variableId: 'lamp_3_install_date', name: 'Lamp 3 Install Date' },

			{ variableId: 'lamp_4_state', name: 'Lamp 4 State' },
			{ variableId: 'lamp_4_hours', name: 'Lamp 4 Hours' },
			{ variableId: 'lamp_4_status', name: 'Lamp 4 Status' },
			{ variableId: 'lamp_4_voltage', name: 'Lamp 4 Voltage' },
			{ variableId: 'lamp_4_serial', name: 'Lamp 4 Serial Number' },
			{ variableId: 'lamp_4_install_date', name: 'Lamp 4 Install Date' },

			{ variableId: 'lamp_5_state', name: 'Lamp 5 State' },
			{ variableId: 'lamp_5_hours', name: 'Lamp 5 Hours' },
			{ variableId: 'lamp_5_status', name: 'Lamp 5 Status' },
			{ variableId: 'lamp_5_voltage', name: 'Lamp 5 Voltage' },
			{ variableId: 'lamp_5_serial', name: 'Lamp 5 Serial Number' },
			{ variableId: 'lamp_5_install_date', name: 'Lamp 5 Install Date' },

			{ variableId: 'lamp_6_state', name: 'Lamp 6 State' },
			{ variableId: 'lamp_6_hours', name: 'Lamp 6 Hours' },
			{ variableId: 'lamp_6_status', name: 'Lamp 6 Status' },
			{ variableId: 'lamp_6_voltage', name: 'Lamp 6 Voltage' },
			{ variableId: 'lamp_6_serial', name: 'Lamp 6 Serial Number' },
			{ variableId: 'lamp_6_install_date', name: 'Lamp 6 Install Date' },

			// Signal Status (Boxer)
			{ variableId: 'signal_hdbaset', name: 'Signal HDBaseT' },
			{ variableId: 'signal_card0_input1', name: 'Signal Card 0 Input 1' },
			{ variableId: 'signal_card0_input2', name: 'Signal Card 0 Input 2' },
			{ variableId: 'signal_card0_input3', name: 'Signal Card 0 Input 3' },
			{ variableId: 'signal_card0_input4', name: 'Signal Card 0 Input 4' },
			{ variableId: 'signal_card1_input1', name: 'Signal Card 1 Input 1' },
			{ variableId: 'signal_card1_input2', name: 'Signal Card 1 Input 2' },
			{ variableId: 'signal_card2_input1', name: 'Signal Card 2 Input 1' },
			{ variableId: 'signal_card2_input2', name: 'Signal Card 2 Input 2' },
			{ variableId: 'signal_card3_input1', name: 'Signal Card 3 Input 1' },
			{ variableId: 'signal_card3_input2', name: 'Signal Card 3 Input 2' },
			{ variableId: 'signal_card4_input1', name: 'Signal Card 4 Input 1' },
			{ variableId: 'signal_card4_input2', name: 'Signal Card 4 Input 2' },
			{ variableId: 'output_frequency', name: 'Output Frequency' },
			{ variableId: 'frame_lock', name: 'Frame Lock' },
			{ variableId: 'tsic_connection', name: 'TSIC Connection' },

			// System Status (Boxer)
			{ variableId: 'projector_hours', name: 'Projector Hours' },
			{ variableId: 'pitch_roll', name: 'Pitch / Roll' },
			{ variableId: 'lens_motor_horizontal', name: 'Lens Motor Horizontal-Axis' },
			{ variableId: 'lens_motor_vertical', name: 'Lens Motor Vertical-Axis' },
			{ variableId: 'lens_motor_zoom', name: 'Lens Motor Zoom-Axis' },
			{ variableId: 'lens_motor_focus', name: 'Lens Motor Focus-Axis' },
			{ variableId: 'power_supply_voltage', name: 'Power Supply Inlet Voltage' },
		)
	}

	// ====================
	// M-SERIES-SPECIFIC VARIABLES
	// ====================
	if (projectorType === 'mseries') {
		variables.push(
			// Main Signal Status (M-Series)
			{ variableId: 'main_signal_state', name: 'Main Signal State' },
			{ variableId: 'main_signal_frequency', name: 'Main Input Frequency' },
			{ variableId: 'main_signal_sync_width', name: 'Main Sync Width' },
			{ variableId: 'main_signal_sync_type', name: 'Main Sync Type' },
			{ variableId: 'main_signal_type', name: 'Main Signal Type' },
			{ variableId: 'main_signal_pixel_rate', name: 'Main Pixel Rate' },

			// PIP Signal Status (M-Series)
			{ variableId: 'pip_signal_state', name: 'PIP Signal State' },
			{ variableId: 'pip_signal_frequency', name: 'PIP Input Frequency' },
			{ variableId: 'pip_signal_sync_width', name: 'PIP Sync Width' },
			{ variableId: 'pip_signal_sync_type', name: 'PIP Sync Type' },
			{ variableId: 'pip_signal_type', name: 'PIP Signal Type' },
			{ variableId: 'pip_signal_pixel_rate', name: 'PIP Pixel Rate' },

			// System Status (M-Series)
			{ variableId: 'projector_hours', name: 'Projector Hours' },
			{ variableId: 'lens_type', name: 'Lens Type' },
			{ variableId: 'output_frequency', name: 'Output Frequency' },
			{ variableId: 'frame_lock', name: 'Frame Lock' },
			{ variableId: 'slot_1', name: 'Slot 1' },
			{ variableId: 'slot_2', name: 'Slot 2' },
			{ variableId: 'slot_3', name: 'Slot 3' },
			{ variableId: 'slot_4', name: 'Slot 4' },
		)
	}

	self.setVariableDefinitions(variables)

	// ====================
	// INITIAL VALUES
	// ====================
	const initialValues: Record<string, string> = {
		// General
		projector_type: 'Unknown',
		power_status: 'Unknown',
		shutter_status: 'Unknown',
		current_input: 'Unknown',
		test_pattern: 'Unknown',
		current_date: 'Unknown',
		current_time: 'Unknown',

		// Lens
		lens_focus: 'Unknown',
		lens_zoom: 'Unknown',
		lens_horizontal_offset: 'Unknown',
		lens_vertical_offset: 'Unknown',

		// Lamp 1
		lamp_1_state: 'Unknown',
		lamp_1_hours: 'Unknown',
		lamp_1_status: 'Unknown',
		lamp_1_voltage: 'Unknown',
		lamp_1_serial: 'Unknown',
		lamp_1_install_date: 'Unknown',

		// Lamp 2
		lamp_2_state: 'Unknown',
		lamp_2_hours: 'Unknown',
		lamp_2_status: 'Unknown',
		lamp_2_voltage: 'Unknown',
		lamp_2_serial: 'Unknown',
		lamp_2_install_date: 'Unknown',
	}

	// Boxer-specific initial values
	if (projectorType === 'boxer' || projectorType === 'unknown') {
		Object.assign(initialValues, {
			// Lamps 3-6
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

			// Signal status
			signal_hdbaset: 'Unknown',
			signal_card0_input1: 'Unknown',
			signal_card0_input2: 'Unknown',
			signal_card0_input3: 'Unknown',
			signal_card0_input4: 'Unknown',
			signal_card1_input1: 'Unknown',
			signal_card1_input2: 'Unknown',
			signal_card2_input1: 'Unknown',
			signal_card2_input2: 'Unknown',
			signal_card3_input1: 'Unknown',
			signal_card3_input2: 'Unknown',
			signal_card4_input1: 'Unknown',
			signal_card4_input2: 'Unknown',
			output_frequency: 'Unknown',
			frame_lock: 'Unknown',
			tsic_connection: 'Unknown',

			// System status
			projector_hours: 'Unknown',
			pitch_roll: 'Unknown',
			lens_motor_horizontal: 'Unknown',
			lens_motor_vertical: 'Unknown',
			lens_motor_zoom: 'Unknown',
			lens_motor_focus: 'Unknown',
			power_supply_voltage: 'Unknown',
		})
	}

	// M-Series-specific initial values
	if (projectorType === 'mseries') {
		Object.assign(initialValues, {
			// Main signal
			main_signal_state: 'Unknown',
			main_signal_frequency: 'Unknown',
			main_signal_sync_width: 'Unknown',
			main_signal_sync_type: 'Unknown',
			main_signal_type: 'Unknown',
			main_signal_pixel_rate: 'Unknown',

			// PIP signal
			pip_signal_state: 'Unknown',
			pip_signal_frequency: 'Unknown',
			pip_signal_sync_width: 'Unknown',
			pip_signal_sync_type: 'Unknown',
			pip_signal_type: 'Unknown',
			pip_signal_pixel_rate: 'Unknown',

			// System status
			projector_hours: 'Unknown',
			lens_type: 'Unknown',
			output_frequency: 'Unknown',
			frame_lock: 'Unknown',
			slot_1: 'Unknown',
			slot_2: 'Unknown',
			slot_3: 'Unknown',
			slot_4: 'Unknown',
		})
	}

	self.setVariableValues(initialValues)
}
