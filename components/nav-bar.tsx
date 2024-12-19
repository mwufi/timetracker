import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mb-8">
      <Link
        href="/"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === '/' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        Home
      </Link>
      <Link
        href="/add"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === '/add' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        Add New
      </Link>
      <Link
        href="/stats"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === '/stats' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        Stats
      </Link>
    </nav>
  )
}
