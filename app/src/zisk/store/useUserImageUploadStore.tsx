import { Avatar } from '@/schema/models/Avatar'
import { create } from 'zustand'

interface UserImageAvatarHistoryStore {
	history: Avatar[]
	add: (avatar: Avatar) => void
	clear: () => void
}

export const useUserImageAvatarHistoryStore = create<UserImageAvatarHistoryStore>((set) => ({
	history: [],
	add: (avatar: Avatar) => set((state) => ({ history: [avatar, ...state.history] })),
	clear: () => set({ history: [] }),
}))
