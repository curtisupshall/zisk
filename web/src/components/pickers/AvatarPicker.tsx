
import { Box, Button, colors, Fade, Icon, InputAdornment, OutlinedInput, Popover, Select, Stack, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useState } from 'react';
import IconPicker from './IconPicker';
import ImageAvatarPicker, { ImageAvatar } from './ImageAvatarPicker';
import { ItemAvatar } from '@/types/get';
import { AvatarVariant } from '@/types/enum';

interface AvatarPickerProps {
    value: ItemAvatar | null;
    onChange: (avatar: ItemAvatar | null) => void;
}

const DEFAULT_AVATAR: ItemAvatar = {
    avatarContent: 'layers',
    avatarVariant: AvatarVariant.Enum.PICTORIAL,
    avatarPrimaryColor: colors.grey[500],
};

const renderAvatarItem = (avatar: ItemAvatar) => {
    switch (avatar.avatarVariant) {
        case AvatarVariant.Enum.PICTORIAL:
            return (
                <Icon sx={{ color: avatar.avatarPrimaryColor }}>
                    {avatar.avatarContent}
                </Icon>
            );
        case AvatarVariant.Enum.IMAGE:
            return (
                <ImageAvatar avatar={avatar} sx={{ my: -0.5, width: '32px', height: '32px' }} />
            )
        default:
            return null;
    }
}

export default function AvatarPicker(props: AvatarPickerProps) {
    const [anchorEl, setAnchorEl] = useState<any>(null);
    const [currentTab, setCurrentTab] = useState<number>(0);

    const displayIcon: ItemAvatar = props.value ?? DEFAULT_AVATAR;
    const open = Boolean(anchorEl);

    return (
        <>
            <Select
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation()
                    setAnchorEl(event.currentTarget)
                }}
                value={displayIcon}
                renderValue={renderAvatarItem}
                readOnly
            />            
            <Popover
                TransitionComponent={Fade}
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                }}
            >
                <Box px={2} pt={1}>
                    <Tabs value={currentTab} onChange={(_event, newValue) => setCurrentTab(newValue)}>
                        <Tab label='Icon'/>
                        <Tab disabled label='Emoji' />
                        <Tab disabled label='Letters' />
                        <Tab label='Image' />
                    </Tabs>
                </Box>
                {currentTab === 0 && (
                    <IconPicker />
                )}
                {currentTab === 3 && (
                    <ImageAvatarPicker
                        value={displayIcon}
                        onChange={props.onChange}
                    />
                )}
            </Popover>
        </>
    )
}