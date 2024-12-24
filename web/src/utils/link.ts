import { Category } from "@/types/schema";

export const generateCategoryLink = (category: Category): string => {
    return `/journal/a?cs=${category._id}`
}
