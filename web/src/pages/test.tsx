import RichTextEditor from '@/components/text/RichText/RichTextEditor'
import { getLayout } from '@/layouts/main'
import { Typography } from '@mui/material'

const TestPage = () => {
	return (
		<div>
			<Typography variant='h3' mb={2}>Test Page</Typography>
			<RichTextEditor />
		</div>
	)
}

TestPage.getLayout = getLayout

export default TestPage
