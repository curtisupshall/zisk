import { create } from "zustand";

type JournalSelectorStatus = 'CLOSED' | 'SELECTING' | 'CREATING'

interface JournalSelectorState {
    status: JournalSelectorStatus
    setStatus: (status: JournalSelectorStatus) => void
}

const useJournalSelectorState = create<JournalSelectorState>((set) => ({
    status: 'CLOSED',
    setStatus: (status) => set({ status }),
}))

export const useSetJournalSelectorStatus = () => useJournalSelectorState((state) => state.setStatus)
export const useJournalSelectorStatus = () => useJournalSelectorState((state) => state.status)
