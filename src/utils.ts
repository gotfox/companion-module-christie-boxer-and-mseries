export interface ParsedResponse {
	command: string
	subcode?: string
	errorCode?: string
	value: string
	description?: string
}

export interface LampInfo {
	state: string
	hours: string
	status: string
	voltage: string
	serialNumber: string
	installDate?: string
}

export type ProjectorType = 'boxer' | 'mseries' | 'unknown'

/**
 * Clean up escaped characters from response strings
 */
export function cleanString(str: string): string {
	// Remove escaped parentheses and other escape sequences
	return str.replace(/\\[()\[\]]/g, '').replace(/\s*\([^)]*\)\s*/g, '').trim()
}

/**
 * Parse a Christie projector response
 * Format: (CMD!value "description") or (CMD!subcode errorcode "value" "description")
 * Also handles: (CMD!subcode errorcode value1 value2...) without quotes
 */
export function parseResponse(response: string): ParsedResponse | null {
	// Remove outer parentheses
	const content = response.replace(/^\(|\)$/g, '')

	// Match command with ! (response indicator)
	const responseMatch = content.match(/^([A-Z+]+)!(.*)$/)
	if (!responseMatch) {
		return null
	}

	const command = responseMatch[1]
	const remainder = responseMatch[2]

	// Try to match: subcode errorcode "value" "description"
	const fullMatch = remainder.match(/^(\d+)\s+(\d+)\s+"([^"]*)"\s+"([^"]*)"/)
	if (fullMatch) {
		return {
			command,
			subcode: fullMatch[1],
			errorCode: fullMatch[2],
			value: fullMatch[3],
			description: fullMatch[4],
		}
	}

	// Try to match: subcode errorcode value1 value2 (no quotes, space-separated numbers)
	const multiValueMatch = remainder.match(/^(\d+)\s+(\d+)\s+(.+)$/)
	if (multiValueMatch) {
		return {
			command,
			subcode: multiValueMatch[1],
			errorCode: multiValueMatch[2],
			value: multiValueMatch[3].split(/\s+/)[0], // First additional value
		}
	}

	// Try to match: value "description"
	const simpleMatch = remainder.match(/^(\d+)\s+"([^"]*)"/)
	if (simpleMatch) {
		return {
			command,
			value: simpleMatch[1],
			description: simpleMatch[2],
		}
	}

	// Try to match: "value"
	const valueMatch = remainder.match(/^"([^"]*)"/)
	if (valueMatch) {
		return {
			command,
			value: valueMatch[1],
		}
	}

	// Just a simple value
	return {
		command,
		value: remainder.trim(),
	}
}

/**
 * Format hours from "314:41 \\(h:m\\)" to "314:41"
 */
export function formatHours(hoursString: string): string {
	// Extract just the hours:minutes part
	const match = hoursString.match(/(\d+:\d+)/)
	return match ? match[1] : hoursString
}

/**
 * Detect projector type from PNG? response
 * Response format: (PNG!055 001 008 002) where 055 is the type code in subcode field
 * (PNG!044 002 005 003) -> M-Series (44)
 * (PNG!055 ...) -> Boxer 4K (55)
 * (PNG!054 ...) -> D4K (54)
 */
export function detectProjectorType(response: string): ProjectorType {
	const parsed = parseResponse(response)
	if (!parsed) {
		return 'unknown'
	}

	// For PNG responses, the type code is in the subcode field (055), not value (008)
	const typeCode = parsed.subcode || parsed.value
	if (typeCode === '044' || typeCode === '44') {
		return 'mseries'
	} else if (typeCode === '055' || typeCode === '55') {
		return 'boxer'
	} else if (typeCode === '054' || typeCode === '54') {
		return 'boxer' // D4K uses same commands as Boxer
	}

	return 'unknown'
}

/**
 * Check if a response indicates success (error code 000)
 */
export function isSuccessResponse(response: ParsedResponse): boolean {
	return !response.errorCode || response.errorCode === '000'
}

/**
 * Get lamp codes based on projector type
 */
export function getLampCodes(type: ProjectorType): { [key: string]: number[] } {
	if (type === 'boxer') {
		return {
			A1: [0, 1, 3, 4, 6], // State, Hours, Install Date, S/N, Voltage
			A2: [40, 41, 43, 44, 46],
			A3: [50, 51, 53, 54, 56],
			B1: [60, 61, 63, 64, 66],
			B2: [70, 71, 73, 74, 76],
			B3: [80, 81, 83, 84, 86],
		}
	} else {
		// M-Series
		return {
			'1': [0, 1, 2, 8], // State, Status, S/N, Hours
			'2': [30, 31, 32, 38], // State, Status, S/N, Hours
		}
	}
}

/**
 * Get voltage codes for fast polling (polled every 3 seconds with status)
 */
export function getLampVoltageCodes(type: ProjectorType): { [key: string]: number[] } {
	if (type === 'boxer') {
		return {
			A1: [6], // Voltage
			A2: [46],
			A3: [56],
			B1: [66],
			B2: [76],
			B3: [86],
		}
	} else {
		// M-Series doesn't expose voltage
		return {}
	}
}

/**
 * Get static info codes for slow polling (polled every 30 minutes)
 * Includes: State, Hours, Serial Number, Install Date, Status
 */
export function getLampStaticCodes(type: ProjectorType): { [key: string]: number[] } {
	if (type === 'boxer') {
		return {
			A1: [0, 1, 3, 4], // State, Hours, Install Date, S/N
			A2: [40, 41, 43, 44],
			A3: [50, 51, 53, 54],
			B1: [60, 61, 63, 64],
			B2: [70, 71, 73, 74],
			B3: [80, 81, 83, 84],
		}
	} else {
		// M-Series
		return {
			'1': [0, 1, 2, 8], // State, Status, S/N, Hours
			'2': [30, 31, 32, 38],
		}
	}
}

/**
 * Parse lamp information from multiple responses
 * Pass the base code for the lamp (0 for A1, 40 for A2, 50 for A3, etc.)
 */
export function parseLampInfo(
	responses: { [key: number]: ParsedResponse },
	lampType: 'boxer' | 'mseries',
	baseCode: number = 0
): LampInfo {
	if (lampType === 'boxer') {
		return {
			state: responses[baseCode + 0]?.value || 'Unknown',
			hours: responses[baseCode + 1] ? formatHours(responses[baseCode + 1].value) : 'Unknown',
			installDate: responses[baseCode + 3]?.value,
			serialNumber: responses[baseCode + 4]?.value || 'Unknown',
			voltage: responses[baseCode + 6]?.value || 'Unknown',
			status: 'OK', // Boxer doesn't have separate status field
		}
	} else {
		// M-Series uses different code layout
		return {
			state: responses[baseCode + 0]?.value || 'Unknown',
			status: responses[baseCode + 1]?.value || 'Unknown',
			serialNumber: responses[baseCode + 2]?.value || 'Unknown',
			hours: responses[baseCode + 8] ? formatHours(responses[baseCode + 8].value) : 'Unknown',
			voltage: 'N/A', // M-Series doesn't expose voltage in simple query
		}
	}
}
