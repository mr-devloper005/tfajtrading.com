import Link from 'next/link'
import {
  ArrowRight,
  Camera,
  MapPin,
  Sparkles,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { CompactIndexCard, EditorialFeatureCard, RailPostCard, getEditableCategory, getEditableExcerpt, getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function detailBits(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const location =
    (typeof content.location === 'string' && content.location) ||
    (typeof content.city === 'string' && content.city) ||
    (typeof content.address === 'string' && content.address) ||
    ''
  return {
    location,
    price:
      (typeof content.price === 'string' && content.price) ||
      (typeof content.amount === 'string' && content.amount) ||
      (typeof content.budget === 'string' && content.budget) ||
      '',
  }
}

function HeroSpotlightCard({ post, href }: { post: SitePost; href: string }) {
  const meta = detailBits(post)
  return (
    <Link href={href} className="group overflow-hidden rounded-[2rem] border border-[var(--editable-border)] bg-white shadow-[0_22px_55px_rgba(28,22,13,0.12)]">
      <div className="relative aspect-[16/11] overflow-hidden">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.75))]" />
        <div className="absolute left-4 top-4 rounded-full bg-[var(--slot4-accent)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
          Featured
        </div>
        {meta.price ? (
          <div className="absolute bottom-4 left-4 rounded-full bg-[var(--slot4-accent-fill)] px-4 py-2 text-sm font-bold text-white">
            {meta.price}
          </div>
        ) : null}
      </div>
      <div className="p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
        <h3 className="mt-3 line-clamp-2 text-3xl font-bold leading-[1.02] tracking-[-0.04em] text-[var(--slot4-page-text)]">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 150)}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--slot4-page-text)]">
            View listing <ArrowRight className="h-4 w-4 text-[var(--slot4-accent)]" />
          </span>
          {meta.location ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--slot4-muted-text)]">
              <MapPin className="h-3.5 w-3.5 text-[var(--slot4-accent)]" /> {meta.location}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

function HorizontalShowcaseCard({ post, href, label }: { post: SitePost; href: string; label: string }) {
  return (
    <Link href={href} className="group grid gap-5 overflow-hidden rounded-[1.8rem] border border-[var(--editable-border)] bg-white p-4 shadow-[0_14px_38px_rgba(34,26,15,0.06)] transition duration-300 hover:-translate-y-1 sm:grid-cols-[220px_minmax(0,1fr)]">
      <div className="relative overflow-hidden rounded-[1.25rem] bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="aspect-[4/3] h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="min-w-0 self-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">{label}</p>
        <h3 className="mt-2 line-clamp-2 text-2xl font-bold leading-tight tracking-[-0.04em] text-[var(--slot4-page-text)]">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 140)}</p>
      </div>
    </Link>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const feature = pool[0]
  const highlight = pool[1]
  const heroTitle = pagesContent.home.hero.title?.join(' ') || 'Find offers, profiles, and business leads faster'

  return (
    <section className="editable-tech-grid relative overflow-hidden bg-[var(--slot4-page-bg)]">
      <div className={`relative py-10 sm:py-12 ${container}`}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] lg:items-start">
          <div className="pt-4 text-[var(--slot4-page-text)] lg:pt-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] shadow-[0_10px_26px_rgba(34,26,15,0.05)]">
              <Sparkles className="h-4 w-4 text-[var(--slot4-accent-soft)]" />
              Smart local discovery
            </div>
            <h1 className="editable-display mt-6 max-w-3xl text-4xl font-bold leading-[0.94] tracking-[-0.06em] sm:text-5xl lg:text-[4.5rem]">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--slot4-muted-text)] sm:text-lg">{pagesContent.home.hero.description}</p>
          </div>

          <div className="hidden lg:block lg:pt-6">
            {feature ? <HeroSpotlightCard post={feature} href={postHref(primaryTask, feature, primaryRoute)} /> : null}
          </div>
        </div>

        {highlight ? (
          <div className="mt-10">
            <HorizontalShowcaseCard post={highlight} href={postHref(primaryTask, highlight, primaryRoute)} label="Sponsored spotlight" />
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(0, 8)
  if (!pool.length) return null

  return (
    <section className="bg-[var(--slot4-warm)]">
      <div className={`py-14 ${container}`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">Featured rail</p>
            <h2 className="editable-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--slot4-page-text)]">Popular picks this week</h2>
          </div>
          <Link href={primaryRoute} className="hidden items-center gap-1 text-sm font-bold text-[var(--slot4-accent)] sm:inline-flex">
            Explore all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-7 flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {pool.map((post, index) => (
            <RailPostCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const activity = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(0, 7)
  if (!activity.length) return null

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`py-14 ${container}`}>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">Top story</p>
          <div className="mt-4">
            <EditorialFeatureCard post={activity[0]} href={postHref(primaryTask, activity[0], primaryRoute)} label="Lead feature" />
          </div>
        </div>
      </div>
    </section>
  )
}

const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'Latest wave', title: 'New this week' },
  browse: { eyebrow: 'Trending now', title: 'Most viewed picks' },
  index: { eyebrow: 'Archive edit', title: 'Worth revisiting' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore' }
        return (
          <section key={section.key} className={index % 2 === 0 ? 'bg-[var(--slot4-warm)]' : 'bg-[var(--slot4-page-bg)]'}>
            <div className={`py-14 ${container}`}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">{copy.eyebrow}</p>
                  <h2 className="editable-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--slot4-page-text)]">{copy.title}</h2>
                </div>
                <Link href={section.href || primaryRoute} className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[var(--slot4-accent)]">
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="grid gap-5">
                  {section.posts.slice(0, 2).map((post, itemIndex) => (
                    <HorizontalShowcaseCard
                      key={post.id || post.slug}
                      post={post}
                      href={postHref(primaryTask, post, primaryRoute)}
                      label={itemIndex === 0 ? 'Priority pick' : 'Editors note'}
                    />
                  ))}
                </div>
                <div className="grid gap-4">
                  {section.posts.slice(2, 6).map((post, itemIndex) => (
                    <CompactIndexCard
                      key={post.id || post.slug}
                      post={post}
                      href={postHref(primaryTask, post, primaryRoute)}
                      index={itemIndex}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

export function EditableHomeCta() {
  return (
    <section id="get-app" className="bg-[var(--slot4-dark-bg)] text-white">
      <div className={`grid gap-6 py-16 text-center sm:py-20 ${container}`}>
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/6 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em]">
          <Sparkles className="h-4 w-4 text-[var(--slot4-accent-soft)]" />
          Ready to publish
        </div>
        <h2 className="editable-display mx-auto max-w-3xl text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
          Post your next update, offer, profile, or business listing with confidence.
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-8 text-white/74 sm:text-lg">
          Keep your presence current, give visitors a polished first impression, and make it easier for people to reach out.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/create" className="rounded-full bg-[var(--slot4-accent-fill)] px-7 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:brightness-95">
            Create a post
          </Link>
          <Link href="/contact" className="rounded-full border border-white/20 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/10">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  )
}
