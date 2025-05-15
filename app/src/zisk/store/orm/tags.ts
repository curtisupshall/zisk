import { createDocumentStore } from "../support/useDocumentStore"
import { EntryTag } from "@/schema/documents/EntryTag"

export const useEntryTagStore = createDocumentStore<EntryTag>()

export const useEntryTags = () => useEntryTagStore((state) => state.items)
export const useSetEntryTags = () => useEntryTagStore((state) => state.setItems)
