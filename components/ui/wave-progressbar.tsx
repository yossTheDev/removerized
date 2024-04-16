"use client"

import { useState } from "react"
import { motion } from "framer-motion"

type Props = {
  value: number
}

const WaveProgressbar: React.FC<Props> = ({ value }) => {
  const [val] = useState(300 - value * 3)

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="relative flex h-72 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-neutral-200  hover:shadow-xl dark:bg-neutral-900">
        <motion.div
          animate={{ rotateZ: 360 }}
          style={{ backgroundColor: "#FF00FF", bottom: -val + "px" }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
          className="absolute  aspect-square w-72 rounded-[35%]"
        />
      </div>
    </div>
  )
}

export default WaveProgressbar
