"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import ShiftCanvas from "@/components/ShiftCanvas";
import { useEffect } from "react";

//Home page
export default function Home() {

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);


  return (

    <div id="app-container">

        <div className="relative flex min-h-screen flex-col" id="welcome">
          {/* Canvas background */}
          <ShiftCanvas />
          
          {/* Front page content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4">
            <h1 className="text-4xl font-bold text-white">Welcome to [TITLE]</h1>
            <p className="text-stone-200">Your Online Performance Coach</p>
            <Button asChild>
              <Link href="/chat">Go to Chat</Link>
            </Button>
          </div>
          
          {/* Down Arrow */}
          <div className="relative z-10 pb-25">
            <div className="flex w-screen items-center justify-center">
              <Button
                onClick={() => {
                  const targetElement = document.getElementById("info")
                  var topPos = targetElement?.offsetTop;
                  window.scrollTo({top: topPos, behavior: "smooth"})
                }}

              > 
                <Image 
                  src="/icons8-down-arrow-100.png"
                  alt="Scroll Down"
                  width={50}
                  height={50}
                  className="animate-pulse"
                />      
              </Button>
            </div>
          </div>
        </div>

  {/* Info section */}
  <div className="relative min-h-screen bg-gradient-to-t from-[#90D5FF] to-[#DB73FF] p-8" id="info">

    <div className="flex justify-center pt-15 pb-15">
      <Button
        onClick={() => {
          const targetElement = document.getElementById("welcome")
          var topPos = targetElement?.offsetTop;
          window.scrollTo({top: topPos, behavior: "smooth"})
        }}

      > 
        <Image 
          src="/icons8-collapse-arrow-100.png"
          alt="Scroll Up"
          width={50}
          height={50}
          className="animate-pulse"
        />      
      </Button>
      </div>


      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-center text-4xl text-white font-bold">Features</h2>
        
        {/* Features Boxes */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Box 1 */}
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="mb-3 text-xl font-bold text-white">Read WHOOP Data</h3>
            <div className="mb-3 h-0.5 bg-gradient-to-r from-purple-400 to-transparent" />
            <p className="text-stone-100">Sync your WHOOP device to provide our AI Agent with real-time recovery, sleep, workout, and strain data, enabling personalized feedback</p>
          </div>

          {/* Box 2 */}
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="mb-3 text-xl font-bold text-white">Support Mental & Physical Health</h3>
            <div className="mb-3 h-0.5 bg-gradient-to-r from-blue-400 to-transparent" />
            <p className="text-stone-100">Receive AI-guided insights to optimize sleep, recovery, and training, helping athletes stay balanced and perform at their best.
            </p>
          </div>

          {/* Box 3 */}
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="mb-3 text-xl font-bold text-white">Personalized Coaching Feedback</h3>
            <div className="mb-3 h-0.5 bg-gradient-to-r from-teal-400 to-transparent" />
            <p className="text-stone-100">Get tailored suggestions based on your WHOOP metrics and chat history, allowing for smarter training, recovery, and mental wellness strategies.
            </p>
          </div>
        </div>
      </div>

        {/* About Box */}
        <div className="mx-auto mt-12 max-w-6xl rounded-lg bg-white/10 pt-5 pr-10 pl-10 backdrop-blur-sm">
        <h3 className="mb-3 text-xl font-bold text-white">About</h3>
            <div className="mb-3 h-0.5 bg-gradient-to-r from-green-300 to-transparent" />
            <p className="text-stone-100">
              This project was built in 24 hours for the Williams College's HackWilliams Hackathon. It uses React, Tailwind, and TypeScript to run the Frontend and Backend.
              It connects to the WHOOP API using secure user credentials, and combines biometric data with user chats (as well as a custom prompt + context window)
              to generate responses from OpenAI's ChatGPT 4o-mini API.
            </p>
            <p className="text-stone-100 pt-3">
              The goal of this project was to create a human-feeling agent who could provide support to real athletes, helping them explore and understand their biometrics and 
              how they can affect physical and mental health. The agent can suggest lifestyle changes to improve conditions, offer guidance, and act 
              as a mentor to athletes looking to improve their performance and well-being.
            </p>
            <div className="flex justify-center gap-3 pt-5 pb-3">
              <Link href="https://github.com/ccote46/HackWilliams" className="transition-opacity hover:opacity-70">
                <Image 
                  src="/githublogo.svg"
                  alt="Github Repo Link"
                  width={25}
                  height={25}
                />
              </Link>
              <Link href="https://www.linkedin.com/in/charlotte-cote-4a7224378/" className="mt-1 transition-opacity hover:opacity-70">
                <Image
                  src="/InBug-White copy.png"
                  alt="Linkedin"
                  width={20}
                  height={20}
                />
              </Link>
            </div>
        </div>

    </div>

    </div>
  );
}