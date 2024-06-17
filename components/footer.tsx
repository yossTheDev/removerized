export const Footer = () => {
  return (
    <span className="border-t p-4 text-center text-xs text-muted-foreground md:mx-0 md:p-6 md:text-start">
      Built by{" "}
      <a
        className="text-foreground hover:underline"
        target="_blank"
        href="https://yossthedev.github.io"
      >
        @yossthedev
      </a>
      . The source code is available on{" "}
      <a
        className="text-foreground hover:underline"
        target="_blank"
        href="https://github.com/yossTheDev/removerized"
      >
        GitHub
      </a>
    </span>
  )
}
