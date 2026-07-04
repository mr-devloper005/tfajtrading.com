import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, FileText, Globe, Grid2x2, Image as ImageIcon, LayoutList, MapPin, Phone, Search, Star, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { Ads } from '@/lib/ads'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { buildPostUrl, fetchPaginatedTaskPosts } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)
const placeholder = '/placeholder.svg?height=900&width=1200'

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo) || asText(content.avatar)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.8 + (hashStr(post.slug || post.id || post.title || 'x') % 11) / 10) * 10) / 10
}

const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 8 + (hashStr((post.slug || post.title || 'x') + 'r') % 320)
}

const archiveAdSlot: Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'> = {
  article: 'in-feed',
  listing: 'sidebar',
  classified: 'in-feed',
  image: 'sidebar',
  sbm: 'footer',
  pdf: 'article-bottom',
  profile: 'header',
}

function ratingRow(post: SitePost) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">({reviewsOf(post)})</span>
    </div>
  )
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const featured = posts[0]
  const highlight = posts[1]

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="border-b border-[var(--tk-line)] bg-[var(--tk-bg)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="rounded-[2rem] bg-[var(--slot4-dark-bg)] px-6 py-8 text-white shadow-[0_30px_70px_rgba(24,18,8,0.18)] sm:px-8 sm:py-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent-soft)]">{theme.kicker}</p>
                  <h1 className="editable-display mt-3 max-w-3xl text-4xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-5xl">
                    {voice?.headline || `Browse ${label}`}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-white/74">{voice?.description || theme.note}</p>
                </div>
                <div className="flex gap-2">
                  <span className="rounded-2xl bg-white/10 p-3 text-white/80"><LayoutList className="h-5 w-5" /></span>
                  <span className="rounded-2xl bg-[var(--slot4-accent)] p-3 text-white"><Grid2x2 className="h-5 w-5" /></span>
                </div>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <form action={basePath} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                  <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 text-[var(--slot4-page-text)]">
                    <Search className="h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
                    <input
                      name="q"
                      placeholder={`Search ${label.toLowerCase()}`}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--slot4-muted-text)]"
                    />
                  </div>
                  <div className="relative">
                    <select
                      name="category"
                      defaultValue={category}
                      className="h-full min-h-[48px] w-full appearance-none rounded-full bg-white pl-4 pr-10 text-sm font-semibold text-[var(--slot4-page-text)] outline-none"
                      aria-label={voice?.filterLabel || 'Filter category'}
                    >
                      <option value="all">All categories</option>
                      {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--slot4-muted-text)]" />
                  </div>
                  <button className="rounded-full bg-[var(--slot4-accent)] px-6 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:brightness-95">Apply</button>
                </form>
                <p className="text-sm font-semibold text-white/74">
                  {posts.length} {posts.length === 1 ? 'result' : 'results'} in {categoryLabel}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
          {posts.length ? (
            <>
              {featured ? (
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                  <ArchiveFeatureCard task={task} basePath={basePath} post={featured} />
                  <div className="grid gap-6">
                    {highlight ? <ArchiveHorizontalCard task={task} basePath={basePath} post={highlight} /> : null}
                    <div className="rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 shadow-[0_18px_42px_rgba(34,26,15,0.06)]">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--tk-accent)]">Quick browse</p>
                      <div className="mt-4 grid gap-3">
                        {posts.slice(2, 5).map((post, index) => (
                          <ArchiveCompactRow key={post.id || post.slug} task={task} basePath={basePath} post={post} index={index} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mx-auto max-w-6xl px-4 py-6">
                <Ads slot={archiveAdSlot[task]} showLabel eager className="mx-auto w-full" />
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {posts.slice(1).map((post, index) => (
                  <ArchiveGridCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />
                ))}
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-[1.8rem] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-2xl font-bold tracking-[-0.03em]">Nothing here yet</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Try another category, or check back after new {label.toLowerCase()} are published.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-14 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 font-semibold transition hover:border-[var(--tk-accent)]">Previous</Link> : null}
              <span className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 font-semibold text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 font-semibold transition hover:border-[var(--tk-accent)]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function hrefFor(task: TaskKey, basePath: string, post: SitePost) {
  return post.slug ? `${basePath}/${post.slug}` : buildPostUrl(task, post.slug)
}

function ArchiveFeatureCard({ task, basePath, post }: { task: TaskKey; basePath: string; post: SitePost }) {
  const href = hrefFor(task, basePath, post)
  const price = getField(post, ['price', 'amount', 'budget'])
  return (
    <Link href={href} className="group overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_20px_50px_rgba(29,24,16,0.08)] transition duration-300 hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={getImage(post)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.72))]" />
        <div className="absolute left-4 top-4 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--tk-on-accent)]">
          {getCategory(post, 'Featured')}
        </div>
        {price ? <div className="absolute bottom-4 left-4 rounded-full bg-[var(--slot4-accent-fill)] px-4 py-2 text-sm font-bold text-white">{price}</div> : null}
      </div>
      <div className="p-6 sm:p-7">
        <h2 className="editable-display text-3xl font-bold leading-[1.02] tracking-[-0.04em]">{post.title}</h2>
        {ratingRow(post)}
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post) || 'Browse the full details and see the complete listing.'}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-text)]">Open post <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)]" /></span>
      </div>
    </Link>
  )
}

