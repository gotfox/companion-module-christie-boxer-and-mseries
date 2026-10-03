import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import type { ModuleTypes } from './types.js'
import { UpdateActions, stopAllLensMovements } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { ChristieConnection } from './connection.js'
import {
	detectProjectorType,
	parseResponse,
	parseConcatenatedResponses,
	formatHours,
	type ProjectorType,
} from './utils.js'

export class ModuleInstance extends InstanceBase<ModuleTypes> {
	config!: ModuleConfig
	connection!: ChristieConnection
	detectedProjectorType: ProjectorType = 'unknown'
	pollTimer: NodeJS.Timeout | null = null
	lampPollTimer: NodeJS.Timeout | null = null

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig, _isFirstInit: boolean): Promise<void> {
		this.config = config
		this.connection = new ChristieConnection(this)

		this.updateStatus(InstanceStatus.Connecting, 'Connecting to projector')

		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.updatePresets()

		await this.initConnection()
	}

	async initConnection(): Promise<void> {
		this.connection.init(this.config)

		// Wait a moment for connection to establish
		await new Promise((resolve) => setTimeout(resolve, 500))

		// Auto-detect projector type if configured
		if (this.config.projectorType === 'auto') {
			await this.autoDetectProjector()
		} else {
			this.detectedProjectorType = this.config.projectorType
			this.log('info', `Using configured projector type: ${this.detectedProjectorType}`)
			// Update variable definitions and actions based on manually selected type
			this.updateVariableDefinitions(this.detectedProjectorType)
			this.updateActions(this.detectedProjectorType)
		}

		// Start polling
		this.startPolling()
	}

	async autoDetectProjector(): Promise<void> {
		try {
			this.log('info', 'Auto-detecting projector type...')
			const response = await this.connection.sendCommand('PNG?')
			this.detectedProjectorType = detectProjectorType(response)

			if (this.detectedProjectorType !== 'unknown') {
				this.log('info', `Detected projector type: ${this.detectedProjectorType}`)
				// Update variable definitions and actions based on detected type
				this.updateVariableDefinitions(this.detectedProjectorType)
				this.updateActions(this.detectedProjectorType)
				this.setVariableValues({
					projector_type: this.detectedProjectorType === 'boxer' ? 'Boxer 4K' : 'M-Series',
				})
				this.updateStatus(InstanceStatus.Ok)
			} else {
				this.log('warn', `Could not detect projector type. Response: ${response}`)
				this.setVariableValues({ projector_type: 'Unknown' })
				this.updateStatus(InstanceStatus.UnknownWarning, 'Could not detect projector type')
			}
		} catch (error) {
			this.log('error', `Auto-detection failed: ${error}`)
			this.setVariableValues({ projector_type: 'Unknown' })
			this.updateStatus(InstanceStatus.UnknownWarning, 'Auto-detection failed')
		}
	}

	startPolling(): void {
		this.stopPolling()

		// Poll general status at configured interval
		this.pollTimer = setInterval(() => {
			void this.pollStatus()
		}, this.config.pollingInterval)

		// Poll lamp hours less frequently (every 30 minutes)
		this.lampPollTimer = setInterval(
			() => {
				void this.pollLampInfo()
			},
			30 * 60 * 1000,
		)

		// Do an immediate poll
		void this.pollStatus()
		void this.pollLampInfo()
	}

	stopPolling(): void {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
			this.pollTimer = null
		}
		if (this.lampPollTimer) {
			clearInterval(this.lampPollTimer)
			this.lampPollTimer = null
		}
	}

	/**
	 * Fast polling (every 3 seconds)
	 * Polls frequently changing data: power, shutter, lens positions, test pattern, date/time
	 */
	async pollStatus(): Promise<void> {
		if (!this.connection.isConnected()) {
			return
		}

		try {
			// Poll power status
			const powerResponse = await this.connection.sendCommand('PWR?')
			const powerParsed = parseResponse(powerResponse)
			if (powerParsed) {
				const powerStatus = powerParsed.description || powerParsed.value
				const cleanedPower = powerStatus.replace(/\s*\\?\([^)]*\\?\)/g, '').trim()
				this.setVariableValues({ power_status: cleanedPower })
			}

			// Poll shutter status
			const shutterResponse = await this.connection.sendCommand('SHU?')
			const shutterParsed = parseResponse(shutterResponse)
			if (shutterParsed) {
				const shutterStatus = shutterParsed.description || shutterParsed.value
				const cleanedShutter = shutterStatus.replace(/\s*\\?\([^)]*\\?\)/g, '').trim()
				this.setVariableValues({ shutter_status: cleanedShutter })
			}

			// Poll current input
			const inputResponse = await this.connection.sendCommand('SIN?')
			const inputParsed = parseResponse(inputResponse)
			if (inputParsed) {
				this.setVariableValues({ current_input: inputParsed.value })
			}

			// Poll lens positions
			await this.pollLensPositions()

			// Poll test pattern
			const testPatternResponse = await this.connection.sendCommand('ITP?')
			const testPatternParsed = parseResponse(testPatternResponse)
			if (testPatternParsed) {
				// Use description field (e.g., "Off") instead of value (e.g., "000")
				this.setVariableValues({ test_pattern: testPatternParsed.description || testPatternParsed.value })
			}

			// Poll date and time
			const dateResponse = await this.connection.sendCommand('TMD+DATE?')
			const dateParsed = parseResponse(dateResponse)
			if (dateParsed) {
				this.setVariableValues({ current_date: dateParsed.value })
			}

			const timeResponse = await this.connection.sendCommand('TMD+TIME?')
			const timeParsed = parseResponse(timeResponse)
			if (timeParsed) {
				this.setVariableValues({ current_time: timeParsed.value })
			}

			this.checkAllFeedbacks()
		} catch (error) {
			this.log('warn', `Polling error: ${error}`)
		}
	}

	/**
	 * Poll lens positions (focus, zoom, horizontal offset, vertical offset)
	 */
	async pollLensPositions(): Promise<void> {
		try {
			const focusResponse = await this.connection.sendCommand('FCS?')
			const focusParsed = parseResponse(focusResponse)
			if (focusParsed) {
				this.setVariableValues({ lens_focus: focusParsed.value })
			}

			const zoomResponse = await this.connection.sendCommand('ZOM?')
			const zoomParsed = parseResponse(zoomResponse)
			if (zoomParsed) {
				this.setVariableValues({ lens_zoom: zoomParsed.value })
			}

			const horizontalResponse = await this.connection.sendCommand('LHO?')
			const horizontalParsed = parseResponse(horizontalResponse)
			if (horizontalParsed) {
				this.setVariableValues({ lens_horizontal_offset: horizontalParsed.value })
			}

			const verticalResponse = await this.connection.sendCommand('LVO?')
			const verticalParsed = parseResponse(verticalResponse)
			if (verticalParsed) {
				this.setVariableValues({ lens_vertical_offset: verticalParsed.value })
			}
		} catch (error) {
			this.log('debug', `Lens position polling error: ${error}`)
		}
	}

	/**
	 * Comprehensive polling (every 30 minutes)
	 * Uses combined queries to get all lamp, signal, and system data
	 */
	async pollLampInfo(): Promise<void> {
		if (!this.connection.isConnected()) {
			return
		}

		try {
			const projectorType = this.getProjectorType()
			if (projectorType === 'unknown') {
				this.log('debug', 'Skipping comprehensive poll - projector type unknown')
				return
			}

			this.log('debug', 'Polling comprehensive data (lamps, signals, system)')

			// Poll all lamp data with single query
			await this.pollAllLampData(projectorType)

			// Poll all signal data with single query
			await this.pollAllSignalData(projectorType)

			// Poll all system data with single query
			await this.pollAllSystemData(projectorType)

			this.checkFeedbacks('lamp_hours_threshold')
		} catch (error) {
			this.log('warn', `Comprehensive polling error: ${error}`)
		}
	}

	/**
	 * Poll all lamp data using single SST+LAMP? query
	 */
	async pollAllLampData(projectorType: ProjectorType): Promise<void> {
		try {
			const lampResponse = await this.connection.sendCommand('SST+LAMP?')
			const lampDataMap = parseConcatenatedResponses(lampResponse)

			if (projectorType === 'boxer') {
				// Boxer has 6 lamps: A1-A3, B1-B3
				const lampMapping = [
					{ number: 1, name: 'A1', baseCode: 0 },
					{ number: 2, name: 'A2', baseCode: 40 },
					{ number: 3, name: 'A3', baseCode: 50 },
					{ number: 4, name: 'B1', baseCode: 60 },
					{ number: 5, name: 'B2', baseCode: 70 },
					{ number: 6, name: 'B3', baseCode: 80 },
				]

				for (const lamp of lampMapping) {
					// Pad subcode to 3 digits for Map lookup
					const state = lampDataMap.get((lamp.baseCode + 0).toString().padStart(3, '0'))?.value || 'Unknown'
					const hours = lampDataMap.get((lamp.baseCode + 1).toString().padStart(3, '0'))?.value || 'Unknown'
					const installDate = lampDataMap.get((lamp.baseCode + 3).toString().padStart(3, '0'))?.value || 'N/A'
					const serial = lampDataMap.get((lamp.baseCode + 4).toString().padStart(3, '0'))?.value || 'Unknown'
					const voltage = lampDataMap.get((lamp.baseCode + 6).toString().padStart(3, '0'))?.value || 'Unknown'

					this.setVariableValues({
						[`lamp_${lamp.number}_state`]: state,
						[`lamp_${lamp.number}_hours`]: formatHours(hours),
						[`lamp_${lamp.number}_status`]: 'OK', // Boxer doesn't have separate status
						[`lamp_${lamp.number}_voltage`]: voltage,
						[`lamp_${lamp.number}_serial`]: serial,
						[`lamp_${lamp.number}_install_date`]: installDate,
					})
				}
			} else if (projectorType === 'mseries') {
				// M-Series has 2 lamps
				const lampMapping = [
					{ number: 1, baseCode: 0 },
					{ number: 2, baseCode: 30 },
				]

				for (const lamp of lampMapping) {
					// Pad subcode to 3 digits for Map lookup
					const state = lampDataMap.get((lamp.baseCode + 0).toString().padStart(3, '0'))?.value || 'Unknown'
					const status = lampDataMap.get((lamp.baseCode + 1).toString().padStart(3, '0'))?.value || 'Unknown'
					const serial = lampDataMap.get((lamp.baseCode + 2).toString().padStart(3, '0'))?.value || 'Unknown'
					const installDate = lampDataMap.get((lamp.baseCode + 7).toString().padStart(3, '0'))?.value || 'N/A'
					const hours = lampDataMap.get((lamp.baseCode + 8).toString().padStart(3, '0'))?.value || 'Unknown'

					this.setVariableValues({
						[`lamp_${lamp.number}_state`]: state,
						[`lamp_${lamp.number}_hours`]: formatHours(hours),
						[`lamp_${lamp.number}_status`]: status,
						[`lamp_${lamp.number}_voltage`]: 'N/A', // M-Series doesn't expose voltage in SST+LAMP
						[`lamp_${lamp.number}_serial`]: serial,
						[`lamp_${lamp.number}_install_date`]: installDate,
					})
				}
			}
		} catch (error) {
			this.log('warn', `Lamp data polling error: ${error}`)
		}
	}

	/**
	 * Poll all signal data using single SST+SIGN? query
	 */
	async pollAllSignalData(projectorType: ProjectorType): Promise<void> {
		try {
			const signalResponse = await this.connection.sendCommand('SST+SIGN?')
			const signalDataMap = parseConcatenatedResponses(signalResponse)

			if (projectorType === 'boxer') {
				// Boxer signal inputs
				const signalMapping = [
					{ code: '000', variable: 'signal_hdbaset' },
					{ code: '001', variable: 'signal_card0_input1' },
					{ code: '002', variable: 'signal_card0_input2' },
					{ code: '003', variable: 'signal_card0_input3' },
					{ code: '004', variable: 'signal_card0_input4' },
					{ code: '011', variable: 'signal_card1_input1' },
					{ code: '012', variable: 'signal_card1_input2' },
					{ code: '021', variable: 'signal_card2_input1' },
					{ code: '022', variable: 'signal_card2_input2' },
					{ code: '031', variable: 'signal_card3_input1' },
					{ code: '032', variable: 'signal_card3_input2' },
					{ code: '041', variable: 'signal_card4_input1' },
					{ code: '042', variable: 'signal_card4_input2' },
					{ code: '050', variable: 'output_frequency' },
					{ code: '051', variable: 'frame_lock' },
					{ code: '053', variable: 'tsic_connection' },
				]

				const updates: Record<string, string> = {}
				for (const signal of signalMapping) {
					const rawValue = signalDataMap.get(signal.code)?.value || 'Unknown'
					// Clean escaped characters like \(
					const cleanValue = rawValue.replace(/\\([()[\]])/g, '$1')
					updates[signal.variable] = cleanValue
				}
				this.setVariableValues(updates)
			} else if (projectorType === 'mseries') {
				// M-Series main and PIP signal
				// Helper to clean escaped characters
				const clean = (val: string) => val.replace(/\\([()[\]])/g, '$1')

				const updates: Record<string, string> = {
					main_signal_state: clean(signalDataMap.get('000')?.value || 'Unknown'),
					main_signal_frequency: clean(signalDataMap.get('001')?.value || 'Unknown'),
					main_signal_sync_width: clean(signalDataMap.get('002')?.value || 'Unknown'),
					main_signal_sync_type: clean(signalDataMap.get('003')?.value || 'Unknown'),
					main_signal_type: clean(signalDataMap.get('004')?.value || 'Unknown'),
					main_signal_pixel_rate: clean(signalDataMap.get('005')?.value || 'Unknown'),
					pip_signal_state: clean(signalDataMap.get('010')?.value || 'Unknown'),
					pip_signal_frequency: clean(signalDataMap.get('011')?.value || 'Unknown'),
					pip_signal_sync_width: clean(signalDataMap.get('012')?.value || 'Unknown'),
					pip_signal_sync_type: clean(signalDataMap.get('013')?.value || 'Unknown'),
					pip_signal_type: clean(signalDataMap.get('014')?.value || 'Unknown'),
					pip_signal_pixel_rate: clean(signalDataMap.get('015')?.value || 'Unknown'),
				}
				this.setVariableValues(updates)
			}
		} catch (error) {
			this.log('warn', `Signal data polling error: ${error}`)
		}
	}

	/**
	 * Poll all system data using single SST+SYST? query
	 */
	async pollAllSystemData(projectorType: ProjectorType): Promise<void> {
		try {
			const systemResponse = await this.connection.sendCommand('SST+SYST?')
			const systemDataMap = parseConcatenatedResponses(systemResponse)

			if (projectorType === 'boxer') {
				const projectorHours = systemDataMap.get('000')?.value || 'Unknown'
				this.setVariableValues({
					projector_hours: formatHours(projectorHours),
					pitch_roll: systemDataMap.get('001')?.value || 'Unknown',
					lens_motor_horizontal: systemDataMap.get('005')?.value || 'Unknown',
					lens_motor_vertical: systemDataMap.get('006')?.value || 'Unknown',
					lens_motor_zoom: systemDataMap.get('007')?.value || 'Unknown',
					lens_motor_focus: systemDataMap.get('008')?.value || 'Unknown',
					power_supply_voltage: systemDataMap.get('027')?.value || 'Unknown',
				})
			} else if (projectorType === 'mseries') {
				const projectorHours = systemDataMap.get('000')?.value || 'Unknown'
				this.setVariableValues({
					projector_hours: formatHours(projectorHours),
					lens_type: systemDataMap.get('001')?.value || 'Unknown',
					output_frequency: systemDataMap.get('003')?.value || 'Unknown',
					frame_lock: systemDataMap.get('004')?.value || 'Unknown',
					slot_1: systemDataMap.get('005')?.value || 'Unknown',
					slot_2: systemDataMap.get('006')?.value || 'Unknown',
					slot_3: systemDataMap.get('007')?.value || 'Unknown',
					slot_4: systemDataMap.get('008')?.value || 'Unknown',
				})
			}
		} catch (error) {
			this.log('warn', `System data polling error: ${error}`)
		}
	}

	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		this.stopPolling()
		stopAllLensMovements()
		this.connection.disconnect()
	}

	async configUpdated(config: ModuleConfig, _secrets: undefined): Promise<void> {
		const reconnect = config.host !== this.config.host || config.port !== this.config.port
		const typeChanged = config.projectorType !== this.config.projectorType

		this.config = config

		if (reconnect) {
			this.stopPolling()
			await this.initConnection()
		} else if (typeChanged) {
			// Projector type changed, update variables and reconnect
			this.stopPolling()
			await this.initConnection()
		} else {
			// Just restart polling with new interval
			this.startPolling()
		}
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields(this.detectedProjectorType)
	}

	updateActions(projectorType?: ProjectorType): void {
		UpdateActions(this, projectorType || this.getProjectorType())
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(projectorType?: ProjectorType): void {
		UpdateVariableDefinitions(this, projectorType)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	getProjectorType(): ProjectorType {
		return this.config.projectorType === 'auto' ? this.detectedProjectorType : this.config.projectorType
	}
}

export default ModuleInstance
export { UpgradeScripts } from './upgrades.js'
