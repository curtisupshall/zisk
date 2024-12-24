import { useEffect, useState } from 'react'
import SearchModal from './SearchModal'
import SearchLaunchButton from './SearchLaunchButton'

export default function SearchWidget() {
	const [showSearchModal, setShowSearchModal] = useState<boolean>(false)

	useEffect(() => {
		// Add event listener to open search when user presses '/' key
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === '/') {
				setShowSearchModal(true)
				event.stopPropagation()
				event.preventDefault()
			}
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [])

	return (
		<>
			<SearchModal
				open={showSearchModal}
				onClose={() => setShowSearchModal(false)}
				placeholderText='Search for journal entries and more...'
			/>
			<SearchLaunchButton
				placeholderText="Search"
				onOpen={() => setShowSearchModal(true)}
			/>
		</>
	)
}
