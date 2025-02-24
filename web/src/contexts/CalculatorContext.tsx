import { createContext } from "react";

interface CalculatorContext {
    open: (element: HTMLElement) => void
    close: () => void
}

export const CalculatorContext = createContext<CalculatorContext>({
    open: () => {},
    close: () => {},
})
