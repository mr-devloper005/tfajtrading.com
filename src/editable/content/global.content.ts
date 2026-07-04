import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'Freelancer and business discovery hub',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'Freelancer and business discovery hub',
    primaryLinks: [
      { label: 'Home', href: '/' },
      { label: 'Listings', href: '/listings' },
      { label: 'Classifieds', href: '/classifieds' },
      { label: 'Profiles', href: '/profiles' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Create post', href: '/create' },
      secondary: { label: 'Contact', href: '/contact' },
    },
  },
  footer: {
    tagline: 'Browse opportunities, services, and standout profiles',
    description: 'A clean public-facing platform for discoveries, offers, professional profiles, and useful updates across multiple content types.',
    columns: [
      {
        title: 'Browse',
        links: [
          { label: 'Business listings', href: '/listings' },
          { label: 'Classifieds', href: '/classifieds' },
          { label: 'Profiles', href: '/profiles' },
          { label: 'Articles', href: '/articles' },
        ],
      },
      {
        title: 'Site',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
          { label: 'Search', href: '/search' },
        ],
      },
    ],
    bottomNote: 'Built for fast browsing, clear posting, and polished public presentation.',
  },
  commonLabels: {
    readMore: 'Read more',
    viewAll: 'View all',
    explore: 'Explore',
    latest: 'Latest',
    related: 'Related',
    published: 'Published',
  },
} as const
