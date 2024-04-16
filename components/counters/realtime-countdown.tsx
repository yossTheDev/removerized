"use client"

import { useEffect, useState } from "react"

export const RealtimeCountdown = () => {
  const [timeLeft, setTimeleft] = useState(getTimeLeft())

  function getTimeLeft() {
    const now = new Date()
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1) // End of this year

    const difference = endOfYear.getTime() - now.getTime()

    const seconds = Math.floor(difference / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)

    const timeLeft = {
      months: months,
      days: days % 30,
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60,
    }

    return timeLeft
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeleft(getTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  return (
    <h2 className="text-center text-neutral-800 dark:text-neutral-400">{`${timeLeft.months} months, ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`}</h2>
  )
}
