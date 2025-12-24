import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { ChristieConnection } from './connection.js'
import { detectProjectorType, parseResponse, type ProjectorType } from './utils.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig
	connection!: ChristieConnection
	detectedProjectorType: ProjectorType = 'unknown'
	pollTimer: NodeJS.Timeout | null = null
	lampPollTimer: NodeJS.Timeout | null = null

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.connection = new ChristieConnection(this)

		this.updateStatus(InstanceStatus.Connecting, 'Connecting to projector')

		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()

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
			this.pollStatus()
		}, this.config.pollingInterval)

		// Poll lamp hours less frequently (every 30 minutes)
		this.lampPollTimer = setInterval(
			() => {
				this.pollLampInfo()
			},
			30 * 60 * 1000
		)

		// Do an immediate poll
		this.pollStatus()
		this.pollLampInfo()
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

	async pollStatus(): Promise<void> {
		if (!this.connection.isConnected()) {
			return
		}

		try {
			// Poll power status
			const powerResponse = await this.connection.sendCommand('PWR?')
			const powerParsed = parseResponse(powerResponse)
			if (powerParsed) {
				this.setVariableValues({ power_status: powerParsed.value })
			}

			// Poll shutter status
			const shutterResponse = await this.connection.sendCommand('SHU?')
			const shutterParsed = parseResponse(shutterResponse)
			if (shutterParsed) {
				this.setVariableValues({ shutter_status: shutterParsed.value })
			}

			// Poll signal status
			const signalResponse = await this.connection.sendCommand('SST+SIGN!000?')
			const signalParsed = parseResponse(signalResponse)
			if (signalParsed) {
				this.setVariableValues({ signal_status: signalParsed.value })
			}

			// Poll lamp voltage (fast polling)
			await this.pollLampVoltage()

			this.checkFeedbacks()
		} catch (error) {
			this.log('warn', `Polling error: ${error}`)
		}
	}

	async pollLampVoltage(): Promise<void> {
		// NOTE: Lamp voltage polling is disabled because many Boxer models
		// don't support SST+LMP commands (ERR00009 "Cannot find status group")
		// Re-enable this code block if your projector model supports these commands
		return

		/*
		const projectorType = this.getProjectorType()
		if (projectorType === 'unknown') {
			return
		}

		// Get voltage codes for this projector type
		const voltageCodes = getLampVoltageCodes(projectorType)

		// Poll each lamp's voltage
		for (const [lampName, codes] of Object.entries(voltageCodes)) {
			for (const code of codes) {
				try {
					const response = await this.connection.sendCommand(`SST+LMP!${code.toString().padStart(3, '0')}?`)
					const parsed = parseResponse(response)
					if (parsed) {
						// Map lamp name to number
						let lampNumber = 1
						if (projectorType === 'boxer') {
							const boxerMapping: { [key: string]: number } = {
								A1: 1,
								A2: 2,
								A3: 3,
								B1: 4,
								B2: 5,
								B3: 6,
							}
							lampNumber = boxerMapping[lampName] || 1
						} else {
							lampNumber = parseInt(lampName, 10)
						}

						this.setVariableValues({
							[`lamp_${lampNumber}_voltage`]: parsed.value,
						})
					}
				} catch (error) {
					// Don't log errors for voltage polling - it's frequent and errors would be noisy
				}
			}
		}
		*/
	}

	async pollLampInfo(): Promise<void> {
		if (!this.connection.isConnected()) {
			return
		}

		// NOTE: Lamp polling is disabled because many Boxer models
		// don't support SST+LMP commands (ERR00009 "Cannot find status group")
		// Re-enable this code block if your projector model supports these commands
		this.log('debug', 'Lamp polling disabled - SST+LMP commands not supported on this model')
		return

		/*
		try {
			const projectorType = this.getProjectorType()
			if (projectorType === 'unknown') {
				this.log('debug', 'Skipping lamp poll - projector type unknown')
				return
			}

			this.log('debug', 'Polling lamp static information (hours, serial, install date)')

			// Get static lamp codes (hours, serial, install date, status)
			const lampCodes = getLampStaticCodes(projectorType)

			// Poll each lamp
			for (const [lampName, codes] of Object.entries(lampCodes)) {
				const responses: { [key: number]: any } = {}

				// Query each code for this lamp
				for (const code of codes) {
					try {
						const response = await this.connection.sendCommand(`SST+LMP!${code.toString().padStart(3, '0')}?`)
						const parsed = parseResponse(response)
						if (parsed) {
							responses[code] = parsed
						}
					} catch (error) {
						this.log('warn', `Failed to query lamp ${lampName} code ${code}: ${error}`)
					}
				}

				// Parse lamp info and update variables
				const lampInfo = parseLampInfo(responses, projectorType as 'boxer' | 'mseries')

				// Map Boxer lamp names (A1, A2, etc) to indices (1, 2, etc)
				let lampNumber = 1
				if (projectorType === 'boxer') {
					const boxerMapping: { [key: string]: number } = {
						A1: 1,
						A2: 2,
						A3: 3,
						B1: 4,
						B2: 5,
						B3: 6,
					}
					lampNumber = boxerMapping[lampName] || 1
				} else {
					lampNumber = parseInt(lampName, 10)
				}

				// Update static lamp info (hours, serial, install date, status)
				this.setVariableValues({
					[`lamp_${lampNumber}_hours`]: lampInfo.hours,
					[`lamp_${lampNumber}_status`]: lampInfo.status,
					[`lamp_${lampNumber}_serial`]: lampInfo.serialNumber,
					[`lamp_${lampNumber}_install_date`]: lampInfo.installDate || 'N/A',
				})
			}

			this.checkFeedbacks('lamp_hours_threshold')
		} catch (error) {
			this.log('warn', `Lamp polling error: ${error}`)
		}
		*/
	}

	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		this.stopPolling()
		this.connection.disconnect()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		const reconnect = config.host !== this.config.host || config.port !== this.config.port

		this.config = config

		if (reconnect) {
			this.stopPolling()
			await this.initConnection()
		} else {
			// Just restart polling with new interval
			this.startPolling()
		}
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	getProjectorType(): ProjectorType {
		return this.config.projectorType === 'auto' ? this.detectedProjectorType : this.config.projectorType
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
