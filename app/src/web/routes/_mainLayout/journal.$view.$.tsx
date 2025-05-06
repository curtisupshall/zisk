import JournalEditor from '@/components/journal/JournalEditor'
import JournalSliceContextProvider from '@/providers/JournalSliceContextProvider'
import { DatePeriod, DateView, DateViewSymbol, MonthlyPeriod, WeeklyPeriod } from '@/schema/support/slice'
import { dateMonthNumberWithLeadingZero, getAbsoluteDateRangeFromDateView, getAnnualPeriodFromDate, getMonthlyPeriodFromDate, getWeeklyPeriodFromDate } from '@/utils/date'
import dayjs from 'dayjs'
import { useCallback, useMemo } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_mainLayout/journal/$view/$')({
	component: JournalPage,
	params: {
		parse: (params) => {
			const view: DateViewSymbol | undefined = Object
				.values(DateViewSymbol)
				.find((v: DateViewSymbol) => {
					return v === params.view.toLowerCase()
				})

			const catchAll = params._splat ?? ''
			const [year, month, day] = catchAll.split('/').filter(Boolean) as [string | undefined, string | undefined, string | undefined]

			if (!view) {
				throw redirect({ to: '/journal' })
			}
			const paramValues = {
				view,
				y: year ? String(Number(year)) : undefined,
				m: month ? String(Number(month)) : undefined,
				d: day ? String(Number(day)) : undefined,
			}
			if (view === DateViewSymbol.YEARLY || view === DateViewSymbol.MONTHLY) {
				delete paramValues.d
			}
			if (view === DateViewSymbol.YEARLY) {
				delete paramValues.m
			}
			return paramValues
		},
		stringify: (params) => {
			const y = params.y ? String(Number(params.y)) : undefined
			const m = params.m ? String(Number(params.m)) : undefined
			const d = params.d ? String(Number(params.d)) : undefined
			const view = params.view
			const _splat = [y, m, d].filter(Boolean).join('/')

			return { view, y, m, d, _splat }
		},
	},
	validateSearch: (search: Record<string, unknown>): { tab: 'journal' | 'transfers' } => {
		const tab = (search.tab ?? 'journal') as 'journal' | 'transfers'
		return {
			tab
		}
	},
})

function JournalPage() {
	const params = Route.useParams()
	const view: DateViewSymbol = params.view

	const now = useMemo(() => dayjs(), [])

	const navigate = useNavigate()

	const pushToRouter = useCallback((
		newView: DateViewSymbol,
		year: string | undefined,
		month: string | undefined,
		day: string | undefined
	) => {
		navigate({
			to: '/journal/$view/$',
			params: { view: newView, y: year, m: month, d: day },
			search: { tab: 'journal' },
		})
	}, [navigate])

	const handleDateChange = useCallback(
		(newDate: string) => {
			let [y, m, d] = newDate.split('-') as [string | undefined, string | undefined, string | undefined]
			if (view === DateViewSymbol.YEARLY || view === DateViewSymbol.MONTHLY) {
				d = undefined
			}
			if (view === DateViewSymbol.YEARLY) {
				m = undefined
			}

			pushToRouter(view, y, m, d)
		},
		[view, pushToRouter]
	)

	const date = useMemo(() => {
		let { y, m, d } = params

		if (!m) {
			m = y ? '1' : String(now.month() + 1) // Zero-indexed
		}
		if (!y) {
			y = String(now.year())
		}

		const isSameMonthAndYear = y === String(now.year()) && m === String(now.month() + 1) // Zero-indexed
		if (!d) {
			d = isSameMonthAndYear ? String(now.date()) : '1'
		}

		return [
			parseInt(y),
			dateMonthNumberWithLeadingZero(parseInt(m)),
			dateMonthNumberWithLeadingZero(parseInt(d)),
		].join('-')
	}, [params])

	const handleChangeDateView = (dateView: DateView) => {
		const { startDate } = getAbsoluteDateRangeFromDateView(dateView)
		if (!startDate) {
			return
		}
		handleDateChange(startDate.format('YYYY-MM-DD'))
	}

	const handleSwitchDateView = (newView: DateViewSymbol) => {
		if (newView === view || newView === DateViewSymbol.RANGE) {
			return
		}

		let datePeriod: DatePeriod | undefined = undefined
		switch (newView) {
			case DateViewSymbol.YEARLY:
				datePeriod = getAnnualPeriodFromDate(dayjs(date))
				break

			case DateViewSymbol.MONTHLY:
				datePeriod = getMonthlyPeriodFromDate(dayjs(date))
				break

			case DateViewSymbol.WEEKLY:
				datePeriod = getWeeklyPeriodFromDate(dayjs(date))
				break
		}

		if (!datePeriod) {
			return
		}

		const { year, month, day } = (datePeriod as WeeklyPeriod)

		pushToRouter(
			newView,
			year ? String(year) : '',
			month ? String(month) : '',
			day ? String(day) : '',
		)
		
	}

	const dateView = useMemo((): DateView => {
		if (view === DateViewSymbol.RANGE) {
			// TODO startDate and endDate to be pulled from query params
			return {}
		}
		const value: DateView = {
			year: dayjs(date).year()
		}
		if (view === DateViewSymbol.WEEKLY || view === DateViewSymbol.MONTHLY) {
			(value as MonthlyPeriod).month = dayjs(date).month() + 1 // Zero-indexed
		}
		if (view === DateViewSymbol.WEEKLY) {
			(value as WeeklyPeriod).day = dayjs(date).date()
		}

		return value
	}, [date, view])

	return (
		<JournalSliceContextProvider
			dateView={dateView}
			onChangeDateView={handleChangeDateView}
			switchDateView={handleSwitchDateView}
		>
			<JournalEditor />
		</JournalSliceContextProvider>
	)
}
