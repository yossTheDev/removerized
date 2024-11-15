import { Suspense } from "react"

import { Editor } from "@/components/editor"

export default async function IndexPage() {
  return (
    <section className="grid-pattern flex h-full">
      {/* Content */}
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center">
            <p>Loading...</p>
          </div>
        }
      >
        <Editor></Editor>
      </Suspense>
    </section>
  )
}
