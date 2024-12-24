import { Button, Checkbox, Grid2 as Grid, IconButton, Link, Stack, TextField, Tooltip, Typography } from "@mui/material"
import { Add, Delete, Download } from "@mui/icons-material"
import { AttachmentMeta, EntryArtifact, JournalEntry } from "@/types/schema"
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form"
import FilePreview from "../file/FilePreview"
import { useContext, useRef, useState } from "react"
import { JournalContext } from "@/contexts/JournalContext"
import { makeEntryArtifact } from "@/utils/journal"
import SelectionActionModal from "../modal/SelectionActionModal"
import { useFilePrompt } from "@/hooks/useFilePrompt"

export default function EntryArtifactsForm() {
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const selectionMenuAnchorRef = useRef<HTMLDivElement>(null);
    const journalContext = useContext(JournalContext)
    
	const promptForFiles = useFilePrompt()
    
    const { setValue, control } = useFormContext<JournalEntry>()
    const artifacts = useWatch({ control, name: 'artifacts' }) ?? []
    const attachments = useWatch({ control, name: '_attachments' }) ?? {}
	const entryArtifactsFieldArray = useFieldArray({
		control,
		name: 'artifacts',
	})

    const handleAddArtifact = async () => {
		if (!journalContext.journal) {
			return
		}

		const files = await promptForFiles("image/*", true)        
		if (!Array.isArray(files)) {
            return
		}
        
        const journalId = journalContext.journal._id
		const newArtifacts: EntryArtifact[] = [];
		const newAttachments: Record<string, AttachmentMeta> = {}

		for (const file of files) {
			const artifact = makeEntryArtifact({
				contentType: file.type,
				size: file.size,
				originalFileName: file.name,
				description: '',
			}, journalId)
			console.log('NEW artifact:', artifact)

			newArtifacts.push(artifact)
			newAttachments[artifact._id] = {
				content_type: file.type,
				data: file
			}
		}

		if (artifacts) {
			newArtifacts.forEach((artifact) => entryArtifactsFieldArray.prepend(artifact))
		} else {
			setValue('artifacts', newArtifacts)
		}

		setValue('_attachments', { ...attachments, ...newAttachments })
	}


    const handleToggleSelected = (key: string) => {
        const isSelected = selectedRows.includes(key)
        if (isSelected) {
            setSelectedRows(selectedRows.filter((id) => id !== key))
        } else {
            setSelectedRows([...selectedRows, key])
        }
    }

    const handleRemoveArtifacts = (artifactIds: string[]) => {
        const indices = artifactIds.map((artifactId) => entryArtifactsFieldArray.fields.findIndex((entry) => entry._id === artifactId))
        entryArtifactsFieldArray.remove(indices)
        setSelectedRows(selectedRows.filter((id) => !artifactIds.includes(id)))
    }

    const handleSelectAll = () => {    
        setSelectedRows(entryArtifactsFieldArray.fields.map((entry) => entry._id))
    }

    const handleDeselectAll = () => {
        setSelectedRows([])
    }

    const handleDeleteSelectedArtifacts = () => {
        handleRemoveArtifacts(selectedRows)
    }


    const handleDownloadFile = (file: File) => {
        const objectURL = URL.createObjectURL(file)
        window.open(objectURL)
    }

    const handleDeleteArtifact = (artifactId: EntryArtifact['_id'], index: number) => {
        entryArtifactsFieldArray.remove(index)
        setSelectedRows(selectedRows.filter((id) => id !== artifactId))
        const newAttachments = { ...attachments }
        delete newAttachments[artifactId]
        setValue('_attachments', newAttachments)
    }

    return (
        <>
            <SelectionActionModal
                anchorEl={selectionMenuAnchorRef.current}
                open={selectedRows.length > 0}
                numSelected={selectedRows.length}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                numTotalSelectable={entryArtifactsFieldArray.fields.length}
                actions={{
                    onDelete: handleDeleteSelectedArtifacts
                }}
            />
            <Stack direction='row' alignItems={'center'} justifyContent={'space-between'} mt={2} mx={-2} px={2} ref={selectionMenuAnchorRef}>
                <Typography>Attachments ({artifacts.length})</Typography>
                <Button onClick={() => handleAddArtifact()} startIcon={<Add />}>Add Attachment</Button>
            </Stack>
            {artifacts.length === 0 && (
                <Typography variant='body2' color='textSecondary'>
                    No attachments. <Link onClick={() => handleAddArtifact()}>Click to add one.</Link>
                </Typography>
            )}
            <Stack mt={2} mx={-1} spacing={1}>
                {entryArtifactsFieldArray.fields.map((artifact, index) => {
                    const file = attachments[artifact._id]?.data

                    return (
                        <Stack direction='row' spacing={0} alignItems={'flex-start'} sx={{ width: '100%' }} key={artifact._id}>
                            <Checkbox
                                checked={selectedRows.includes(artifact._id)}
                                onChange={() => handleToggleSelected(artifact._id)}
                            />
                            <Grid container columns={12} spacing={1} sx={{ flex: '1', ml: 1 }}>
                                <Grid size={'auto'}>
                                    <FilePreview file={file} />
                                </Grid>
                                <Grid size={'grow'}>
                                    <Stack spacing={1}>
                                        <Stack direction={'row'} spacing={1} alignItems={'center'}>
                                            <Typography>{artifact.originalFileName}</Typography>
                                            <Typography variant='body2'>{file?.size} bytes</Typography>
                                        </Stack>
                                        <Controller
                                            key={artifact._id}
                                            control={control}
                                            name={`artifacts.${index}.description`}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label='Description'
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    </Stack>
                                </Grid>
                            </Grid>
                            <Stack direction={'row'} spacing={-1} alignItems={'center'}>
                                <Tooltip title='Download'>
                                    <IconButton onClick={() => handleDownloadFile(file)} color='primary'>
                                        <Download />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title='Delete'>
                                    <IconButton onClick={() => handleDeleteArtifact(artifact._id, index)}>
                                        <Delete />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    )
                })}
            </Stack>
        </>
    )
}
