'use client'

import Link from 'next/link'
import { ArrowUpRight, PhoneCall } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="mt-16 bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
              </span>
              <span>
                <span className="editable-display block text-2xl font-bold">{SITE_CONFIG.name}</span>
                <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  {globalContent.footer.tagline}
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/72">{globalContent.footer.description || SITE_CONFIG.description}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent-soft)]">Browse</h3>
            <div className="mt-5 grid gap-3">
              {[['Home', '/'], ['Search', '/search'], ['About', '/about'], ['Contact', '/contact']].map(([label, href]) => (
                <Link key={href} href={href} className="inline-flex items-center gap-2 text-sm font-medium text-white/72 transition hover:text-white">
                  {label} <ArrowUpRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent-soft)]">Quick links</h3>
            <div className="mt-5 grid gap-3">
              {[['About', '/about'], ['Contact', '/contact'], ['Search', '/search'], ...(session ? [['Create', '/create']] : [['Login', '/login'], ['Sign up', '/signup']])].map(([label, href]) => (
                <Link key={href} href={href} className="text-sm font-medium text-white/72 transition hover:text-white">
                  {label}
                </Link>
              ))}
              {session ? (
                <button type="button" onClick={logout} className="text-left text-sm font-medium text-white/72 transition hover:text-white">
                  Logout
                </button>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent-soft)]">Stay connected</p>
            <h3 className="editable-display mt-3 text-2xl font-bold leading-tight">Ready to publish or connect?</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Share an update, promote a service, or make your profile easier to discover.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/create" className="rounded-full bg-[var(--slot4-accent-fill)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:brightness-95">
                Create post
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                <PhoneCall className="h-4 w-4" /> Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs font-medium uppercase tracking-[0.14em] text-white/48">
        Copyright {year} {SITE_CONFIG.name}. {globalContent.footer.bottomNote}
      </div>
    </footer>
  )
}
