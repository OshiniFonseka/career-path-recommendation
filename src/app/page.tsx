import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#EBF3FF]">
      <div className="text-center space-y-6 p-8 max-w-2xl">
        <h1 className="text-4xl font-bold">
          FindMyCareer
        </h1>
        <p className="text-lg text-gray-600">
          Enter you details and get career recommendations.
        </p>
        <Link href="/form" className="block">
          <Button 
            className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A] hover:cursor-pointer text-white text-lg py-6"
          >
            Click for Recommendations
          </Button>
        </Link>
      </div>
    </main>
  )
}
