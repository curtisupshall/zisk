import { Journal } from "@/schema/documents/Journal"
import { createDocumentStore } from "../support/useDocumentStore"

export const useJournalStore = createDocumentStore<Journal>()

export const useJournals = () => useJournalStore((state) => state.items)
export const useSetJournals = () => useJournalStore((state) => state.setItems)
export const useAddJournal = () => useJournalStore((state) => state.addItem)
export const useRemoveJournal = () => useJournalStore((state) => state.deleteItem)
