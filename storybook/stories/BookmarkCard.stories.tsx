import type { Meta, StoryObj } from '@storybook/react'
import BookmarkCard from '../../src/components/BookmarkCard/BookmarkCard'
import { type Bookmark } from '../../src/types/bookmark'

const meta: Meta<typeof BookmarkCard> = {
  title: 'Components/BookmarkCard',
  component: BookmarkCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof BookmarkCard>

const sampleBookmark: Bookmark = {
  id: 1,
  title: 'React Documentation',
  url: 'https://react.dev',
  description: 'The library for web and native user interfaces',
  tags: ['react', 'javascript', 'documentation'],
  is_starred: false,
  is_deleted: false,
  created_at: new Date('2024-01-15').toISOString(),
  updated_at: new Date('2024-01-15').toISOString(),
  primaryCollection: 'uncategorized',
  collections: ['uncategorized'],
  thumbnail_url: 'https://react.dev/images/og-home.png',
  author: 'Meta',
  domain: 'react.dev',
}

export const Default: Story = {
  args: {
    bookmark: sampleBookmark,
  },
}

export const Starred: Story = {
  args: {
    bookmark: {
      ...sampleBookmark,
      is_starred: true,
    },
  },
}

export const WithImage: Story = {
  args: {
    bookmark: {
      ...sampleBookmark,
      title: 'Beautiful Landscape',
      description: 'A stunning view of mountains and lakes',
      thumbnail_url:
        'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    },
  },
}

export const WithManyTags: Story = {
  args: {
    bookmark: {
      ...sampleBookmark,
      tags: [
        'react',
        'javascript',
        'typescript',
        'web-development',
        'frontend',
        'hooks',
        'components',
      ],
    },
  },
}

export const LongDescription: Story = {
  args: {
    bookmark: {
      ...sampleBookmark,
      description:
        'This is a very long description that demonstrates how the bookmark card handles extended text content. It includes multiple sentences to show the truncation behavior and overall layout when dealing with lengthy descriptions.',
    },
  },
}

export const NoDescription: Story = {
  args: {
    bookmark: {
      ...sampleBookmark,
      description: '',
    },
  },
}

export const NoThumbnail: Story = {
  args: {
    bookmark: {
      ...sampleBookmark,
      thumbnail_url: undefined,
    },
  },
}

export const MinimalData: Story = {
  args: {
    bookmark: {
      ...sampleBookmark,
      description: '',
      tags: [],
      thumbnail_url: undefined,
      author: undefined,
    },
  },
}

export const WithAuthor: Story = {
  args: {
    bookmark: {
      ...sampleBookmark,
      author: 'John Doe',
      title: 'Understanding React Hooks',
    },
  },
}

export const InCollection: Story = {
  args: {
    bookmark: {
      ...sampleBookmark,
      primaryCollection: 'work',
      collections: ['work', 'javascript'],
    },
  },
}

export const WithAuthorIcon: Story = {
  args: {
    bookmark: {
      ...sampleBookmark,
      author: 'Dan Abramov',
      title: 'Making Sense of React Hooks',
      description:
        'Understanding the motivation behind React Hooks and how they change the way we write components',
      tags: ['react', 'hooks', 'javascript'],
      favicon_url:
        'https://pbs.twimg.com/profile_images/1096807971374448640/xF_nY3NZ_normal.png',
      domain: 'twitter.com',
    },
  },
}

export const WithTwitterProfile: Story = {
  args: {
    bookmark: {
      ...sampleBookmark,
      author: 'Kent C. Dodds',
      title: 'Testing Implementation Details',
      description:
        'Why you should avoid testing implementation details in your React components',
      tags: ['testing', 'react', 'best-practices'],
      favicon_url:
        'https://pbs.twimg.com/profile_images/1586196253355134976/m6pMHQ2N_normal.jpg',
      domain: 'kentcdodds.com',
      metadata: {
        profile_image_normal:
          'https://pbs.twimg.com/profile_images/1586196253355134976/m6pMHQ2N_normal.jpg',
        profile_image_bigger:
          'https://pbs.twimg.com/profile_images/1586196253355134976/m6pMHQ2N_bigger.jpg',
      },
    },
  },
}

export const WithGitHubAvatar: Story = {
  args: {
    bookmark: {
      ...sampleBookmark,
      author: 'Vercel',
      title: 'Next.js 14 Release',
      description:
        'Introducing Next.js 14 with Turbopack, Server Actions, and Partial Prerendering',
      tags: ['nextjs', 'react', 'vercel'],
      favicon_url: 'https://avatars.githubusercontent.com/u/14985020?s=200&v=4',
      domain: 'nextjs.org',
      thumbnail_url: 'https://nextjs.org/static/blog/next-14/twitter-card.png',
    },
  },
}

export const WithCompanyLogo: Story = {
  args: {
    bookmark: {
      ...sampleBookmark,
      author: 'Google Developers',
      title: 'Web Vitals',
      description:
        'Essential metrics for a healthy site - Learn about Core Web Vitals and how to measure them',
      tags: ['performance', 'web-vitals', 'seo'],
      favicon_url:
        'https://developers.google.com/static/site-assets/logo-google-developers.svg',
      domain: 'web.dev',
      thumbnail_url: 'https://web.dev/images/social.png',
    },
  },
}
