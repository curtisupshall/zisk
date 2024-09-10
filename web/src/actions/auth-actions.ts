'use server'

import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/database/client";
import { eq } from "drizzle-orm";
import { UserTable } from "@/database/schemas";
import { lucia, validateRequest } from "@/auth";

interface ActionResult {
	error: string;
}

export const login = async (formData: FormData): Promise<ActionResult> => {
	const username = formData.get("username");
	if (
		typeof username !== "string" ||
		// username.length < 3 ||
		// username.length > 31 ||
		// !/^[a-z0-9_-]+$/.test(username)
		false
	) {
		return {
			error: "Invalid username"
		};
	}
	const password = formData.get("password");
	if (typeof password !== "string" || password.length < 6 || password.length > 255) {
		return {
			error: "Invalid password"
		};
	}

	const existingUser = await db.query.UserTable.findFirst({
        where: eq(UserTable.username, username.toLowerCase())
    })

	if (!existingUser) {
		// NOTE:
		// Returning immediately allows malicious actors to figure out valid usernames from response times,
		// allowing them to only focus on guessing passwords in brute-force attacks.
		// As a preventive measure, you may want to hash passwords even for invalid usernames.
		// However, valid usernames can be already be revealed with the signup page among other methods.
		// It will also be much more resource intensive.
		// Since protecting against this is non-trivial,
		// it is crucial your implementation is protected against brute-force attacks with login throttling etc.
		// If usernames are public, you may outright tell the user that the username is invalid.
		return {
			error: "Incorrect username or password"
		};
	}

	const validPassword = await verify(existingUser.passwordHash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	if (!validPassword) {
		return {
			error: "Incorrect username or password"
		};
	}

	const session = await lucia.createSession(existingUser.id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return redirect("/");
}

export const logout = async () => {
	const { session } = await validateRequest();
	if (session) {
		await lucia.invalidateSession(session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}

	return redirect("/login");
}
