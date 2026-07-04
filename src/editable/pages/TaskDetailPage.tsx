import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, Star, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { Ads } from '@/lib/ads'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const single = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...single].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const linkifyMarkdown = (value: string) =>
  value.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) =>
  linkifyMarkdown(value).replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const leadText = (post: SitePost) => {
  const lead = stripHtml(summaryText(post))
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
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

const detailAdSlot: Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'> = {
  article: 'article-bottom',
  listing: 'sidebar',
  classified: 'footer',
  image: 'in-feed',
  sbm: 'header',
  pdf: 'sidebar',
  profile: 'header',
}

function postHref(task: TaskKey, post: SitePost) {
  return post.slug ? `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}` : (getTaskConfig(task)?.route || `/${task}`)
}

export function TaskDetailView({
  task,
  post,
  related,
  comments = [],
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  const images = getImages(post)
  const heroImage = images[0] || '/placeholder.svg?height=900&width=1400'
  const gallery = images.slice(1)
  const price = getField(post, ['price', 'amount', 'budget'])
  const role = getField(post, ['role', 'designation', 'company'])
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url', 'link'])
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <BackLink task={task} />

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <article className="min-w-0 overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_22px_60px_rgba(30,24,16,0.08)]">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.76))]" />
                <div className="absolute left-5 top-5 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-on-accent)]">
                  {categoryOf(post, task)}
                </div>
                {price ? (
                  <div className="absolute bottom-5 left-5 rounded-full bg-[var(--slot4-accent-fill)] px-4 py-2 text-sm font-bold text-white">
                    {price}
                  </div>
                ) : null}
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--tk-accent)]">{SITE_CONFIG.name}</p>
                <h1 className="editable-display mt-3 text-4xl font-bold leading-[0.96] tracking-[-0.05em] sm:text-5xl">{post.title}</h1>
                {role ? <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
                <DetailMeta post={post} category={categoryOf(post, task)} />
                {leadText(post) ? <p className="mt-5 text-base leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}

                <InfoGrid items={[['Location', location, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />

                <div
                  className="article-content mt-8 max-w-none text-[1rem] leading-8 text-[var(--tk-text)]"
                  dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
                />

                {gallery.length ? (
                  <div className="mt-10 grid gap-3 sm:grid-cols-2">
                    {gallery.slice(0, 4).map((image, index) => (
                      <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[1.2rem] border border-[var(--tk-line)] object-cover" />
                    ))}
                  </div>
                ) : null}

                <div className="mx-auto max-w-6xl px-4 py-6">
                  <Ads slot={detailAdSlot[task]} showLabel eager className="mx-auto w-full" />
                </div>

                {task === 'article' ? <EditableArticleComments slug={post.slug} comments={comments} /> : null}
              </div>
            </article>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[2rem] bg-[var(--slot4-dark-bg)] p-6 text-white shadow-[0_24px_60px_rgba(23,18,10,0.18)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--slot4-accent-soft)]">Quick actions</p>
                <div className="mt-5 grid gap-3">
                  {website ? (
                    <Link href={safeUrl(website)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-bold text-[var(--tk-on-accent)] transition hover:brightness-95">
                      Visit website <ExternalLink className="h-4 w-4" />
                    </Link>
                  ) : null}
                  {phone ? (
                    <a href={`tel:${phone}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                      <Phone className="h-4 w-4" /> Call now
                    </a>
                  ) : null}
                  {email ? (
                    <a href={`mailto:${email}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                      <Mail className="h-4 w-4" /> Send email
                    </a>
                  ) : null}
                  {task === 'pdf' && fileUrl ? (
                    <Link href={safeUrl(fileUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                      <Download className="h-4 w-4" /> Download file
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_18px_42px_rgba(34,26,15,0.06)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--tk-accent)]">About this post</p>
                <div className="mt-4 grid gap-3 text-sm text-[var(--tk-muted)]">
                  <span className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {categoryOf(post, task)}</span>
                  <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-[var(--tk-accent)]" /> {getTaskConfig(task)?.label || task}</span>
                  {location ? <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {location}</span> : null}
                </div>
              </div>

              {task === 'pdf' && fileUrl ? (
                <div className="overflow-hidden rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_18px_42px_rgba(34,26,15,0.06)]">
                  <div className="border-b border-[var(--tk-line)] px-5 py-4">
                    <p className="text-sm font-bold">Document preview</p>
                  </div>
                  <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[420px] w-full bg-[var(--tk-raised)]" />
                </div>
              ) : null}

              {related.length ? <RelatedPanel task={task} related={related} /> : null}
            </aside>
          </div>
        </section>

        {related.length ? (
          <section className="border-t border-[var(--tk-line)]">
            <div className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="editable-display text-3xl font-bold tracking-[-0.04em]">More to explore</h2>
                <Link href={getTaskConfig(task)?.route || '/'} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-accent)]">
                  View all <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {related.map((item) => (
                  <RelatedCard key={item.id || item.slug} task={task} post={item} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </EditableSiteShell>
  )
}

function DetailMeta({ post, category }: { post: SitePost; category?: string }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? <span className="text-sm text-[var(--tk-muted)]">{category}</span> : null}
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-7 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[1.2rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--tk-muted)]"><Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</div>
          <p className="mt-2 break-words text-sm font-semibold leading-6 text-[var(--tk-text)]">{value}</p>
        </div>
      ))}
    </div>
  )
}

function RelatedPanel({ task, related }: { task: TaskKey; related: SitePost[] }) {
  return (
    <div className="rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_18px_42px_rgba(34,26,15,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="editable-display text-xl font-bold tracking-[-0.03em]">Related posts</h2>
        <Link href={getTaskConfig(task)?.route || '/'} className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--tk-accent)]">View all</Link>
      </div>
      <div className="mt-4 grid gap-3">
        {related.map((item) => (
          <RelatedCard key={item.id || item.slug} task={task} post={item} compact />
        ))}
      </div>
    </div>
  )
}

function RelatedCard({ task, post, compact = false }: { task: TaskKey; post: SitePost; compact?: boolean }) {
  const image = getImages(post)[0]
  const href = postHref(task, post)
  if (compact) {
    return (
      <Link href={href} className="group flex gap-3 rounded-[1.1rem] border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
        {image ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--tk-raised)]"><UserRound className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug">{post.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_18px_42px_rgba(34,26,15,0.06)] transition duration-300 hover:-translate-y-1">
      <div className="aspect-[4/3] overflow-hidden bg-[var(--tk-raised)]">
        {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
