import Link from 'next/link'
import { NavUser } from './nav-user'

export function NavBar() {
  return (
    <nav className="flex items-center justify-between p-6 px-8 mb-8">
      <div className="flex items-center space-x-8">
        <Link
          href="/"
          className="text-xl font-bold hover:text-primary transition-colors"
        >
          Flow
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            href="/stats"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Stats
          </Link>
          <Link
            href="/add"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Add Session
          </Link>
          <Link
            href="/ideas"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Ideas
          </Link>
          <Link
            href="/todos"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Todos
          </Link>
        </div>
      </div>
      <NavUser />
    </nav>
  )
}
