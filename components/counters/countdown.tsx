"use client"

import { useEffect, useState } from "react"

import { SpinningNumber } from "../ui/spinning-number"

type Props = {
  value: number
  type?: "seconds" | "minutes" | "custom"
}

export const Countdown: React.FC<Props> = ({ type = "custom", value }) => {
  const [val, setValue] = useState(value)

  useEffect(() => {
    if (type !== "custom") {
      const interval = setInterval(
        () => {
          setValue(val - 1)
        },
        type === "seconds" ? 1000 : 60000
      )
      return () => {
        clearInterval(interval)
      }
    }
  }, [type, val])

  return (
    <SpinningNumber
      animationDuration={1000}
      value={Math.floor(val)}
      className=" overflow-hidden text-3xl font-bold md:text-7xl items-center justify-center w-fit flex"
    />
  )
}
