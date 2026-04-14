import Link from "next/link"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"

export default function BlogPage() {
  const posts = [
    {
      title: "Bienvenid@ al blog de Removerized",
      slug: "first-post",
      date: "2024-05-20",
      description: "Conoce más sobre nuestra suite de herramientas de IA local.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white">
      <LandingHeader />
      <main className="flex-1 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-10 text-4xl font-bold font-museo">Blog</h1>
          <div className="grid gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10"
              >
                <p className="mb-2 text-sm text-white/40">{post.date}</p>
                <h2 className="mb-2 text-2xl font-semibold group-hover:text-blue-400">
                  {post.title}
                </h2>
                <p className="text-white/60">{post.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
