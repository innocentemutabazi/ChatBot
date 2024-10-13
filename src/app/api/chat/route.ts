import Groq from "groq-sdk";
import { NextResponse, NextRequest } from "next/server";
import { getPrompt } from "../../../utils/prompt";
import { NextApiResponse } from "next";

const options = {
	model: process.env.MODEL_ID || "llama3-8b-8192",
	temperature: 0.5,
	max_tokens: 1024,
	top_p: 1,
	stop: null,
	stream: true,
};

export async function POST(req: NextRequest, res: NextApiResponse) {
	const assistantName: any =
		req.nextUrl.searchParams.get("assistantName") || "assistant";
	if (!assistantName) return res.status(400).json({ error: "Invalid path." });

	const prompt = getPrompt(assistantName);
	if (!prompt) return res.status(404).json({ error: "Not found." });

	const data = await req.json();
	const groq = new Groq();
	const completion = await groq.chat.completions.create({
		messages: [prompt, ...data],
		...options,
	});

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();
			try {
				// @ts-ignore
				for await (let chunk of completion) {
					const content = chunk.choices[0]?.delta?.content || "";
					if (content) {
						controller.enqueue(encoder.encode(content));
					}
				}
			} catch (err) {
				controller.error(err);
			} finally {
				controller.close();
			}
		},
	});

	return new NextResponse(stream);
}
