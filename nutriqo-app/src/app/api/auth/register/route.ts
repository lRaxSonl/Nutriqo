import { createPocketBaseClient, getPocketBaseUsersCollection } from "@/shared/lib/pocketbase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const email = typeof body?.email === "string" ? body.email.trim() : "";
		const password = typeof body?.password === "string" ? body.password : "";

		if (!email || !password || password.length < 6) {
			return NextResponse.json(
				{ message: "Невалидные данные. Пароль должен быть не короче 6 символов." },
				{ status: 400 }
			);
		}

		const pocketbase = createPocketBaseClient();
		const usersCollection = getPocketBaseUsersCollection();
		const userRecord = await pocketbase.collection(usersCollection).create({
			email,
			password,
			passwordConfirm: password,
		});

		return NextResponse.json({
			ok: true,
			userId: userRecord.id,
			emailConfirmationRequired: false,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Ошибка регистрации";
		return NextResponse.json({ message }, { status: 400 });
	}
}
