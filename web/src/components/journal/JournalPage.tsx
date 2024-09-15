'use server'

import { getCategoriesByUserId } from "@/actions/category-actions";
import { getJournalEntriesByUserId, getUserJournalEntriesByMonthAndYear } from "@/actions/journal-actions";
import { getTransactionMethodsByUserId } from "@/actions/method-actions";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import BaseLayout from "../layout/BaseLayout";
import JournalHeader from "./JournalHeader";
import { JournalDate } from "@/types/calendar";
import { JournalEntryContext } from "@/contexts/JournalEntryContext";
import JournalEditor from "./JournalEditor";

interface JournalPageProps extends JournalDate {}

export default async function JournalPage(props: JournalPageProps) {
    const { month, year } = props;
    const { user } = await validateRequest();

    // const transactionMethods = await getTransactionMethodsByUserId(user.id);
    const journalEntries = await getUserJournalEntriesByMonthAndYear(user.id, month, year);
    console.log('JournalPage.journalEntries:', journalEntries)
    const categories = await getCategoriesByUserId(user.id);

    return (
        <JournalEditor
            user={user}
            month={month}
            year={year}
            journalEntries={journalEntries}
            categories={categories}
        />
    )
}
