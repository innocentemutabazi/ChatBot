
import React from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import HeadstarterChatbot from "@/app/chatbot/page";
import LandingPage from "@/app/landing/page";
import Assistants from "@/components/assistants";

const MainPage = () => {
	return (
		<div className="container mx-auto my-8">
			<SignedIn>
				<Assistants />
			</SignedIn>
			<SignedOut>
				<LandingPage />
			</SignedOut>
		</div>
	);
};

export default MainPage;
