import { TCPHelper, InstanceStatus } from '@companion-module/base'
import type { ModuleConfig } from './config.js'
import type { ModuleInstance } from './main.js'

interface QueuedCommand {
	command: string
	resolve: (response: string) => void
	reject: (error: Error) => void
	/** Started when the command is actually sent, not when it is queued */
	timeout?: NodeJS.Timeout
	isMultiResponse?: boolean // For SST queries that return multiple responses
	accumulatedResponses?: string[] // Collected responses for multi-response commands
	multiResponseTimer?: NodeJS.Timeout // Timer to detect end of response stream
}

export class ChristieConnection {
	private instance: ModuleInstance
	private socket: TCPHelper | null = null
	private commandQueue: QueuedCommand[] = []
	private currentCommand: QueuedCommand | null = null
	private receiveBuffer: string = ''
	// Projectors can take 1-2 seconds to answer a status query, especially when busy
	private readonly RESPONSE_TIMEOUT = 3000
	private readonly MULTI_RESPONSE_DELAY = 200 // Wait 200ms for all SST responses to arrive

	constructor(instance: ModuleInstance) {
		this.instance = instance
	}

	public init(config: ModuleConfig): void {
		this.disconnect()

		if (!config.host) {
			this.instance.updateStatus(InstanceStatus.BadConfig, 'No host configured')
			return
		}

		this.socket = new TCPHelper(config.host, config.port)

		this.socket.on('status_change', (status, message) => {
			this.instance.log('debug', `Connection status: ${status} - ${message}`)
			this.instance.updateStatus(status, message)
		})

		this.socket.on('error', (err) => {
			this.instance.log('error', `Network error: ${err.message}`)
			this.instance.updateStatus(InstanceStatus.ConnectionFailure, err.message)
		})

		this.socket.on('connect', () => {
			this.instance.log('info', 'Connected to projector')
			this.receiveBuffer = ''
		})

		this.socket.on('data', (data) => {
			this.handleReceivedData(data)
		})
	}

	public disconnect(): void {
		if (this.socket) {
			this.socket.destroy()
			this.socket = null
		}

		// Clear command queue
		while (this.commandQueue.length > 0) {
			const cmd = this.commandQueue.shift()
			if (cmd) {
				clearTimeout(cmd.timeout)
				if (cmd.multiResponseTimer) {
					clearTimeout(cmd.multiResponseTimer)
				}
				cmd.reject(new Error('Connection closed'))
			}
		}

		if (this.currentCommand) {
			clearTimeout(this.currentCommand.timeout)
			if (this.currentCommand.multiResponseTimer) {
				clearTimeout(this.currentCommand.multiResponseTimer)
			}
			this.currentCommand.reject(new Error('Connection closed'))
			this.currentCommand = null
		}

		this.receiveBuffer = ''
	}

	private handleReceivedData(data: Buffer): void {
		this.receiveBuffer += data.toString()

		// Look for complete responses (enclosed in parentheses)
		// Regex handles escaped parentheses like \(h:m\) inside the response
		const responseMatch = this.receiveBuffer.match(/\((?:[^)\\]|\\[()])*\)/)
		if (responseMatch) {
			const response = responseMatch[0]
			this.receiveBuffer = this.receiveBuffer.substring(responseMatch.index! + response.length)

			this.instance.log('debug', `Received: ${response}`)

			if (this.currentCommand && !this.isResponseToCommand(response, this.currentCommand.command)) {
				// A reply to a command that already timed out: don't hand it to the command that is waiting now
				this.instance.log('debug', `Ignoring unexpected response while waiting for ${this.currentCommand.command}`)
			} else if (this.currentCommand) {
				// Check if this is a multi-response command (SST queries)
				if (this.currentCommand.isMultiResponse) {
					// Accumulate this response
					if (!this.currentCommand.accumulatedResponses) {
						this.currentCommand.accumulatedResponses = []
					}
					this.currentCommand.accumulatedResponses.push(response)

					// Clear existing multi-response timer
					if (this.currentCommand.multiResponseTimer) {
						clearTimeout(this.currentCommand.multiResponseTimer)
					}

					// Set a new timer - if no more responses arrive within MULTI_RESPONSE_DELAY, we're done
					this.currentCommand.multiResponseTimer = setTimeout(() => {
						if (this.currentCommand && this.currentCommand.accumulatedResponses) {
							// Concatenate all responses and resolve
							const concatenatedResponse = this.currentCommand.accumulatedResponses.join('')
							clearTimeout(this.currentCommand.timeout)
							this.currentCommand.resolve(concatenatedResponse)
							this.currentCommand = null
							this.processQueue()
						}
					}, this.MULTI_RESPONSE_DELAY)
				} else {
					// Single response command - resolve immediately
					clearTimeout(this.currentCommand.timeout)
					this.currentCommand.resolve(response)
					this.currentCommand = null
					this.processQueue()
				}
			}

			// If there's more data in the buffer, recursively process it
			if (this.receiveBuffer.includes('(')) {
				void setImmediate(() => this.handleReceivedData(Buffer.from('')))
			}
		}
	}

	public async sendCommand(command: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const wrappedCommand = command.startsWith('(') ? command : `(${command})`

			// Detect if this is a multi-response SST query
			const isMultiResponse = wrappedCommand.includes('SST+') && wrappedCommand.includes('?')

			this.commandQueue.push({
				command: wrappedCommand,
				resolve,
				reject,
				isMultiResponse,
			})

			if (!this.currentCommand) {
				this.processQueue()
			}
		})
	}

	private processQueue(): void {
		if (this.currentCommand || this.commandQueue.length === 0) {
			return
		}

		const command = this.commandQueue.shift()!
		this.currentCommand = command

		if (!this.socket) {
			command.reject(new Error('Not connected'))
			this.currentCommand = null
			return
		}

		command.timeout = setTimeout(() => {
			if (this.currentCommand !== command) return
			if (command.multiResponseTimer) {
				clearTimeout(command.multiResponseTimer)
			}
			this.currentCommand = null
			command.reject(new Error(`Command timeout: ${command.command}`))
			this.processQueue()
		}, this.RESPONSE_TIMEOUT)

		this.instance.log('debug', `Sending: ${command.command}`)
		void this.socket.send(command.command)
	}

	/**
	 * True unless the response is clearly for a different command.
	 * "(PWR 1)" / "(PWR?)" are answered with "(PWR!001 ...)"; error replies and anything
	 * not in the "NAME!" form are accepted as before.
	 */
	private isResponseToCommand(response: string, command: string): boolean {
		const responseName = response.match(/^\(([A-Za-z0-9+]+)!/)?.[1]
		const commandName = command.match(/^\(([A-Za-z0-9+]+)/)?.[1]
		if (!responseName || !commandName) return true
		return responseName.toUpperCase() === commandName.toUpperCase()
	}

	public isConnected(): boolean {
		return this.socket !== null
	}
}
