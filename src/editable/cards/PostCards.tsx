import Link from 'next/link'
import { ArrowRight, Clock3, MapPin } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

function getEditableLocation(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (
    (typeof content.location === 'string' && content.location) ||
    (typeof content.city === 'string' && content.city) ||
    (typeof content.address === 'string' && content.address) ||
    ''
  )
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

export function EditorialFeatureCard({ post, href, label = 'Featured read' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link href={href} className={`group block min-w-0 overflow-hidden ${dc.surface.dark} ${dc.motion.lift}`}>
      <div className="relative min-h-[420px] p-6 sm:p-8 lg:min-h-[520px]">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,54,66,0.08),rgba(47,54,66,0.9))]" />
        <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-end lg:min-h-[440px]">
          <span className="w-fit rounded-full bg-[var(--slot4-accent-soft)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--slot4-page-text)]">
            {label}
          </span>
          <h3 className="mt-5 max-w-3xl text-4xl font-bold leading-[0.94] tracking-[-0.06em] sm:text-5xl">{post.title}</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">{getEditableExcerpt(post, 190)}</p>
          <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--slot4-page-text)]">
            Explore now <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group ${dc.layout.minRailCard} block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.65))]" />
        <span className="absolute left-4 top-4 rounded-full bg-[var(--slot4-accent)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
          Spot {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="p-5">
        <p className={`${dc.type.eyebrow} ${pal.accentText}`}>{getEditableCategory(post)}</p>
        <h3 className={`mt-3 line-clamp-2 text-2xl font-bold leading-tight tracking-[-0.05em] ${pal.panelText}`}>{post.title}</h3>
        <p className={`mt-3 line-clamp-3 text-sm leading-7 ${pal.softMutedText}`}>{getEditableExcerpt(post, 120)}</p>
      </div>
    </Link>
  )
}

export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const location = getEditableLocation(post)
  return (
    <Link href={href} className={`group block min-w-0 ${dc.surface.soft} p-5 ${dc.motion.lift}`}>
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--slot4-dark-bg)] text-xs font-black text-white">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] ${pal.accentText}`}>
            <Clock3 className="h-3.5 w-3.5" /> {getEditableCategory(post)}
          </p>
          <h3 className={`mt-2 line-clamp-2 text-xl font-bold leading-tight tracking-[-0.04em] ${pal.panelText}`}>{post.title}</h3>
          <p className={`mt-2 line-clamp-2 text-sm leading-6 ${pal.softMutedText}`}>{getEditableExcerpt(post, 96)}</p>
          {location ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--slot4-muted-text)]">
              <MapPin className="h-3.5 w-3.5 text-[var(--slot4-accent)]" /> {location}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const location = getEditableLocation(post)
  return (
    <Link href={href} className={`group grid min-w-0 gap-5 overflow-hidden ${dc.surface.card} p-4 ${dc.motion.lift} sm:grid-cols-[250px_minmax(0,1fr)]`}>
      <div className={`${dc.media.frame} aspect-[16/12] sm:aspect-auto sm:min-h-[210px]`}>
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="min-w-0 p-2 sm:py-4 sm:pr-5">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">
          <span>Read {String(index + 1).padStart(2, '0')}</span>
          <span className="text-[var(--slot4-muted-text)]">{getEditableCategory(post)}</span>
        </div>
        <h2 className={`mt-3 line-clamp-3 text-2xl font-bold leading-tight tracking-[-0.05em] ${pal.panelText} sm:text-3xl`}>{post.title}</h2>
        <p className={`mt-4 line-clamp-3 text-sm leading-7 ${pal.softMutedText}`}>{getEditableExcerpt(post, 175)}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <span className={`inline-flex items-center gap-2 text-sm font-bold ${pal.panelText}`}>
            Open article <ArrowRight className="h-4 w-4" />
          </span>
          {location ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--slot4-muted-text)]">
              <MapPin className="h-3.5 w-3.5 text-[var(--slot4-accent)]" /> {location}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
