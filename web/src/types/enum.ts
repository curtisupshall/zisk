import { z } from "zod"

export const TransactionType = z.enum([
    'DEBIT',
    'CREDIT'
]);
export type TransactionType = z.output<typeof TransactionType>;

export const PaymentType = z.enum([
    'CASH',
    'ETRANSFER',
    'DEBIT',
    'CREDIT',
]);
export type PaymentType = z.output<typeof PaymentType>;

export const AvatarVariant = z.enum([
    'TEXT',
    'PICTORIAL',
    'IMAGE',
]);
export type AvatarVariant = z.output<typeof AvatarVariant>;

export const PAYMENT_TYPE_NAMES: Record<PaymentType, string> = {
    CASH: 'Cash',
    ETRANSFER: 'e-Transfer',
    DEBIT: 'Debit Card',
    CREDIT: 'Credit Card',
};
