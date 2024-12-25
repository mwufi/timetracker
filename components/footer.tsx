import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="fixed bottom-0 right-0 p-4">
      <Link 
        href="/privacy" 
        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
      >
        Privacy <ArrowUpRight className="h-3 w-3" />
      </Link>
    </footer>
  )
}