function ArchiveHorizontalCard({ task, basePath, post }: { task: TaskKey; basePath: string; post: SitePost }) {
  const href = hrefFor(task, basePath, post)
  return (
    <Link href={href} className="group grid gap-4 overflow-hidden rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4 shadow-[0_18px_42px_rgba(34,26,15,0.06)] transition duration-300 hover:-translate-y-1 sm:grid-cols-[190px_minmax(0,1fr)]">
      <img src={getImage(post)} alt="" className="aspect-[4/3] h-full w-full rounded-[1.2rem] object-cover" />
      <div className="min-w-0 self-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--tk-accent)]">{getCategory(post, 'Spotlight')}</p>
        <h3 className="mt-2 line-clamp-2 text-2xl font-bold leading-tight tracking-[-0.04em]">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post) || 'Open this item to see all details.'}</p>
      </div>
    </Link>
  )
}

function ArchiveCompactRow({ task, basePath, post, index }: { task: TaskKey; basePath: string; post: SitePost; index: number }) {
  const href = hrefFor(task, basePath, post)
  const location = getField(post, ['location', 'address', 'city'])
  return (
    <Link href={href} className="group flex items-start gap-4 rounded-[1.25rem] bg-[var(--tk-raised)] px-4 py-4 transition hover:bg-[var(--tk-accent-soft)]/25">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--slot4-dark-bg)] text-sm font-bold text-white">
        {index + 1}
      </span>
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug">{post.title}</h3>
        <p className="mt-1 text-sm text-[var(--tk-muted)]">{location || getCategory(post, 'Browse')}</p>
      </div>
    </Link>
  )
}

function ArchiveGridCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = hrefFor(task, basePath, post)
  const kind = index % 4
  if (kind === 0) return <ImageFirstCard post={post} href={href} task={task} />
  if (kind === 1) return <InfoCard post={post} href={href} task={task} />
  if (kind === 2) return <ProfileLikeCard post={post} href={href} task={task} />
  return <PriceCard post={post} href={href} task={task} />
}

function ImageFirstCard({ post, href, task }: { post: SitePost; href: string; task: TaskKey }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_18px_42px_rgba(34,26,15,0.06)] transition duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={getImage(post)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--tk-text)]">{getCategory(post, task)}</div>
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-xl font-bold leading-tight">{post.title}</h3>
        {ratingRow(post)}
        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post) || 'Open this post for more details.'}</p>
      </div>
    </Link>
  )
}

function InfoCard({ post, href, task }: { post: SitePost; href: string; task: TaskKey }) {
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className="group rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_18px_42px_rgba(34,26,15,0.06)] transition duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, task)}</span>
        {task === 'profile' ? <UserRound className="h-5 w-5 text-[var(--tk-accent)]" /> : <BriefcaseBusiness className="h-5 w-5 text-[var(--tk-accent)]" />}
      </div>
      <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-tight">{post.title}</h3>
      {ratingRow(post)}
      <div className="mt-4 grid gap-2 text-sm text-[var(--tk-muted)]">
        {location ? <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {location}</span> : null}
        {phone ? <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-[var(--tk-accent)]" /> {phone}</span> : null}
        {website ? <span className="inline-flex items-center gap-2"><Globe className="h-4 w-4 text-[var(--tk-accent)]" /> Website available</span> : null}
      </div>
    </Link>
  )
}

function ProfileLikeCard({ post, href, task }: { post: SitePost; href: string; task: TaskKey }) {
  const avatar = getImage(post)
  const role = getField(post, ['role', 'designation', 'company', 'location']) || getCategory(post, task)
  return (
    <Link href={href} className="group flex flex-col items-center rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 text-center shadow-[0_18px_42px_rgba(34,26,15,0.06)] transition duration-300 hover:-translate-y-1">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--tk-raised)]">
        {avatar && avatar !== placeholder ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <h3 className="mt-5 line-clamp-2 text-xl font-bold leading-tight">{post.title}</h3>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p>
      {ratingRow(post)}
      <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post) || 'Visit the full profile to see the complete overview.'}</p>
    </Link>
  )
}

function PriceCard({ post, href, task }: { post: SitePost; href: string; task: TaskKey }) {
  const price = getField(post, ['price', 'amount', 'budget']) || 'Open offer'
  const typeIcon = task === 'image' ? <ImageIcon className="h-5 w-5 text-[var(--tk-accent)]" /> : <FileText className="h-5 w-5 text-[var(--tk-accent)]" />
  return (
    <Link href={href} className="group rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_18px_42px_rgba(34,26,15,0.06)] transition duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-bold tracking-[-0.04em] text-[var(--tk-accent)]">{price}</span>
        {typeIcon}
      </div>
      <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-tight">{post.title}</h3>
      {ratingRow(post)}
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post) || 'Open this post for the full description and contact details.'}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">View details <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)]" /></span>
    </Link>
  )
}
