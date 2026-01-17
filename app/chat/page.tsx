"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/AuthContext";

interface Message {
    role: "user" | "assistant"
    content: string;

}

export default function Page() {
    const [prompt, setPrompt] = useState("");
    
    const [messages, setMessages] = useState<Message[]>([]);
    
    //(used for thinking graphic)
    const [isLoading, setIsLoading] = useState(false);

    const { authStatus } = useAuth();

    //autojump
    const messagesEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    //no scrolling
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = "auto";
        };
      }, []);
   

    /* call & resp from chat  */
    async function handleSubmit(prompt: string) {
        if (!prompt.trim()) return;

        const userMessage: Message = {role: "user", content: prompt}; 

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        setPrompt("");
        setIsLoading(true)

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

            //400s/500s errors
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
        <div className="bg-blue-300" id="background">
            {/* TODO: Bruh how do i make this look good gradient looks so ai ^*/}
            <div className="mx-auto flex h-195 max-w-4xl flex-col bg-stone-100" id="chat-holder">
                {/* Messages area*/}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && !authStatus.authenticated && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-stone-400">
                                <p className="text-lg mb-2"> Connect your Whoop account to chat!</p>
                                <p className="text-sm"> Get personalized coaching based on your performance data</p>
                            </div>
                        </div>
                    )}

                    {/* add msgs */}
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-start" : "justify-end"}`}
                        >
                            <div
                                className={`max-w-[70%] p-4 rounded-lg shadow-lg ${
                                    message.role === "user"
                                        ? "bg-stone-700 text-white"
                                        : "bg-blue-600 text-white"
                                }`}
                            >
                                {message.role === "assistant" && (
                                    <p className="mb-1 text-xs uppercase tracking-wide text-blue-100 opacity-80">
                                    Assistant
                                    </p>
                                )}
                                {message.role === "user" && (
                                    <p className="mb-1 text-xs uppercase tracking-wide text-blue-100 opacity-80">
                                        You
                                    </p>
                                )}
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {/* Thinking indicator */}

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

                    <div ref={messagesEndRef}></div>
                </div>

                {/* User input Box */}
                <div className="border-t border-stone-700 bg-stone-800 p-4">
                    <div className="max-w-4xl mx-auto flex gap-2">
                        <Input 
                            className="flex-1 bg-stone-700 text-white border-stone-600"
                            placeholder={
                                authStatus.authenticated
                                    ? "Ask your sports performance coach..."
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
        </div>
    );
}