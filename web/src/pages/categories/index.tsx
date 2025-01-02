import ManageCategories from '@/components/journal/categories/ManageCategories'
import { getLayout } from '@/layouts/main'
import { Container } from '@mui/material'

const CategoriesPage = () => {
	return (
		<Container maxWidth="xl" disableGutters sx={{ pt: 1, pl: 1, pr: 3 }}>
			<ManageCategories />
		</Container>
	)
}

CategoriesPage.getLayout = getLayout

export default CategoriesPage
