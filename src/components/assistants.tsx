"use client"
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

const assistants = [
  {
    name: "assistant",
    title: "General Assistant",
    description: "Just want to talk? Try me.",
    details: "A versatile support assistant ready to help with a wide range of topics.",
  },
  {
    name: "coding",
    title: "Coding Assistant",
    description: "Stuck with coding? Try coding assistant.",
    details: "An expert coding assistant proficient in multiple programming languages and best practices.",
  },
  {
    name: "qna",
    title: "Q&A Assistant",
    description: "Have any questions? Ask me.",
    details: "A knowledgeable assistant ready to answer your queries with accurate and detailed information.",
  },
  {
    name: "fitness",
    title: "Fitness Assistant",
    description: "Looking for fitness tips? Our fitness assistant is here.",
    details: "A dedicated fitness assistant with a focus on cardio, offering personalized workout advice.",
  },

  {
    name: "healthnwellness",
    title: "Health & Wellness Guide",
    description: "Want to change your life in 21 days? Try our Health and Wellness.",
    details: "An enthusiastic health and wellness expert promoting holistic well-being with a 21-day habit formation approach.",
  },
  {
    name: "emotion",
    title: "Mood Lifter",
    description: "Feeling low? Try our mood lifter.",
    details: "A compassionate emotional support assistant offering a safe space and positive reinforcement.",
  },
];

const AssistantGrid = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const handleCardClick = (assistantName: string) => {
    router.push(`/chatbot?assistantName=${assistantName}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {assistants.map((assistant) => (
        <Card 
          key={assistant.name} 
          className={`
            cursor-pointer 
            transition-all duration-300 ease-in-out
            transform hover:scale-105 hover:shadow-xl
            ${theme === 'dark' ? 'hover:shadow-purple-500/20' : 'hover:shadow-blue-500/20'}
            dark:bg-gray-800 dark:text-white
            group
          `}
          onClick={() => handleCardClick(assistant.name)}
        >
          <CardHeader>
            <CardTitle className="text-xl border-b dark:border-white text-center  font-bold mb-2 group-hover:text-blue-500 dark:group-hover:text-purple-400 transition-colors duration-300">
              {assistant.title}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors duration-300">
              {assistant.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
              {assistant.details}
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
        </Card>
      ))}
    </div>
  );
};

export default AssistantGrid;