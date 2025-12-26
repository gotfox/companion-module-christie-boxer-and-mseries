import { TCPHelper, InstanceStatus } from '@companion-module/base'
import type { ModuleConfig } from './config.js'
import type { ModuleInstance } from './main.js'

interface QueuedCommand {
	command: string
	resolve: (response: string) => void
	reject: (error: Error) => void
	timeout: NodeJS.Timeout
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
	private readonly RESPONSE_TIMEOUT = 1000
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

			if (this.currentCommand) {
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

			const timeout = setTimeout(() => {
				if (this.currentCommand && this.currentCommand.command === wrappedCommand) {
					if (this.currentCommand.multiResponseTimer) {
						clearTimeout(this.currentCommand.multiResponseTimer)
					}
					this.currentCommand = null
					reject(new Error(`Command timeout: ${wrappedCommand}`))
					this.processQueue()
				}
			}, this.RESPONSE_TIMEOUT)

			this.commandQueue.push({
				command: wrappedCommand,
				resolve,
				reject,
				timeout,
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

		this.currentCommand = this.commandQueue.shift()!

		if (!this.socket) {
			clearTimeout(this.currentCommand.timeout)
			this.currentCommand.reject(new Error('Not connected'))
			this.currentCommand = null
			return
		}

		this.instance.log('debug', `Sending: ${this.currentCommand.command}`)
		void this.socket.send(this.currentCommand.command)
	}

	public isConnected(): boolean {
		return this.socket !== null
	}
}
