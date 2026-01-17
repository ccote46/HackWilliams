"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/AuthContext";



/* Outline structure for messages */
interface Message {
    role: "user" | "assistant"
    content: string;

}



export default function Page() {
    //User input 
    const [prompt, setPrompt] = useState("");
    
    /*array of messages, containes entire chat history that is passed to agent every time so it can 
    remember previous chats*/
    const [messages, setMessages] = useState<Message[]>([]);
    //waiting for assistant response (used for thinking graphic)
    const [isLoading, setIsLoading] = useState(false);

    const { authStatus } = useAuth();

   
    // store last message to auto jump there when new chats appear
    const messagesEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);


   

    /* Function handles call & response to AI agent. Stores & sends user message + context window, 
    and returns agents message & adds it to the context window */
    async function handleSubmit(prompt: string) {
        //exit on empty msg
        if (!prompt.trim()) return;

        const userMessage: Message = {role: "user", content: prompt}; 
        //add message to array w/ other messages, update asap so user can see their msg sent
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        //msg sent..waiting response look
        setPrompt("");
        setIsLoading(true)

        //get agent response
        try{
            //send to agent
            const res = await fetch("/api/agents", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    prompt,
                    messages:updatedMessages
                }),
            });

            //snag 400s/500s errors
            if(!res.ok){
                throw new Error("Server error");
            }

            //parse and set response
            const data = await res.json();
            const assistantMessage: Message = {
                role: "assistant",
                content: data.text ?? JSON.stringify(data)
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } 
        catch (error){
            console.error(error);
            const errorMessage: Message ={ 
                role: "assistant",
                content: "Failed to get response. Please try again!"
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
        finally{
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-screen bg-stone-900">
            {/* Messages area*/}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* If user hasn't connected whoop / hasnt sent first msg*/}
                {messages.length === 0 && !authStatus.authenticated && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-stone-400">
                            <p className="text-lg mb-2"> Connect your Whoop account to chat!</p>
                            <p className="text-sm"> Get personalized coaching based on your recovery data</p>
                        </div>
                    </div>
                )}

                {/* add msgs (user on l in white, assistant on r in blue */}
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-start" : "justify-end"}`}
                    >
                        <div
                            className={`max-w-[70%] p-4 rounded-lg ${
                                message.role === "user"
                                    ? "bg-stone-700 text-white"
                                    : "bg-blue-600 text-white"
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}

                {/* Thinking indicator for assistant */}

                {isLoading && (
                    <div className="flex justify-end">
                        <div className="max-w-[70%] p-4 rounded-lg bg-blue-600 text-white">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms"}}></span>
                                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms"}}></span>
                                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms"}}></span>
                                </div>
                                <span>Thinking...</span>
                            </div>
                        </div>
                    </div>

                )}

                {/* Auto scroll to bottom */}
                <div ref={messagesEndRef}></div>
            </div>

            {/* User input Box */}
            <div className="border-t border-stone-700 bg-stone-800 p-4">
                <div className="max-w-4xl mx-auto flex gap-2">
                    <Input 
                        className="flex-1 bg-stone-700 text-white border-stone-600"
                        placeholder={
                            authStatus.authenticated
                                ? "Ask your sports psychology coach..."
                                : "Connect your Whoop to start chatting..."
                        }
                        value={prompt}
                        onChange={(input) => setPrompt(input.target.value)}
                        onKeyDown={(key) => key.key === "Enter" && !isLoading && handleSubmit(prompt)}
                        disabled={isLoading || !authStatus.authenticated}
                    />
                    <Button 
                        onClick={() => handleSubmit(prompt)}
                        disabled={isLoading || !prompt.trim() || !authStatus.authenticated}
                    >
                        {isLoading 
                            ? "Sending..." 
                            : "Send"
                        }
                    </Button>
                </div>
            </div>
        </div>
    );
}