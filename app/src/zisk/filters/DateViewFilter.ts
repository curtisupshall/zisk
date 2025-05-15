import { DateView } from "@/schema/support/slice"
import { getAbsoluteDateRangeFromDateView } from "@/utils/date"
import { AttributeFilter, DownstreamAttributeFilter, UpstreamAttributeFilter } from "./support/AttributeFilter"
import dayjs from "dayjs"

export class DateViewFilter extends AttributeFilter<DateView> {
    public upstream: UpstreamAttributeFilter = () => {
        const { startDate, endDate } = getAbsoluteDateRangeFromDateView(this.filter)

        if (!startDate && !endDate) {
            return null
        }

        return [
            {
                date: {
                    $gte: startDate?.format('YYYY-MM-DD'),
                    $lte: endDate?.format('YYYY-MM-DD'),
                }
            }
        ]
    }

    public downstream: DownstreamAttributeFilter = (entries) => {
        const { startDate, endDate } = getAbsoluteDateRangeFromDateView(this.filter)

        if (!startDate && !endDate) {
            return null
        }

        return entries.filter((entry) => {
            const date = dayjs(entry.date)
            !date.isBefore(startDate) && !date.isAfter(endDate)
        })
    }

    serialize(): string {
        const {startDate, endDate } = getAbsoluteDateRangeFromDateView(this.filter)
        if (!startDate && !endDate) {
            return ''
        }
        return [startDate, endDate]
            .map((date) => date?.format('YYYY-MM-DD'))
            .join('-')
    }
}
