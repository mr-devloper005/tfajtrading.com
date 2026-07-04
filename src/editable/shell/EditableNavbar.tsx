'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, Menu, Plus, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const navItems = useMemo(() => [{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }], [])

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--slot4-page-bg)]/96 backdrop-blur-xl">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--slot4-surface-bg)] shadow-[0_10px_24px_rgba(24,18,8,0.08)]">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
            </span>
            <span className="min-w-0">
              <span className="editable-display block truncate text-[1.9rem] font-bold leading-none text-[var(--slot4-page-text)]">
                {SITE_CONFIG.name}
              </span>
              <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
                {globalContent.nav?.tagline || SITE_CONFIG.tagline}
              </span>
            </span>
          </Link>

          <div className="ml-auto hidden items-center gap-2 xl:flex">
            {navItems.filter((item) => item.href !== '/').map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-[var(--editable-border)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
              >
                {item.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--editable-cta-bg)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--editable-cta-text)] transition hover:-translate-y-0.5 hover:brightness-95"
                >
                  <Plus className="h-4 w-4" /> Submit ad
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-[var(--editable-border)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
                >
                  <LogIn className="h-4 w-4" /> Login
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-dark-bg)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  <UserPlus className="h-4 w-4" /> Get registered
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="ml-auto rounded-2xl bg-[var(--slot4-dark-bg)] p-3 text-white xl:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="bg-[var(--editable-nav-bg)] text-[var(--editable-nav-text)]">
        <nav className="mx-auto flex max-w-[var(--editable-container)] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] transition ${
                    active
                      ? 'bg-[var(--slot4-accent)] text-white'
                      : 'text-white/85 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          <form action="/search" className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 md:flex lg:w-[280px]">
            <Search className="h-4 w-4 shrink-0 text-[var(--slot4-accent-soft)]" />
            <input
              name="q"
              type="search"
              placeholder="Search the marketplace"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/60"
            />
          </form>
        </nav>

        {open ? (
          <div className="border-t border-white/10 px-4 pb-5 pt-4 xl:hidden">
            <form action="/search" className="mb-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-3">
              <Search className="h-4 w-4 text-[var(--slot4-accent-soft)]" />
              <input
                name="q"
                type="search"
                placeholder="Search the marketplace"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/60"
              />
            </form>
            <div className="grid gap-2">
              {[...navItems, ...(session ? [{ label: 'Create', href: '/create' }] : [{ label: 'Login', href: '/login' }, { label: 'Sign up', href: '/signup' }])].map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] ${
                      active ? 'bg-[var(--slot4-accent)] text-white' : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
              {session ? (
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                  className="rounded-2xl bg-white/5 px-4 py-3 text-left text-sm font-bold uppercase tracking-[0.1em] text-white/80 hover:bg-white/10 hover:text-white"
                >
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
