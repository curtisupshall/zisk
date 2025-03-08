import { PropsWithChildren, useState } from 'react';
import { CalculatorContext } from "@/contexts/CalculatorContext";
import { ScreenCalculator } from '@/components/ScreenCalculator';

export default function CalculatorContextProvider(props: PropsWithChildren) {
    const [isOpen, setIsOpen] = useState(true);
    const [currentElement, setCurrentElement] = useState<HTMLElement | null>(null);

    const open = (element: HTMLElement) => {
        setCurrentElement(element);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
    };

    const contextValue = { open, close };

    return (
        <CalculatorContext.Provider value={contextValue}>
            {props.children}
            <ScreenCalculator open={isOpen} />
        </CalculatorContext.Provider>
    );
}
