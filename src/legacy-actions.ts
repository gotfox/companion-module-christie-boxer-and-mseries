import type { CompanionActionDefinitions, SomeCompanionActionInputField } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { optionString } from './utils.js'

/**
 * Actions ported from companion-module-christie-projector (4.1.0) so that buttons which were
 * built with that module keep working. The action ids and option ids are unchanged.
 *
 * Command templates: `{id}` inserts an option value, `{id:N}` zero-pads it to N digits (negative
 * numbers keep their sign) and `{id+N}` adds N to it.
 *
 * pwr, shu, osd, itpBoxer and itpMser are not listed here: the upgrade scripts convert them to the
 * native power, shutter, osd and test_pattern actions.
 */
interface LegacyActionSpec {
	id: string
	name: string
	options: SomeCompanionActionInputField[]
	commands: string[]
}

const LEGACY_ACTIONS: LegacyActionSpec[] = [
	{
		id: 'alc',
		name: 'Automatic Lens Calibration On / Off',
		commands: ['ALC {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'On / Off',
				choices: [
					{ label: 'OFF', id: '0' },
					{ label: 'ON', id: '1' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'apw',
		name: 'Auto Power Up On / Off',
		commands: ['APW {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'On / Off',
				choices: [
					{ label: 'OFF', id: '0' },
					{ label: 'ON', id: '1' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'aro',
		name: 'Aspect Ratio Overlay / Off',
		commands: ['ARO {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'On / Off',
				choices: [
					{ label: 'OFF', id: '0' },
					{ label: 'ON', id: '1' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'asr',
		name: 'Auto Source On / Off',
		commands: ['ASR {p1:2} {p2}'],
		options: [
			{ id: 'p1', type: 'number', label: 'Source Setup (1-50)', default: 1, min: 1, max: 50 },
			{
				id: 'p2',
				type: 'dropdown',
				label: 'On / Off',
				choices: [
					{ label: 'OFF', id: '0' },
					{ label: 'ON', id: '1' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'asu',
		name: 'Auto Setup',
		commands: ['ASU'],
		options: [],
	},
	{
		id: 'brt',
		name: 'Brightness',
		commands: ['BRT {p1:4}'],
		options: [
			{ id: 'p1', type: 'number', label: 'Brightness (0-1000 = 0%-100%, 505 = 50.5%)', default: 1, min: 0, max: 1000 },
		],
	},
	{
		id: 'ccs',
		name: 'Select Output Color',
		commands: ['CCS {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select Color Profile',
				choices: [
					{ label: 'Max Drives (Default)', id: '0' },
					{ label: 'Color Temperature', id: '1' },
					{ label: 'SD Video', id: '2' },
					{ label: 'HD Video', id: '3' },
					{ label: 'User 1', id: '4' },
					{ label: 'User 2', id: '5' },
					{ label: 'User 3', id: '6' },
					{ label: 'User 4', id: '7' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'cha',
		name: 'Channel Select',
		commands: ['CHA {p1:2}'],
		options: [{ id: 'p1', type: 'number', label: 'Channel Number (1-50)', default: 1, min: 1, max: 50 }],
	},
	{
		id: 'cle',
		name: 'Color Enable',
		commands: ['CLE {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select Color',
				choices: [
					{ label: 'White (all colors on)', id: '0' },
					{ label: 'Red', id: '1' },
					{ label: 'Green', id: '2' },
					{ label: 'Blue', id: '3' },
					{ label: 'Yellow', id: '4' },
					{ label: 'Cyan', id: '5' },
					{ label: 'Magenta', id: '6' },
					{ label: 'White', id: '7' },
					{ label: 'Black', id: '8' },
				],
				default: '8',
			},
		],
	},
	{
		id: 'clr',
		name: 'Color Intensity',
		commands: ['CLR {p1:4}'],
		options: [
			{ id: 'p1', type: 'number', label: 'Intensity (0-1000 = 0%-100%, 505 = 50.5%)', default: 1, min: 0, max: 1000 },
		],
	},
	{
		id: 'con',
		name: 'Contrast',
		commands: ['CON {p1:4}'],
		options: [
			{ id: 'p1', type: 'number', label: 'Contrast (0-1000 = 0%-100%, 505 = 50.5%)', default: 1, min: 0, max: 1000 },
		],
	},
	{
		id: 'csp',
		name: 'Color Space',
		commands: ['CSP {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select Color Space',
				choices: [
					{ label: 'RGB', id: '0' },
					{ label: 'YPbPr (SDTV)', id: '1' },
					{ label: 'YPbPr (HDTV)', id: '2' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'def',
		name: 'Factory Defaults',
		commands: ['DEF {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Are you sure?',
				choices: [
					{ id: '', label: 'No' },
					{ id: '111', label: 'Yes' },
				],
				default: '',
			},
		],
	},
	{
		id: 'eme',
		name: 'Error Message Enable',
		commands: ['EME {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select an Option',
				choices: [
					{ label: 'Off', id: '0' },
					{ label: 'On-Screen display', id: '1' },
					{ label: 'ASCII message', id: '2' },
					{ label: 'Both', id: '3' },
					{ label: 'All except error 1E & F', id: '4' },
				],
				default: '3',
			},
		],
	},
	{
		id: 'fcs',
		name: 'Focus (Fixed)',
		commands: ['FCS {p1:4}'],
		options: [{ id: 'p1', type: 'number', label: 'Focus Set (-1200 to 1200)', default: 0, min: -1200, max: 1200 }],
	},
	{
		id: 'fil',
		name: 'Input Filter',
		commands: ['FIL {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select Filter Type',
				choices: [
					{ label: 'Off', id: '0' },
					{ label: 'HDTV', id: '1' },
					{ label: 'SDTV', id: '2' },
					{ label: 'EDTV', id: '3' },
					{ label: 'Graphics/RGB', id: '4' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'frz',
		name: 'Freeze On / Off',
		commands: ['FRZ {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'On / Off',
				choices: [
					{ label: 'OFF', id: '0' },
					{ label: 'ON', id: '1' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'gam',
		name: 'Gamma',
		commands: ['GAM {p1}'],
		options: [{ id: 'p1', type: 'number', label: 'Gamma Set (100-280)', default: 220, min: 100, max: 280 }],
	},
	{
		id: 'hor',
		name: 'Horizontal Position',
		commands: ['HOR{p1}'],
		options: [{ id: 'p1', type: 'number', label: 'Horizontal Position', default: 500, min: 0, max: 9999 }],
	},
	{
		id: 'ils',
		name: 'Intelligent Lens System On/Off',
		commands: ['ILS {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'On / Off',
				choices: [
					{ label: 'OFF', id: '0' },
					{ label: 'ON', id: '1' },
				],
				default: '1',
			},
		],
	},
	{
		id: 'iop',
		name: 'Image Optimization',
		commands: ['IOP {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select an Option',
				choices: [
					{ label: 'Best Image Quality', id: '0' },
					{ label: 'Smooth Switching', id: '1' },
					{ label: 'Seamless Switching', id: '2' },
				],
				default: '1',
			},
		],
	},
	{
		id: 'itpBasic',
		name: 'Internal testpattern Basic collection (general use)',
		commands: ['ITP {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select Testpattern',
				choices: [
					{ label: 'Off', id: '0' },
					{ label: 'Grid', id: '1' },
					{ label: 'Grey Scale 16', id: '2' },
					{ label: 'White', id: '3' },
					{ label: 'Flat Grey', id: '4' },
					{ label: 'Black', id: '5' },
					{ label: 'Checker', id: '6' },
					{ label: '13 Point', id: '7' },
					{ label: 'Color Bars', id: '8' },
					{ label: 'RGBW Gray Scale', id: '9' },
					{ label: 'Multi Color', id: '10' },
					{ label: 'Edge Blend', id: '11' },
					{ label: 'Aspect Ratio', id: '12' },
					{ label: 'Red & Blue Ramp', id: '13' },
					{ label: 'Calibration Line Ramp', id: '14' },
					{ label: 'Calibration Black & White Grid', id: '15' },
					{ label: 'Calibration White & Red Grid', id: '16' },
					{ label: 'Calibration White & Green Grid', id: '17' },
					{ label: 'Calibration White & Blue Grid', id: '18' },
				],
				default: '1',
			},
		],
	},
	{
		id: 'ken',
		name: 'Keypad Enable',
		commands: ['KEN {p1} {p2}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select type',
				choices: [
					{ label: 'Wired', id: '0' },
					{ label: 'IR Front', id: '1' },
					{ label: 'IR Back', id: '2' },
				],
				default: '0',
			},
			{
				id: 'p2',
				type: 'dropdown',
				label: 'Protocol',
				choices: [
					{ label: 'Off', id: '0' },
					{ label: 'Protocol Any', id: '1' },
					{ label: 'Protocol A', id: '10' },
					{ label: 'Protocol B', id: '11' },
					{ label: 'Protocol C', id: '12' },
					{ label: 'Protocol D', id: '13' },
					{ label: 'Protocol E', id: '14' },
					{ label: 'Protocol F', id: '15' },
					{ label: 'Protocol G', id: '16' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'key',
		name: 'Key Code / Key Press',
		commands: ['KEY {p1}', 'KEY {p1+128}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select Key',
				choices: [
					{ label: '0', id: '0' },
					{ label: '1', id: '1' },
					{ label: '2', id: '2' },
					{ label: '3', id: '3' },
					{ label: '4', id: '4' },
					{ label: '5', id: '5' },
					{ label: '6', id: '6' },
					{ label: '7', id: '7' },
					{ label: '8', id: '8' },
					{ label: '9', id: '9' },
					{ label: 'Shift', id: '12' },
					{ label: 'Enter', id: '13' },
					{ label: 'Func', id: '14' },
					{ label: 'Proj', id: '22' },
					{ label: 'Exit', id: '27' },
					{ label: 'Cont', id: '41' },
					{ label: 'Menu', id: '44' },
					{ label: 'Power', id: '46' },
					{ label: 'OSD', id: '47' },
					{ label: 'Up (On)', id: '58' },
					{ label: 'Down (Off)', id: '59' },
					{ label: 'Left (-)', id: '60' },
					{ label: 'Lamp', id: '61' },
					{ label: 'Right (+)', id: '62' },
					{ label: 'Help', id: '63' },
					{ label: 'Input', id: '64' },
					{ label: 'Input 1 / BNC', id: '65' },
					{ label: 'Input 2 / DVI', id: '66' },
					{ label: 'Input 3 / VID', id: '67' },
					{ label: 'Input 4 / S-Vid', id: '68' },
					{ label: 'Input 5 / Opt-1', id: '69' },
					{ label: 'Input 6 / Opt-2', id: '70' },
					{ label: 'Zoom IN', id: '71' },
					{ label: 'Zoom Out', id: '72' },
					{ label: 'Focus IN', id: '73' },
					{ label: 'Focus Out', id: '74' },
					{ label: 'Lens H Right', id: '75' },
					{ label: 'Lens H Left', id: '76' },
					{ label: 'Lens V Up', id: '77' },
					{ label: 'Lens V Down', id: '78' },
					{ label: 'Bright', id: '80' },
					{ label: 'Channel', id: '81' },
					{ label: 'Test', id: '82' },
					{ label: 'Shutter', id: '83' },
					{ label: 'PIP', id: '84' },
					{ label: 'Gamma', id: '85' },
					{ label: 'Auto', id: '86' },
					{ label: 'Focus', id: '87' },
					{ label: 'Zoom', id: '88' },
					{ label: 'Swap', id: '89' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'lcb',
		name: 'Lens Calibrate',
		commands: ['LCB {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select type',
				choices: [
					{ label: 'Relative', id: '0' },
					{ label: 'Manual', id: '1' },
					{ label: 'Calibrate', id: '2' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'lcn',
		name: 'Lens Center',
		commands: ['LCN'],
		options: [],
	},
	{
		id: 'lco',
		name: 'Lamp Conditioning On/Off',
		commands: ['LCO {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'On / Off',
				choices: [
					{ label: 'OFF', id: '0' },
					{ label: 'ON', id: '1' },
				],
				default: '1',
			},
		],
	},
	{
		id: 'lng',
		name: 'Language',
		commands: ['LNG {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select Language',
				choices: [
					{ label: 'English', id: '1' },
					{ label: 'French', id: '2' },
					{ label: 'Spanish', id: '3' },
					{ label: 'German', id: '4' },
					{ label: 'Italian', id: '5' },
				],
				default: '1',
			},
		],
	},
	{
		id: 'lop',
		name: 'Lamp Operation',
		commands: ['LOP {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select Mode',
				choices: [
					{ label: 'Lamp 1 only', id: '1' },
					{ label: 'Lamp 2 only', id: '2' },
					{ label: 'Both', id: '3' },
				],
				default: '3',
			},
		],
	},
	{
		id: 'lpc',
		name: 'Lamp Changed',
		commands: ['LPC {p1}'],
		options: [
			{ id: 'p1', type: 'textinput', label: 'Serial nr: (Max 8 Charactors)', default: '', regex: '/^.{1,8}$/' },
		],
	},
	{
		id: 'lph',
		name: 'Lamp Hours Of Use?',
		commands: ['LPH?'],
		options: [],
	},
	{
		id: 'lpi',
		name: 'Lamp Intensity',
		commands: ['LPI {p1:4}'],
		options: [{ id: 'p1', type: 'number', label: 'Setpoint (0-9999)', default: 100, min: 0, max: 9999 }],
	},
	{
		id: 'lpm',
		name: 'Lamp Mode',
		commands: ['LPM {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select Mode',
				choices: [
					{ label: 'Auto', id: '0' },
					{ label: 'Still', id: '1' },
					{ label: 'Motion', id: '2' },
					{ label: 'Film', id: '3' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'mot',
		name: 'Motion Filter',
		commands: ['MOT {p1}'],
		options: [
			// christie-projector offered an empty dropdown here, so any stored value is free text
			{ id: 'p1', type: 'textinput', label: 'Motion Filter value', default: '0' },
		],
	},
	{
		id: 'pip',
		name: 'Picture In Picture On/Off',
		commands: ['PIP {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'On / Off',
				choices: [
					{ label: 'OFF', id: '0' },
					{ label: 'ON', id: '1' },
				],
				default: '1',
			},
		],
	},
	{
		id: 'ppp',
		name: 'PIP Position Preset',
		commands: ['PPP {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Select Preset',
				choices: [
					{ label: 'Top Left', id: '0' },
					{ label: 'Top Right', id: '1' },
					{ label: 'Bottom Left', id: '2' },
					{ label: 'Bottom Right', id: '3' },
					{ label: 'Custom', id: '4' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'pps',
		name: 'Picture In Picture Swap',
		commands: ['PPS'],
		options: [],
	},
	{
		id: 'sde',
		name: 'Source Dialog Enable',
		commands: ['SDE {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Show / Hide',
				choices: [
					{ label: 'Disable', id: '0' },
					{ label: 'Enable', id: '1' },
				],
				default: '1',
			},
		],
	},
	{
		id: 'sin',
		name: 'Select Input',
		commands: ['SIN {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Input:',
				choices: [
					{ label: 'BNC', id: '1' },
					{ label: 'DVI-I', id: '2' },
					{ label: 'Composite', id: '3' },
					{ label: 'S-Video', id: '4' },
					{ label: 'Option slot #1', id: '5' },
					{ label: 'Option slot #2', id: '6' },
					{ label: 'Option slot #3', id: '7' },
					{ label: 'Option slot #4', id: '8' },
				],
				default: '1',
			},
		],
	},
	{
		id: 'sinSlot',
		name: 'Select Input by Slot and Input Number',
		commands: ['SIN+{target} {slot}{input}'],
		options: [
			{ id: 'slot', type: 'textinput', label: 'Slot Number', default: '1', useVariables: true },
			{ id: 'input', type: 'textinput', label: 'Input Number', default: '1', useVariables: true },
			{
				id: 'target',
				type: 'dropdown',
				label: 'Target',
				choices: [
					{ id: 'MAIN', label: 'Main' },
					{ id: 'PIIP', label: 'PIP' },
				],
				default: 'MAIN',
			},
		],
	},
	{
		id: 'sor',
		name: 'Select Orientation',
		commands: ['SOR {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Orientation:',
				choices: [
					{ label: 'Front Projection', id: '0' },
					{ label: 'Rear Projection', id: '1' },
					{ label: 'Front Projection Inverted', id: '2' },
					{ label: 'Rear Projection Inverted', id: '3' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'std',
		name: 'Video Standard',
		commands: ['STD {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Video Standard',
				choices: [
					{ label: 'PAL', id: '0' },
					{ label: 'NTSC', id: '1' },
					{ label: 'SECAM', id: '2' },
					{ label: 'NTSC4.43', id: '3' },
					{ label: 'PAL-M', id: '4' },
					{ label: 'PAL-NC', id: '5' },
					{ label: 'PAL-60', id: '6' },
					{ label: 'NTSC', id: '7' },
					{ label: 'Auto-select', id: '8' },
				],
				default: '8',
			},
		],
	},
	{
		id: 'szp',
		name: 'Size Presets Position',
		commands: ['SZP {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Size',
				choices: [
					{ label: 'Default', id: '0' },
					{ label: 'No Resizing', id: '1' },
					{ label: 'Full Screen', id: '2' },
					{ label: 'Full Width', id: '3' },
					{ label: 'Full Height', id: '4' },
					{ label: 'Anamorphic', id: '5' },
					{ label: 'Custom resizing', id: '6' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'tnt',
		name: 'Tint',
		commands: ['TNT {p1}'],
		options: [
			{ id: 'p1', type: 'number', label: 'Tint (0-1000 = 0%-100%, 505 = 50.5%)', default: 1, min: 0, max: 1000 },
		],
	},
	{
		id: 'vrt',
		name: 'Vertical Position',
		commands: ['VRT {p1}'],
		options: [{ id: 'p1', type: 'number', label: 'Vertical Position', default: 500, min: 0, max: 9999 }],
	},
	{
		id: 'wps',
		name: 'Geometry Correction (General)',
		commands: ['WPS {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Warp Select',
				choices: [
					{ label: 'Off', id: '0' },
					{ label: '2D Warp', id: '1' },
					{ label: 'User 1', id: '2' },
					{ label: 'User 2', id: '3' },
					{ label: 'User 3', id: '4' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'wrp',
		name: 'Geometry Correction (Mseries & Boxer)',
		commands: ['WRP+SLCT {p1}'],
		options: [
			{
				id: 'p1',
				type: 'dropdown',
				label: 'Warp Select',
				choices: [
					{ label: 'Off', id: '0' },
					{ label: 'Mseries 2D Warp, Boxer User 1', id: '1' },
					{ label: 'Mseries User 1, Boxer User 2', id: '2' },
					{ label: 'Mseries User 2, Boxer User 3', id: '3' },
					{ label: 'Mseries User 3, Boxer User 4', id: '4' },
					{ label: 'Mseries User 4', id: '5' },
					{ label: 'Mseries User 5', id: '6' },
					{ label: 'Mseries User 6', id: '7' },
					{ label: 'Mseries User 7', id: '8' },
					{ label: 'Mseries User 8', id: '9' },
					{ label: 'Mseries User 9', id: '10' },
					{ label: 'Mseries User 10, Boxer Keystone', id: '11' },
					{ label: 'Mseries User 11', id: '12' },
					{ label: 'Mseries User 12', id: '13' },
					{ label: 'Mseries User 13', id: '14' },
					{ label: 'Mseries User 14', id: '15' },
					{ label: 'Mseries User 15', id: '16' },
					{ label: 'Mseries User 16', id: '17' },
				],
				default: '0',
			},
		],
	},
	{
		id: 'zom',
		name: 'Zoom (Fixed)',
		commands: ['ZOM {p1:4}'],
		options: [{ id: 'p1', type: 'number', label: 'Zoom Set (-1200 to 1200)', default: 0, min: -1200, max: 1200 }],
	},
	{
		id: 'lensshift_move_h_neg',
		name: 'Lens Shift - Start to Move Horizontal Motor to Negative Max',
		commands: ['LMV+HRUN-1'],
		options: [],
	},
	{
		id: 'lensshift_move_h_pos',
		name: 'Lens Shift - Start to Move Horizontal Motor to Positive Max',
		commands: ['LMV+HRUN1'],
		options: [],
	},
	{
		id: 'lensshift_move_h_stop',
		name: 'Lens Shift - Stop Move Horizontal Motor',
		commands: ['LMV+HRUN0'],
		options: [],
	},
	{
		id: 'lensshift_move_h_number',
		name: 'Lens Shift - Move Horizontal Motor to Position',
		commands: ['LHO {pos:4}'],
		options: [{ id: 'pos', type: 'number', label: 'Position (-2050 to 2050)', default: 0, min: -2050, max: 2050 }],
	},
	{
		id: 'lensshift_move_v_neg',
		name: 'Lens Shift - Start to Move Vertical Motor to Negative Max',
		commands: ['LMV+VRUN-1'],
		options: [],
	},
	{
		id: 'lensshift_move_v_pos',
		name: 'Lens Shift - Start to Move Vertical Motor to Positive Max',
		commands: ['LMV+VRUN1'],
		options: [],
	},
	{
		id: 'lensshift_move_v_stop',
		name: 'Lens Shift - Stop Move Vertical Motor',
		commands: ['LMV+VRUN0'],
		options: [],
	},
	{
		id: 'lensshift_move_v_number',
		name: 'Lens Shift - Move Vertical Motor to Position',
		commands: ['LVO {pos:4}'],
		options: [{ id: 'pos', type: 'number', label: 'Position (-2050 to 2050)', default: 0, min: -2050, max: 2050 }],
	},
	{
		id: 'lensshift_focus_neg',
		name: 'Lens Shift - Start to Move Focus Motor to Negative Max',
		commands: ['LMV+FRUN-1'],
		options: [],
	},
	{
		id: 'lensshift_focus_pos',
		name: 'Lens Shift - Start to Move Focus Motor to Positive Max',
		commands: ['LMV+FRUN1'],
		options: [],
	},
	{
		id: 'lensshift_focus_stop',
		name: 'Lens Shift - Stop Move Focus Motor',
		commands: ['LMV+FRUN0'],
		options: [],
	},
	{
		id: 'lensshift_zoom_neg',
		name: 'Lens Shift - Start to Move Zoom Motor to Negative Max',
		commands: ['LMV+ZRUN-1'],
		options: [],
	},
	{
		id: 'lensshift_zoom_pos',
		name: 'Lens Shift - Start to Move Zoom Motor to Positive Max',
		commands: ['LMV+ZRUN1'],
		options: [],
	},
	{
		id: 'lensshift_zoom_stop',
		name: 'Lens Shift - Stop Move Zoom Motor',
		commands: ['LMV+ZRUN0'],
		options: [],
	},
]

function pad(value: unknown, width: number): string {
	const n = parseInt(optionString(value), 10)
	const text = Math.abs(n).toString().padStart(width, '0')
	return n < 0 ? `-${text}` : text
}

export function expandLegacyCommand(template: string, options: Record<string, unknown>): string {
	return template.replace(/\{(\w+)(?::(\d)|\+(\d+))?\}/g, (_match, id: string, width?: string, add?: string) => {
		if (width) return pad(options[id], Number(width))
		if (add) return String(Number(optionString(options[id])) + Number(add))
		return optionString(options[id])
	})
}

export function GetLegacyActions(self: ModuleInstance): CompanionActionDefinitions {
	const actions: CompanionActionDefinitions = {}

	for (const spec of LEGACY_ACTIONS) {
		actions[spec.id] = {
			name: `${spec.name} (christie-projector)`,
			options: spec.options,
			callback: async (event) => {
				try {
					for (const template of spec.commands) {
						const command = expandLegacyCommand(template, event.options)
						await self.connection.sendCommand(command)
						self.log('debug', `${spec.name}: sent ${command}`)
					}
				} catch (error) {
					self.log('error', `${spec.name} failed: ${error}`)
				}
			},
		}
	}

	return actions
}
