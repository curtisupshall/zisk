import { DateViewSymbol } from '@/schema/support/slice'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_mainLayout/journal/')({
  loader: () => {
    throw redirect({
        to: '/journal/$view/$',
        params: { view: DateViewSymbol.MONTHLY, d: undefined, m: undefined, y: undefined },
        search: { tab: 'journal' }
    })
  },
})
