/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react"

export default function AdBanner(): JSX.Element {
  const banner = useRef<any>()

  const atOptions = {
    key: "05d8663b5edad2268070cc65dfb55827",
    format: "iframe",
    height: 300,
    width: 350,
    params: {},
  }
  useEffect(() => {
    if (banner.current && !banner.current.firstChild) {
      const conf = document.createElement("script")
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.src = `//www.highperformanceformat.com/${atOptions.key}/invoke.js`
      conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`

      banner.current.append(conf)
      banner.current.append(script)
    }
  }, [banner])

  return (
    <div className="flex flex-col gap-2">
      <div className="mt-4 flex items-center gap-2 px-4 text-neutral-400">
        <svg
          className="order-first size-4"
          xmlns="http://www.w3.org/2000/svg"
          width="128"
          height="128"
          viewBox="0 0 48 48"
        >
          <defs>
            <mask id="IconifyId193357e46a3beefd1">
              <g fill="none">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="#fff"
                  stroke="#fff"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="4"
                />
                <path
                  stroke="#fff"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="4"
                  d="m38 38l-3-3M10 10l3 3"
                />
                <path fill="#fff" d="M21.143 28L18 17l-3.143 11z" />
                <path
                  stroke="#000"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="4"
                  d="m14 31l.857-3M22 31l-.857-3m0 0L18 17l-3.143 11m6.286 0h-6.286"
                />
                <path
                  fill="#fff"
                  stroke="#000"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="4"
                  d="M35 24c0 5-3.582 7-8 7V17c4.418 0 8 2 8 7"
                />
              </g>
            </mask>
          </defs>
          <path
            fill="currentColor"
            d="M0 0h48v48H0z"
            mask="url(#IconifyId193357e46a3beefd1)"
          />
        </svg>

        <span>Ads</span>
      </div>

      <div
        className="mx-auto w-fit items-center justify-center overflow-hidden rounded-2xl border border-neutral-700 object-contain text-center text-white"
        ref={banner}
      ></div>
    </div>
  )
}
