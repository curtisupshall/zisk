'use client'

import ColorPicker from "@/components/color/ColorPicker";
import IconPicker from "@/components/icon/IconPicker";
import { InputBase, OutlinedInput, Select } from "@mui/material";
import { useState } from "react";


export default function TestPage() {
    const [icon, setIcon] = useState<string>('home');
    const [color, setColor] = useState<string>('red.400');

    return (
        <div>

            <IconPicker
                icon={icon}
                color={color}
                onChangeIcon={setIcon}
                onChangeColor={setColor}
            />
        </div>
    )
}
