import { z, ZodRawShape } from 'zod'

class NaturalMixin {
    public static _ephemeral(_ephemeral: ZodRawShape) {
        return {
            _ephemeral: z.object(_ephemeral),
        }
    }

    public static _derived(_derived: ZodRawShape) {
        return {
            _derived: z.object(_derived),
        }
    }

    private static _id() {
        return {
            _id: z.string(),
        }
    }
}

class IntrinsicMixin {
    public static natural = {
        _ephemeral: NaturalMixin._ephemeral
    }
}

class DerivedMixin {
    public static timestamps() {
        return {
            createdAt: z.string(),
            'updatedAt': z.string().nullable().optional(),
        }
    }

    public static belongsToJournal() {
        return {
            journalId: z.string(),
        }
    }

    public static natural = {
        _derived: NaturalMixin._derived,
        // _id: NaturalMixin._id,
    }
}

export class Mixin {
    static intrinsic = IntrinsicMixin
    static derived = DerivedMixin
}
