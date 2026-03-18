import { Suspense } from "react"

import { Editor } from "@/components/editor"

export default async function IndexPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-[#050505]">
          <p className="text-sm text-white/30">Loading…</p>
        </div>
      }
    >
      <Editor />
    </Suspense>
  )
}
