import { alpha, Chip } from "@mui/material"

interface KeyboardShortcutProps {
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    letter: string
}

export default function KeyboardShortcut(props: KeyboardShortcutProps) {
    const keystroke = [
        props.ctrl ? 'Ctrl' : '',
        props.alt ? 'Alt' : '',
        props.shift ? 'Shift' : '',
        props.letter,
    ].filter(Boolean).join('+')

    return (
        <Chip
            variant="outlined"
            component={'span'}
            sx={(theme) => ({
                fontSize: '0.8rem',
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                borderRadius: theme.spacing(1),
                py: 0.125,
                px: 0.75,
                boxSizing: 'content-box',
                minWidth: '1ch',
                height: 'unset',
                '& *': {
                    m: '0 !important',
                    p: '0 !important',
                }
            })}
            label={keystroke}
        />
    )
}
