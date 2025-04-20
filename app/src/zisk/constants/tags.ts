import { ReservedTag, ReservedTagKey } from "@/types/schema";

export const RESERVED_TAGS: Record<ReservedTagKey, ReservedTag> = {
    'FLAGGED': {
        kind: 'RESERVED_TAG',
        _id: 'FLAGGED',
        label: 'Flagged',
        description: 'This entry has been flagged for review',
    },
    'NEEDS_REVIEW': { // Disabled
        kind: 'RESERVED_TAG',
        _id: 'NEEDS_REVIEW',
        label: 'Needs Review',
        disabled: true,
        description: 'This entry needs to be reviewed',
    },
    'WAS_REVIEWED': { // Disabled
        kind: 'RESERVED_TAG',
        _id: 'WAS_REVIEWED',
        label: 'Reviewed',
        disabled: true,
        description: 'This entry has been reviewed',
    },
    'APPROXIMATE': {
        kind: 'RESERVED_TAG',
        _id: 'APPROXIMATE',
        label: 'Approximate',
        description: 'Amounts are only rough estimates'
    },
    'PENDING': {
        kind: 'RESERVED_TAG',
        _id: 'PENDING',
        label: 'Pending',
        description: 'Entry is pending'
    },
}
