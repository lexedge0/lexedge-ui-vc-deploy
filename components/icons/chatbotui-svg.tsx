import { FC } from "react"

interface ChatbotUISVGProps {
  theme: "dark" | "light"
  scale?: number
}

export const ChatbotUISVG: FC<ChatbotUISVGProps> = ({ theme, scale = 1 }) => {
  return (
    <svg
      width={141 * scale}
      height={132 * scale}
      viewBox="0 0 141 132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M90.2339 45.584H44.6418C25.6804 45.584 10.3114 61.3423 10.3114 80.784C10.3114 100.226 25.6804 115.984 44.6418 115.984H90.2339"
        stroke={`${theme === "dark" ? "#fff" : "#000"}`}
        stroke-width={21}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M42.1406 82.6948L92.729 82.6948C111.69 82.6948 127.059 66.9365 127.059 47.4948C127.059 28.0531 111.69 12.2948 92.729 12.2948L47.1369 12.2948"
        stroke={`${theme === "dark" ? "#fff" : "#000"}`}
        stroke-width={21}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
