"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { db, getFirebaseApp, initFirebase } from "@/app/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, notFound } from "next/navigation";
import { useTheme } from "next-themes";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const validAssistantNames = [
  "assistant",
  "coding",
  "qna",
  "fitness",
  "nutrition",
  "healthnwellness",
  "emotion",
];

/**
 * Component for rendering a chatbot page.
 */
const HeadstarterChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // For auto-focus

  const { user } = useUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  const params = useSearchParams();
  const assistantName = params.get("assistantName") || "assistant";
  const { theme } = useTheme();
  const properAssistant =
    assistantName.charAt(0).toUpperCase() + assistantName.slice(1);

  // Initialize Firebase (consider moving this to a higher level if possible)
  useEffect(() => {
    initFirebase();
  }, []);

  // Validate assistant name
  useEffect(() => {
    if (!validAssistantNames.includes(assistantName)) {
      notFound();
    }
  }, [assistantName]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation when user, email, or assistantName changes
  useEffect(() => {
    if (user && email) {
      fetchConversation(email, assistantName);
    }
  }, [user, email, assistantName]);

  // Auto-focus the input field on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debugging: Log messages whenever they change
  useEffect(() => {
    console.log("Updated messages:", messages);
  }, [messages]);

  const scrollToBottom = () => {
    if (latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchConversation = async (email: string, assistantName: string) => {
    try {
      const app = getFirebaseApp();
      if (!app) {
        console.error("Firebase app not initialized");
        return;
      }

      const conversationRef = doc(db, "conversations", email);
      const docSnap = await getDoc(conversationRef);
      if (docSnap.exists()) {
        const allConversations = docSnap.data() as Record<string, Message[]>;
        const fetchedMessages = allConversations[assistantName] || [];
        setMessages(fetchedMessages);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const saveConversation = async (
    email: string,
    assistantName: string,
    conversation: Message[]
  ) => {
    try {
      const app = getFirebaseApp();
      if (!app) {
        console.error("Firebase app not initialized");
        return;
      }

      const conversationRef = doc(db, "conversations", email);
      const docSnap = await getDoc(conversationRef);
      let allConversations: Record<string, Message[]> = docSnap.exists()
        ? (docSnap.data() as Record<string, Message[]>)
        : {};
      allConversations[assistantName] = conversation;
      await setDoc(conversationRef, allConversations);
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = { role: "user", content: input };

    // Append user message
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare the messages to send, including the new user message
      const messagesToSend = [...messages, userMessage];

      const response = await fetch(`/api/chat?assistantName=${assistantName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messagesToSend),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let botMessage: Message = { role: "assistant", content: "" };

      // Initialize botMessage in the state
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        botMessage.content += chunk;

        // Update the last message with the new chunk
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          { ...botMessage },
        ]);
      }

      // Save the conversation if the email is available
      if (email) {
        await saveConversation(email, assistantName, [
          ...messagesToSend,
          botMessage,
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      if (email) {
        await saveConversation(email, assistantName, [
          ...messages,
          userMessage,
          errorMessage,
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl dark:bg-gray-800 dark:text-white">
      {/* Assistant Name Header */}
      <nav className="w-full font-[20px] py-6 text-center border-b dark:border-gray-700">
        {properAssistant}
      </nav>

      <CardContent>
        <ScrollArea
          className="h-[500px] pt-4 overflow-y-auto"
          ref={scrollAreaRef}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } mb-4 animate-fadeIn`}
              ref={index === messages.length - 1 ? latestMessageRef : null}
            >
              <div
                className={`flex items-start ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {message.role === "user" ? "U" : "A"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`mx-2 p-3 rounded-lg transition-all duration-300 ease-in-out ${
                    message.role === "user"
                      ? "bg-blue-500 text-white dark:bg-blue-600"
                      : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
                  } hover:shadow-md`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4 animate-pulse">
              <div className="flex items-center bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
                {/* Simple Loading Spinner */}
                <svg
                  className="animate-spin h-5 w-5 text-gray-500 dark:text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              </div>
            </div>
          )}

          <div ref={latestMessageRef} />
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t dark:border-gray-700">
        <div className="flex w-full items-center space-x-2 mt-4">
          <Input
            ref={inputRef} // Attach ref for auto-focus
            type="text"
            placeholder="Ask about anything or just say Hi to start"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Prevent form submission
                handleSend();
              }
            }}
            className="flex-grow transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="transition-all duration-300 ease-in-out bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Send
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default HeadstarterChatbot;
