
import { Box, Divider, IconButton, Stack } from '@mui/material'
import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer'
import { HeadingNode } from '@lexical/rich-text'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { FormatBold, FormatItalic, FormatUnderlined } from '@mui/icons-material'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { EditorThemeClasses, FORMAT_TEXT_COMMAND } from 'lexical'

function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext()

    return (
        <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
            <IconButton size='small' onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}>
                <FormatBold />
            </IconButton>
            <IconButton size='small' onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}>
                <FormatItalic />
            </IconButton>
            <IconButton size='small' onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}>
                <FormatUnderlined />
            </IconButton>
            <Divider orientation='vertical' />
        </Stack>

    )
}

const theme: EditorThemeClasses = {
    text: {
        bold: 'bo',
        italic: 'it',
        underline: 'un',
    },
}

export default function RichTextEditor() {

    const initialConfig: InitialConfigType = {
        namespace: 'RichTextEditor-1',
        theme,
        onError: () => {},
        nodes: [
            HeadingNode,
            CodeHighlightNode,
            CodeNode,
        ],
    }

    return (
        <Box>
            <LexicalComposer initialConfig={initialConfig}>
                <Box position='relative'>
                    <ToolbarPlugin />
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                style={{
                                    height: 120,
                                    fontSize: 12,
                                    padding: 8,
                                    overflow: 'auto',
                                    border: '1px solid red',
                                    borderRadius: 4,
                                    outline: 'none',
                                }}
                            />
                        }
                        placeholder={
                            <Box sx={{
                                position: 'absolute',
                                color: '#999',
                                top: 20,
                                left: 12,
                            }}>
                                Some text
                            </Box>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </Box>
            </LexicalComposer>
        </Box>
    )
}

