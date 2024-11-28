import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { number } from 'zod';

const POUCH_DB_NAME = '__zisk__db';

const COUCHDB_URL = process.env.NEXT_PUBLIC_COUCHDB_URL;

export const ZISK_JOURNAL_META_KEY = 'ZISK_JOURNAL_META';
const JOURNAL_ENTRY_SEQUENCE_NUMBER_STARTING_VALUE = 1;

export interface ZiskJournalMeta {
    _id: typeof ZISK_JOURNAL_META_KEY;
    journalEntrySequence: number;
    journalVersion: number;
}

const newMetaDoc: ZiskJournalMeta = {
    _id: ZISK_JOURNAL_META_KEY,
    journalEntrySequence: JOURNAL_ENTRY_SEQUENCE_NUMBER_STARTING_VALUE,
    journalVersion: 1,
}

export const db = new PouchDB(POUCH_DB_NAME);
export const remoteDb = new PouchDB(`${COUCHDB_URL}/zisk`);

PouchDB.plugin(PouchDBFind);

db.createIndex({
    index: {
        fields: [
            'type',
            'date',
            'parentEntryId',
        ]
    }
});

db.get(ZISK_JOURNAL_META_KEY)
    .catch((error) => {
        if (error.status === 404) {
            db.put(newMetaDoc);
        }
    });

db.bulkDocs([
    // Add a couple basic categories
    {
        "_id": "CATEGORY:1",
        "type": "CATEGORY",
        "label": "Tips & Gratuities",
        "description": "Tips or gratuities",
        "avatar": {
            "content": "volunteer_activism",
            "variant": "PICTORIAL",
            "primaryColor": "#9ccc65",
            "secondaryColor": null
        }
    },
    {
        "_id": "CATEGORY:2",
        "type": "CATEGORY",
        "label": "Rent",
        "description": "Rent expenses",
        "avatar": {
            "content": "house",
            "variant": "PICTORIAL",
            "primaryColor": "#d43d60",
            "secondaryColor": null
        }
    },
    {
        "_id": "CATEGORY:3",
        "type": "CATEGORY",
        "label": "Gifts",
        "description": "Gifts",
        "avatar": {
            "content": "card_giftcard",
            "variant": "PICTORIAL",
            "primaryColor": "#66bb6a",
            "secondaryColor": null
        }
    },
    {
        "_id": "CATEGORY:4",
        "type": "CATEGORY",
        "label": "Groceries",
        "description": "Groceries",
        "avatar": {
            "content": "local_grocery_store",
            "variant": "PICTORIAL",
            "primaryColor": "#ffca28",
            "secondaryColor": null
        }
    },

    // Add a couple basic tags
    {
        "_id": "ENTRY_TAG:APPROXIMATE",
        "type": "ENTRY_TAG",
        "label": "Approximate",
        "description": "The amount is an estimate and may not be accurate.",
        "createdAt": new Date().toISOString(),
        "updatedAt": null
    },
    {
        "_id": "ENTRY_TAG:PENDING_REFUND",
        "type": "ENTRY_TAG",
        "label": "Pending Refund",
        "description": "The transaction is pending a refund.",
        "createdAt": new Date().toISOString(),
        "updatedAt": null
    },
    {
        "_id": "ENTRY_TAG:REVIEW_REQUIRED",
        "type": "ENTRY_TAG",
        "label": "Review Required",
        "description": "The transaction requires further review.",
        "createdAt": new Date().toISOString(),
        "updatedAt": null
    },
    {
        "_id": "ENTRY_TAG:TAX_DEDUCTIBLE",
        "type": "ENTRY_TAG",
        "label": "Tax Deductible",
        "description": "The transaction is tax deductible.",
        "createdAt": new Date().toISOString(),
        "updatedAt": null
    },
    {
        "_id": "ENTRY_TAG:UNCONFIRMED",
        "type": "ENTRY_TAG",
        "label": "Unconfirmed",
        "description": "The transaction is unconfirmed.",
        "createdAt": new Date().toISOString(),
        "updatedAt": null
    },
    {
        "_id": "ENTRY_TAG:UNPAID",
        "type": "ENTRY_TAG",
        "label": "Unpaid",
        "description": "The transaction is unpaid.",
        "createdAt": new Date().toISOString(),
        "updatedAt": null
    },
    
]);
