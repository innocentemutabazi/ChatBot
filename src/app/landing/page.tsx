
import React from "react";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const LandingPage = () => {
	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle className="text-3xl font-bold text-center">
					Welcome to Chatify
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-center mb-6">
					Get instant answers and assistance with our various AI-powered
					chatbots. Whether you have questions about Coding or
					need general information, we're here to help!
				</p>
			
				<div></div>
			</CardContent>
			<CardFooter className="flex justify-center">
				<SignInButton mode="modal">
					<Button size="lg">Sign In to Chat</Button>
				</SignInButton>
			</CardFooter>
		</Card>
	);
};

export default LandingPage;
