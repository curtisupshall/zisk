import { Account, Category } from "@/types/schema";

export const generateCategoryLink = (category: Category): string => {
    return `/journal/a?cs=${category._id}`
}

export const generateAccountLink = (account: Account): string => {
    return `/journal/a?a=${account._id}`
}
