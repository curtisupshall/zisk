import { AmountRange } from "@/schema/support/slice"
import { AttributeFilter, DownstreamAttributeFilter, UpstreamAttributeFilter } from "./support/AttributeFilter"
import { transformAmountRange } from "@/utils/filtering"

export class AmountFilter extends AttributeFilter<AmountRange> {
    public upstream: UpstreamAttributeFilter = () => {
        const { greaterThan, lessThan } = transformAmountRange(this.filter)

        return [
            {
                _derived: {
                    figure: {
                        currency: this.filter.currency,
                        amount: {
                            $gt: greaterThan,
                            $lt: lessThan,
                        }
                    },
                }
            },
        ]
    }

    public downstream: DownstreamAttributeFilter = (entries) => {
        const { greaterThan, lessThan } = transformAmountRange(this.filter)

        if (greaterThan === undefined && lessThan === undefined) {
            return null
        }

        return entries.filter((entry) => {
            const amount = entry._derived?.figure?.amount
            if (amount === undefined) {
                return false
            } else if (greaterThan !== undefined && amount <= greaterThan) {
                return false
            } else if (lessThan !== undefined && amount >= lessThan) {
                return false
            }
            return true
        })
    }

    serialize(): string {
        return `${this.filter.currency}(${this.filter.gt},${this.filter.lt})${this.filter.absolute}`
    }
}
