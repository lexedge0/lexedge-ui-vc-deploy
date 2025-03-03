"use client"

import { ChatbotUISVG } from "@/components/icons/chatbotui-svg"
import { IconArrowRight } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"

export default function HomePage() {
  const { theme } = useTheme()

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div>
        <ChatbotUISVG theme={theme === "dark" ? "light" : "dark"} scale={0.3} />
      </div>

      <div className="px-2 text-3xl font-semibold tracking-wider">LEXEDGE</div>

      <Link
        className="mt-4 flex w-[200px] items-center justify-center rounded-md bg-blue-700 p-2 font-semibold text-white"
        href="/login"
      >
        Get Started
        <IconArrowRight className="ml-1" size={20} />
      </Link>
    </div>
  )
}
