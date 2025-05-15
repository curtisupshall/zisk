import { Account } from "@/schema/documents/Account"
import { createDocumentStore } from "../support/useDocumentStore"

export const useAccountStore = createDocumentStore<Account>()

export const useAccounts = () => useAccountStore((state) => state.items)
export const useSetAccounts = () => useAccountStore((state) => state.setItems)
