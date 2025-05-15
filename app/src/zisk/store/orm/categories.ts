import { Category } from "@/schema/documents/Category"
import { createDocumentStore } from "../support/useDocumentStore"

export const useCategoryStore = createDocumentStore<Category>()

export const useCategories = () => useCategoryStore((state) => state.items)
export const useSetCategories = () => useCategoryStore((state) => state.setItems)
export const useAddCategory = () => useCategoryStore((state) => state.addItem)
export const useRemoveCategory = () => useCategoryStore((state) => state.deleteItem)
