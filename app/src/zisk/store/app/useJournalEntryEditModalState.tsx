import { JournalEntry } from "@/schema/documents/JournalEntry";
import { create } from "zustand";

interface JournalEntryEditModalState {
    open: boolean
    initialFormValues: JournalEntry | null
    edit: (entry: JournalEntry) => void
    create: () => void
    close: () => void
}

export const useJournalEntryEditModalState = create<JournalEntryEditModalState>((set) => ({
    open: false,
    initialFormValues: null,
    edit: (entry) => set({ initialFormValues: entry, open: true }),
    create: () => set({ initialFormValues: null, open: true }),
    close: () => set({ open: false })
}))

export const useBeginEditingJournalEntry = () => useJournalEntryEditModalState((state) => state.edit)
export const useCloseEntryEditModal = () => useJournalEntryEditModalState((state) => state.close)
export const useEntryEditModalOpen = () => useJournalEntryEditModalState((state) => state.open)
export const useOpenEntryEditModalForCreate = () => useJournalEntryEditModalState((state) => state.create)
export const useEntryEditModalInitialValues = () => useJournalEntryEditModalState((state) => state.initialFormValues)
