import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"

import { MenuWithButton } from "./menu-button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="container flex h-16 items-center space-x-4 bg-background/80 p-4 backdrop-blur-2xl sm:justify-between sm:space-x-0 md:p-8">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="hidden items-center space-x-1 md:flex">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={buttonVariants({
                  size: "icon",
                  variant: "ghost",
                })}
              >
                <Icons.gitHub className="size-5" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
            <Link
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={buttonVariants({
                  size: "icon",
                  variant: "ghost",
                })}
              >
                <Icons.X className="size-5 fill-current" />
                <span className="sr-only">X</span>
              </div>
            </Link>
            <Link
              href={siteConfig.links.telegram}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={buttonVariants({
                  size: "icon",
                  variant: "ghost",
                })}
              >
                <Icons.Telegram className="size-5 fill-current" />
                <span className="sr-only">Telegram</span>
              </div>
            </Link>

            <ThemeToggle />
          </nav>

          <MenuWithButton items={siteConfig.mainNav}></MenuWithButton>
        </div>
      </div>
    </header>
  )
}
