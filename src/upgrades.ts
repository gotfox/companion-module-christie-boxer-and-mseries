import {
	EmptyUpgradeScript,
	type CompanionMigrationAction,
	type CompanionMigrationFeedback,
	type CompanionMigrationOptionValues,
	type CompanionStaticUpgradeScript,
} from '@companion-module/base'
import type { ModuleConfig } from './config.js'

/**
 * Upgrade scripts
 *
 * Remember that once a script has been added it cannot be removed or reordered: connections store the
 * index of the last script they ran.
 *
 * Index 0 is a placeholder. The module this one replaces (companion-module-christie-projector, `legacyIds`
 * in the manifest) already had one placeholder script, so connections adopted from it start at index 1.
 */

type OptionValue = CompanionMigrationOptionValues[string]

/** Apply `convert` to a plain option value, leave expressions and missing values alone */
function mapValue(option: OptionValue, convert: (value: unknown) => unknown): OptionValue {
	if (!option || option.isExpression) return option
	return { value: convert(option.value) as never, isExpression: false }
}

/** Old string dropdown ids ('0', '1', '22') to the numeric ids used by the native actions */
function toNumber(value: unknown): unknown {
	const n = Number(value)
	return Number.isFinite(n) ? n : value
}

/**
 * christie-projector actions that have a native equivalent.
 * (All other christie-projector actions are still available under their original ids.)
 */
const ACTION_CONVERSIONS: Record<string, { actionId: string; optionId: string; oldOptionId: string }> = {
	pwr: { actionId: 'power', optionId: 'state', oldOptionId: 'p1' },
	shu: { actionId: 'shutter', optionId: 'state', oldOptionId: 'p1' },
	osd: { actionId: 'osd', optionId: 'state', oldOptionId: 'p1' },
	itpBoxer: { actionId: 'test_pattern', optionId: 'pattern', oldOptionId: 'p1' },
	itpMser: { actionId: 'test_pattern', optionId: 'pattern', oldOptionId: 'p1' },
}

/**
 * The christie-projector `power_state` feedback is an advanced feedback with one color per state.
 * This module's `power_state` is a boolean feedback with a state dropdown, so the old one lives on as
 * `power_state_colors`.
 */
const LEGACY_POWER_STATE_OPTION = 'bg1'

const VALID_PROJECTOR_TYPES = ['auto', 'boxer', 'mseries'] as const

function convertConfig(config: ModuleConfig | null): ModuleConfig | null {
	if (!config) return null

	// The old module stored these as `interval` (ms, 0 = off), `pjtype` and a string `port`
	const old = config as unknown as Record<string, unknown>

	const interval = Number(old.pollingInterval ?? old.interval)
	const pollingInterval = interval > 0 ? Math.min(30000, Math.max(500, interval)) : 3000

	let projectorType: ModuleConfig['projectorType'] = 'auto'
	if (VALID_PROJECTOR_TYPES.includes(old.projectorType as never)) {
		projectorType = old.projectorType as ModuleConfig['projectorType']
	} else if (old.pjtype === 'boxer' || old.pjtype === 'mseries') {
		projectorType = old.pjtype
	}

	const port = Number(old.port)

	return {
		host: typeof old.host === 'string' ? old.host : '',
		port: port >= 1 && port <= 65535 ? port : 3002,
		projectorType,
		pollingInterval,
	}
}

function convertAction(action: CompanionMigrationAction): boolean {
	const conversion = ACTION_CONVERSIONS[action.actionId]
	if (!conversion) return false

	const value = mapValue(action.options[conversion.oldOptionId], toNumber)
	action.actionId = conversion.actionId
	action.options = value === undefined ? {} : { [conversion.optionId]: value }
	return true
}

function convertFeedback(feedback: CompanionMigrationFeedback): boolean {
	// Only the old advanced feedback: it has the colour options, the native one only has `state`
	if (feedback.feedbackId === 'power_state' && LEGACY_POWER_STATE_OPTION in feedback.options) {
		feedback.feedbackId = 'power_state_colors'
		return true
	}
	return false
}

/** Adopt connections of companion-module-christie-projector */
const convertFromChristieProjector: CompanionStaticUpgradeScript<ModuleConfig> = (_context, props) => ({
	updatedConfig: convertConfig(props.config),
	updatedActions: props.actions.filter(convertAction),
	updatedFeedbacks: props.feedbacks.filter(convertFeedback),
})

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [
	// 0: placeholder, mirrors the placeholder script of christie-projector
	EmptyUpgradeScript,

	// 1: adopt connections of companion-module-christie-projector
	convertFromChristieProjector,
]
