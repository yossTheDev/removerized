/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react"

export default function AdBanner(): JSX.Element {
  const banner = useRef<any>()

  const atOptions = {
    key: "ad8e08e8947b794a1a802eaab7d7cbf7",
    format: "iframe",
    height: 600,
    width: 160,
    params: {},
  }
  useEffect(() => {
    if (banner.current && !banner.current.firstChild) {
      const conf = document.createElement("script")
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.src = `//www.highperformancedformats.com/${atOptions.key}/invoke.js`
      conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`

      banner.current.append(conf)
      banner.current.append(script)
    }
  }, [banner])

  return (
    <div
      className="mx-2 my-5 items-center justify-center border border-gray-200 text-center text-white"
      ref={banner}
    ></div>
  )
}
