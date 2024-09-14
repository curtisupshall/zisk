'use client';

import { AvatarVariant } from "@/types/enum";
import { ItemAvatar } from "@/types/get";
import { AddPhotoAlternate, Photo, RemoveCircle } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Avatar, AvatarProps, Box, Button, FormHelperText, Stack } from "@mui/material";
import { useMemo, useRef, useState } from "react";

interface ImageAvatarPicker {
    value: ItemAvatar;
    onChange: (avatar: ItemAvatar) => void;
}


interface ImageAvatarProps extends AvatarProps {
    avatar: ItemAvatar;
}

export const ImageAvatar = (props: ImageAvatarProps) => {
    const { avatar, ...rest } = props;
    const imageSrc = [
        'https:/',
        process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_IMAGES_URL,
        avatar.avatarContent
    ].join('/');

    return (
        <Avatar
            variant="rounded"
            src={imageSrc}
            {...rest}
        />
    )
}

export default function ImageAvatarPicker(props: ImageAvatarPicker) {
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef(null);

    const handleImageUploadSuccess = (data) => {
        props.onChange({
            avatarContent: data.s3Key,
            avatarVariant: AvatarVariant.Enum.IMAGE,
            avatarPrimaryColor: '',
        })
    }

    const hasImageIcon = useMemo(() => {
        return [
            Boolean(props.value),
            Boolean(props.value?.avatarContent),
            props.value?.avatarVariant === AvatarVariant.Enum.IMAGE,
        ].every(Boolean);
    }, [props.value]);

    const handleRemoveImage = () => {
        props.onChange(null);
    }

    const handleClickUploadButton = () => {
      fileInputRef.current.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploading(true);
            setUploadError(null);

            try {
                const formData = new FormData();
                formData.append('file', file);

                // Send the file to your API endpoint
                const response = await fetch('/api/images/upload', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                handleImageUploadSuccess(data);
            } catch (err) {
                setUploadError((err as Error).message);
            } finally {
                setUploading(false);
            }
        }
    }

    return (
        <Box p={2}>
            <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: 'none' }}
                ref={fileInputRef}
            />
            <Stack direction='row' sx={{ mb: 1 }} gap={2}>
                {hasImageIcon && (
                    <>
                        <ImageAvatar
                            avatar={props.value}
                            sx={uploading ? {
                                filter: 'blur(2px)',
                                opacity: 0.5,
                            } : undefined}
                        />
                        <Button
                            variant='text'
                            onClick={() => handleRemoveImage()}
                            startIcon={<RemoveCircle />}
                        >
                            Remove
                        </Button>
                    </>
                )}
                <LoadingButton
                    onClick={handleClickUploadButton}
                    loading={uploading}
                    startIcon={<AddPhotoAlternate />}
                >
                    {hasImageIcon ? 'Replace Image' : 'Add Image'}
                </LoadingButton>
            </Stack>            
            {uploadError && (
                <FormHelperText error>{uploadError}</FormHelperText>
            )}
        </Box>
    );
};