"use client"

import { DateTime } from "luxon"

import { SpinningNumber } from "../ui/spinning-number"
import WaveProgressbar from "../ui/wave-progressbar"
import { Countdown } from "./countdown"

export const CounterSection = () => {
  const now = DateTime.now()

  const startOfYear = DateTime.local().set({ month: 0, day: 1 })
  const endOfYear = DateTime.local().set({ month: 12, day: 31 })
  const timeLeft = endOfYear.diff(now, ["days", "hours", "minutes", "seconds"])

  const totalDays = endOfYear.diff(startOfYear).as("days")
  const daysPassed = now.diff(startOfYear).as("days")
  const percentageCompleted = (daysPassed / totalDays) * 100

  return (
    <>
      {/* Counters */}
      <div
        id="seconds"
        className="flex h-screen flex-col items-center justify-center gap-4"
      >
        <p className="text-3xl font-bold">Seconds</p>
        <Countdown type="seconds" value={timeLeft.as("seconds")}></Countdown>
      </div>

      <div
        id="minutes"
        className="flex h-screen flex-col items-center justify-center gap-4"
      >
        <p id="minutes" className="text-3xl font-bold">
          Minutes
        </p>
        <Countdown type="minutes" value={timeLeft.as("minutes")}></Countdown>
      </div>

      <div
        id="hours"
        className="flex h-screen flex-col items-center justify-center gap-4"
      >
        <p className="text-3xl font-bold">Hours</p>
        <Countdown value={timeLeft.as("hours")}></Countdown>
      </div>

      <div
        id="days"
        className="flex h-screen flex-col items-center justify-center gap-4"
      >
        <p className="text-3xl font-bold">Days</p>
        <Countdown value={timeLeft.as("days")}></Countdown>
      </div>
    </>
  )
}
