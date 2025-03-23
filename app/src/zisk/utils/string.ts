import { SyncStatusEnum } from "@/contexts/RemoteContext"

export interface FormatCurrencyAmountOptions {
	minimumFractionDigits: number
	maximumFractionDigits: number
}

const formatCurrencyAmount = (amount: number, options: Partial<FormatCurrencyAmountOptions> = {}): string => {
	const combinedOptions: FormatCurrencyAmountOptions = {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		...options,
	}
	return amount.toLocaleString('en-US', combinedOptions);
}

export interface PriceStringOptions {
	sign: 'never' | 'whenPositive' | 'always'
	round: boolean
}

export const getPriceString = (price: number, options: Partial<PriceStringOptions> = {}): string => {
	const combinedOptions: PriceStringOptions = {
		sign: 'whenPositive',
		round: false,
		...options,
	}
	const formatOptions: Partial<FormatCurrencyAmountOptions> = combinedOptions.round ? {
		maximumFractionDigits: 0,
		minimumFractionDigits: 0,
	} : {}
	if (price === 0) {
		return '$0.00'
	} else if (price > 0) {
		return `${['always', 'whenPositive'].includes(combinedOptions.sign) ? '+' : ''}$${formatCurrencyAmount(price, formatOptions)}`
	} else {
		return `${options.sign === 'always' ? '-' : ''}$${formatCurrencyAmount(-price)}`
	}
}

export const formatBasisPointsDiff = (basisPoints: number) => {
	return `${basisPoints >= 0 ? '+' : '-'}${(basisPoints / 100).toFixed(1)}%`
}

export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return '0 Bytes'

	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

	const i = Math.floor(Math.log(bytes) / Math.log(k))
	const size = bytes / Math.pow(k, i)

	let dm = 0
	if (size < 10) {
		dm = 2 // 1 significant figure
	} else if (size < 100) {
		dm = 1 // 2 significant figures
	}

	return `${parseFloat(size.toFixed(dm))} ${sizes[i]}`
}

/**
 * Pluralizes a word.
 *
 * @example p(2, 'apple'); // => 'apples'
 * @example p(null, 'orange'); // => 'oranges'
 * @example p(1, 'banana'); // => 'banana'
 * @example p(10, 'berr', 'y', 'ies'); // => 'berries'
 *
 * @param quantity The quantity used to infer plural or singular
 * @param word The word to pluralize
 * @param {[string]} singularSuffix The suffix used for a singular item
 * @param {[string]} pluralSuffix The suffix used for plural items
 * @returns
 */
export const pluralize = (quantity: number, word: string, singularSuffix = '', pluralSuffix = 's') => {
	return `${word}${Number(quantity) === 1 ? singularSuffix : pluralSuffix}`;
};

export const getSyncStatusTitles = (syncStatus: SyncStatusEnum) => {
	switch (syncStatus) {
		case SyncStatusEnum.CONNECTING_TO_REMOTE:
			return {
				syncStatusTitle: 'Connecting to remote...',
				syncStatusDescription: 'Waiting to establish connection with remote database',
			}
		case SyncStatusEnum.FAILED_TO_CONNECT:
			return {
				syncStatusTitle: 'Failed to connect',
				syncStatusDescription: 'Failed to establish connection with remote database',
			}
		case SyncStatusEnum.SAVING:
			return {
				syncStatusTitle: 'Syncing...',
				syncStatusDescription: 'Pulling and pushing changes to remote database',
			}
		case SyncStatusEnum.SAVED_TO_REMOTE:
			return {
				syncStatusTitle: 'Saved to remote',
				syncStatusDescription: 'Your changes have been saved to the remote database',
			}
		case SyncStatusEnum.WORKING_OFFLINE:
			return {
				syncStatusTitle: 'Working offline',
				syncStatusDescription:
					'Your device is currently offline. Changes will be synced when you are back online',
			}
		case SyncStatusEnum.SAVED_TO_THIS_DEVICE:
			return {
				syncStatusTitle: 'Saved to this device',
				syncStatusDescription:
					'Your changes have been saved locally, but need to be synced to the remote database',
			}
		case SyncStatusEnum.WORKING_LOCALLY:
			return {
				syncStatusTitle: 'Working locally',
				syncStatusDescription: 'All changes will be maintained locally',
			}
		case SyncStatusEnum.FAILED_TO_SAVE:
			return {
				syncStatusTitle: 'Failed to save',
				syncStatusDescription: 'Failed to save changes to the remote database',
			}
		case SyncStatusEnum.IDLE:
		default:
			return {
				syncStatusTitle: 'Idle',
				syncStatusDescription: 'No changes to sync',
			}
	}
}

export const sentenceCase = (input: string): string => {
	return `${input.charAt(0).toUpperCase()}${input.substring(1)}`
}
