import { Suspense } from "react"

import { Editor } from "@/components/editor"
import { Icons } from "@/components/icons"

export default async function IndexPage() {
  return (
    <section className="container flex h-full gap-2 pb-8">
      {/* Hero */}
      <div className="flex w-2/4 flex-col items-center justify-center">
        <h1 className="max-w-80 text-7xl font-bold">
          <span>Free Background Remover Tool with AI</span>
          <span className="inline-block">
            <Icons.SolarStarsBoldDuotone className="flex"></Icons.SolarStarsBoldDuotone>
          </span>
        </h1>
      </div>

      {/* Content */}
      <Suspense
        fallback={
          <>
            <div className="flex w-2/4 flex-col items-center justify-center">
              <p>Loading...</p>
            </div>
          </>
        }
      >
        <Editor></Editor>
      </Suspense>
    </section>
  )
}
