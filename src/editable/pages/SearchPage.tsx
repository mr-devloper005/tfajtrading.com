import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Search, Sparkles } from 'lucide-react'
import { Ads } from '@/lib/ads'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const summaryOf = (post: SitePost) => post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'
  const strong = index % 5 === 0

  return (
    <Link href={href} className={`group block overflow-hidden rounded-[1.8rem] border border-[var(--editable-border)] bg-white shadow-[0_18px_42px_rgba(34,26,15,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(34,26,15,0.12)] ${strong ? 'md:col-span-2' : ''}`}>
      {image ? (
        <div className={`relative overflow-hidden bg-black ${strong ? 'aspect-[16/7]' : 'aspect-[16/10]'}`}>
          <img src={image} alt="" className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-page-text)]">{taskLabel}</span>
        </div>
      ) : null}
      <div className="p-5 sm:p-6">
        {!image ? <span className="rounded-full bg-[var(--slot4-dark-bg)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">{taskLabel}</span> : null}
        <h2 className="editable-display mt-4 line-clamp-3 text-2xl font-bold leading-[0.98] tracking-[-0.05em] text-[var(--slot4-page-text)]">{post.title}</h2>
        {summary ? <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{summary}</p> : null}
        <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">Open result <ArrowRight className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="editable-tech-grid relative overflow-hidden">
          <div className="absolute left-0 right-0 top-0 h-[300px] bg-[var(--slot4-dark-bg)]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="pt-4 text-white">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em]">
                  <Sparkles className="h-4 w-4 text-[var(--slot4-accent-soft)]" />
                  {pagesContent.search.hero.badge}
                </div>
                <h1 className="editable-display mt-6 text-4xl font-bold leading-[0.94] tracking-[-0.06em] sm:text-5xl lg:text-[4.2rem]">{pagesContent.search.hero.title}</h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-white/74">{pagesContent.search.hero.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-semibold text-white/84">Articles</span>
                  <span className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-semibold text-white/84">Profiles</span>
                  <span className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-semibold text-white/84">Business listings</span>
                </div>
              </div>

              <form action="/search" className="editable-search-shell self-end overflow-hidden rounded-[2rem] border-[6px] border-[#c8c0b4] bg-white p-4 sm:p-5">
                <input type="hidden" name="master" value="1" />
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
                  <label className="flex items-center gap-3 rounded-2xl border border-[var(--editable-border)] bg-white px-4 py-3">
                    <Search className="h-5 w-5 text-[var(--slot4-accent)]" />
                    <input name="q" defaultValue={query} placeholder={pagesContent.search.hero.placeholder} className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-[var(--slot4-muted-text)]" />
                  </label>
                  <select name="task" defaultValue={task} className="rounded-2xl border border-[var(--editable-border)] bg-white px-4 py-3 text-sm font-semibold outline-none">
                    <option value="">All content types</option>
                    {enabledTasks.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                  </select>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                  <label className="flex items-center gap-2 rounded-2xl border border-[var(--editable-border)] bg-white px-4 py-3">
                    <MapPin className="h-4 w-4 text-[var(--slot4-accent)]" />
                    <input name="category" defaultValue={category} placeholder="Category or topic" className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[var(--slot4-muted-text)]" />
                  </label>
                  <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--slot4-accent)] px-6 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:brightness-95" type="submit">Search</button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{results.length} results</p>
              <h2 className="editable-display mt-2 text-3xl font-bold tracking-[-0.05em]">{query ? `Results for "${query}"` : pagesContent.search.resultsTitle}</h2>
            </div>
            <Link href="/article" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-5 py-3 text-sm font-bold shadow-[0_12px_30px_rgba(34,26,15,0.06)]">Browse latest <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="mx-auto max-w-6xl px-4 py-6">
            <Ads slot="in-feed" showLabel eager className="mx-auto w-full" />
          </div>

          {results.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => <SearchResultCard key={post.id || post.slug} post={post} index={index} />)}
            </div>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-[var(--editable-border)] bg-white/70 p-10 text-center shadow-[0_18px_42px_rgba(34,26,15,0.05)]">
              <p className="editable-display text-2xl font-bold tracking-[-0.04em]">No matching posts found.</p>
              <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">Try a different keyword, task type, or category.</p>
            </div>
          )}
        </section>
      </main>
    </EditableSiteShell>
  )
}
