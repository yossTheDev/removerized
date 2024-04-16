"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

type SpinningNumberProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  value: number
  animationDuration?: number
}

export const SpinningNumber = ({
  value,
  animationDuration = 500,
  className,
  ...props
}: SpinningNumberProps) => {
  const ref = useRef<HTMLDivElement>(null)

  const [splitted, setSplitted] = useState(value.toString().split(""))
  const [lineHeight, setLineHeight] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (element) {
      const tempElement = document.createElement("span")
      tempElement.style.fontSize = window.getComputedStyle(element).fontSize
      tempElement.style.fontFamily = window.getComputedStyle(element).fontFamily
      tempElement.style.lineHeight = window.getComputedStyle(element).lineHeight
      tempElement.innerHTML = "dummy"
      element.appendChild(tempElement)
      setLineHeight(tempElement.offsetHeight)
      element.removeChild(tempElement)
    }
  }, [lineHeight])

  useEffect(() => {
    setSplitted(value.toString().split(""))
  }, [value])

  return (
    <div className={className} {...props}>
      <div className="flex items-center justify-center">
        <div
          ref={ref}
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            width: splitted.length * lineHeight - 15,
            height: lineHeight,
          }}
        >
          {splitted.map((num, i) => (
            <SingleNumber
              key={i}
              index={i}
              number={+num}
              lineHeight={lineHeight}
              animationDuration={animationDuration}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

type SingleNumberProps = {
  number: number
  index: number
  lineHeight: number
  animationDuration: number
}

export const SingleNumber = ({
  number,
  index,
  lineHeight,
  animationDuration,
}: SingleNumberProps) => {
  const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const [y, setY] = useState(-1 * nums.indexOf(number) * lineHeight)

  useEffect(() => {
    setY(-1 * nums.indexOf(number) * lineHeight)
  }, [number, lineHeight])

  return (
    <motion.div
      data-testid="single-number"
      className="absolute flex select-none flex-col"
      style={{ left: index * lineHeight }}
      animate={{ top: y }}
      transition={{ ease: "backInOut", duration: animationDuration / 1000 }}
    >
      {nums.map((digit) => (
        <span data-testid="single-rotation-number" key={digit}>
          {digit}
        </span>
      ))}
    </motion.div>
  )
}
