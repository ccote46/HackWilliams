import { Button } from "@/components/ui/button";
import Link from "next/link";

//Home page
export default function Home() {
  return (
  <div className="h-screen w-screen flex items-center justify-center">
    <h1>Welcome to website</h1>
    <Button asChild>
        <Link href="/chat">Go to Chat</Link>
      </Button>  </div>
  );
}
