import { FC } from "react"

interface OpenAISVGProps {
  height?: number
  width?: number
  className?: string
}

export const UserProfileSVG: FC<OpenAISVGProps> = ({
  height = 40,
  width = 40,
  className
}) => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 0C77.6142 0 100 22.3858 100 50C100 77.6142 77.6142 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0Z"
        fill="#3478f6"
      />
    </svg>
  )
}
