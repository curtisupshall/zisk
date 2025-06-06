import { useState } from 'react'
// import SearchModal from './SearchModal'
import { KeyboardActionName } from '@/constants/keyboard'
import useKeyboardAction from '@/hooks/useKeyboardAction'
import SearchLaunchButton from './SearchLaunchButton'

export default function SearchWidget() {
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false)

  useKeyboardAction(KeyboardActionName.OPEN_SEARCH_MODAL, () => {
    setShowSearchModal(true)
  })

  return (
    <>
      {/* <SearchModal
				open={showSearchModal}
				onClose={() => setShowSearchModal(false)}
				placeholderText='Search for journal entries and more...'
			/> */}
      <SearchLaunchButton placeholderText="Search" onOpen={() => setShowSearchModal(true)} />
    </>
  )
}
