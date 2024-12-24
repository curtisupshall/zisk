import { exportJournal } from "@/database/actions";
import { ArrowDropDown } from "@mui/icons-material";
import { Button, ButtonGroup, Menu, MenuItem } from "@mui/material";
import { useRef, useState } from "react";

interface JournalActionsProps {
    onPromptDeleteJournal: () => void;
    onPromptResetJournal: () => void;
    onExportJournal: () => void;
}

export default function JournalActions(props: JournalActionsProps) {
    const anchorRef = useRef<HTMLDivElement>(null);
    const [showResetMenu, setShowResetMenu] = useState(false);

    const toggleResetMenu = () => {
        setShowResetMenu((prev) => !prev);
    }

    const handlePromptDeleteJournal = () => {
        props.onPromptDeleteJournal();
        setShowResetMenu(false);
    }

    const handlePromptResetJournal = () => {
        props.onPromptResetJournal();
        setShowResetMenu(false);
    }

    return (
        <>
            <Menu anchorEl={anchorRef.current} open={showResetMenu} onClose={() => setShowResetMenu(false)}>
                <MenuItem onClick={() => handlePromptResetJournal()}>Reset</MenuItem>
            </Menu>

            <Button onClick={() => props.onExportJournal()} color='primary'>
                Export
            </Button>
        
            <ButtonGroup variant='outlined' ref={anchorRef}>
                <Button onClick={() => handlePromptDeleteJournal()} color='error'>
                    Delete
                </Button>
                <Button
                    size="small"
                    color='error'
                    aria-controls={showResetMenu ? 'split-button-menu' : undefined}
                    aria-expanded={showResetMenu ? 'true' : undefined}
                    aria-label="select journal reset action"
                    aria-haspopup="menu"
                    onClick={() => toggleResetMenu()}
                >
                    <ArrowDropDown />
                </Button>
            </ButtonGroup>
        </>
    )
}