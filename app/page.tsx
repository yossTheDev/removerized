import { Suspense } from "react"
import Image from "next/image"

import { Editor } from "@/components/editor"
import { Icons } from "@/components/icons"

export default async function IndexPage() {
  return (
    <section className="container flex h-full  flex-col gap-2 pb-8 md:flex-row">
      {/* Hero */}
      <div className="group flex flex-col items-center justify-center md:w-2/4">
        <div className="mt-14 flex flex-col items-center justify-center md:mt-0 md:w-96">
          <a
            className="mb-4 w-fit p-0 md:self-start"
            href="https://www.producthunt.com/posts/removerized?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-removerized"
            target="_blank"
          >
            <Image
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=454170&theme=dark"
              alt="removerized - Free&#0032;AI&#0045;Powered&#0032;Background&#0032;Remover&#0032;Tool | Product Hunt"
              style={{ width: "170px", height: "34px" }}
              width="170"
              height="34"
            />
          </a>

          <h1 className="animate-fade-in-up text-center text-4xl font-bold md:text-start md:text-6xl lg:text-7xl">
            <span>Free Background Remover Tool with</span>
            <br></br>
            <span>AI</span>
            <span className="inline-block">
              <Icons.SolarStarsBoldDuotone className="flex group-hover:animate-tada"></Icons.SolarStarsBoldDuotone>
            </span>
          </h1>
        </div>
      </div>

      {/* Content */}
      <Suspense
        fallback={
          <div className="flex w-2/4 flex-col items-center justify-center">
            <p>Loading...</p>
          </div>
        }
      >
        <Editor></Editor>
      </Suspense>
    </section>
  )
}
