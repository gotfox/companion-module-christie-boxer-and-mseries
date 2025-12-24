import { TCPHelper, InstanceStatus } from '@companion-module/base'
import type { ModuleConfig } from './config.js'
import type { ModuleInstance } from './main.js'

interface QueuedCommand {
	command: string
	resolve: (response: string) => void
	reject: (error: Error) => void
	timeout: NodeJS.Timeout
}

export class ChristieConnection {
	private instance: ModuleInstance
	private socket: TCPHelper | null = null
	private commandQueue: QueuedCommand[] = []
	private currentCommand: QueuedCommand | null = null
	private receiveBuffer: string = ''
	private readonly RESPONSE_TIMEOUT = 1000

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

		this.socket!.on('status_change', (status, message) => {
			this.instance.log('debug', `Connection status: ${status} - ${message}`)
			this.instance.updateStatus(status, message)
		})

		this.socket!.on('error', (err) => {
			this.instance.log('error', `Network error: ${err.message}`)
			this.instance.updateStatus(InstanceStatus.ConnectionFailure, err.message)
		})

		this.socket!.on('connect', () => {
			this.instance.log('info', 'Connected to projector')
			this.receiveBuffer = ''
		})

		this.socket!.on('data', (data) => {
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
				cmd.reject(new Error('Connection closed'))
			}
		}

		if (this.currentCommand) {
			clearTimeout(this.currentCommand.timeout)
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
				clearTimeout(this.currentCommand.timeout)
				this.currentCommand.resolve(response)
				this.currentCommand = null
				this.processQueue()
			}
		}
	}

	public sendCommand(command: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const wrappedCommand = command.startsWith('(') ? command : `(${command})`

			const timeout = setTimeout(() => {
				if (this.currentCommand && this.currentCommand.command === wrappedCommand) {
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
		this.socket.send(this.currentCommand.command)
	}

	public isConnected(): boolean {
		return this.socket !== null
	}
}
