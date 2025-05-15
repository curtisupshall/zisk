import { Category } from "@/schema/documents/Category"
import { ZiskDocument } from "@/schema/union/ZiskDocument"
import { create } from "zustand"

interface DocumentState<T extends ZiskDocument> {
    items: Record<string, T>
    setItems: (items: Record<string, T>) => void
    deleteItem: (item: T) => void
    updateItem: (item: T) => void
    addItem: (item: T) => void
}

export function createDocumentStore<T extends ZiskDocument>() {
    return create<DocumentState<T>>((set) => ({
        items: {},

        setItems: (items: Record<string, T>) => set({ items }),

        deleteItem: (item: T) =>
            set((state) => {
                const newItems = { ...state.items }
                delete newItems[item._id]
                return { items: newItems }
            }),

        updateItem: (item: T) =>
            set((state) => ({
                items: {
                    ...state.items,
                    [item._id]: item,
                },
            })),

        addItem: (item: T) =>
            set((state) => ({
                items: {
                    ...state.items,
                    [item._id]: item,
                },
            })),
    }))
}
