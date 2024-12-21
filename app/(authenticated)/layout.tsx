'use client'

import { NavBar } from "@/components/nav-bar"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavBar />
      <main>
        {children}
      </main>
    </>
  )
}
