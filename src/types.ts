import type { InstanceTypes } from '@companion-module/base'
import type { ModuleConfig } from './config.js'

export interface ModuleTypes extends InstanceTypes {
	config: ModuleConfig
	secrets: undefined
}
