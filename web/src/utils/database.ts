import { ZiskMeta, ZiskSettings } from '@/types/schema'
import { generateGenericUniqueId } from './id'

export const makeDefaultZiskSettings = (): ZiskSettings => {
	return {
		appearance: {
			// theme: 'DARK',
			// animations: 'NORMAL',
			menuExpanded: true,
		},
		server: {
			serverType: 'NONE',
		},
		syncingStrategy: {
			strategyType: 'LOCAL',
		},
	}
}

export const makeDefaultZiskMeta = (): ZiskMeta => {
	return {
		_id: generateGenericUniqueId(),
		activeJournalId: null,
		type: 'ZISK_META',
		settings: makeDefaultZiskSettings(),
		createdAt: new Date().toISOString(),
	}
}
