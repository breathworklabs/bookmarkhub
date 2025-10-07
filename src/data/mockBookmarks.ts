import type { Bookmark } from '../types/bookmark'

export const mockBookmarks: Bookmark[] = [
  {
    id: 1,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'Electric Transportation Future',
    url: 'https://x.com/elonmusk/status/1234567890',
    description: 'The future of transportation is electric. Tesla is leading the charge with sustainable energy solutions that will transform how we move.',
    content: 'The future of transportation is electric. Tesla is leading the charge with sustainable energy solutions that will transform how we move. 🚗⚡',
    author: 'Elon Musk',
    domain: 'x.com',
    source_platform: 'twitter',
    engagement_score: 12500,
    is_starred: false,
    is_read: false,
    is_archived: false,
    is_deleted: false,
    tags: ['tech', 'tesla', 'electric'],
    thumbnail_url: 'https://via.placeholder.com/400x200',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    collections: ['uncategorized']
  },
  {
    id: 2,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'GPT-4 Turbo Announcement',
    url: 'https://x.com/OpenAI/status/1234567891',
    description: 'Introducing GPT-4 Turbo with 128K context length. This represents a significant leap forward in AI capabilities.',
    content: 'Introducing GPT-4 Turbo with 128K context length. This represents a significant leap forward in AI capabilities, enabling more comprehensive understanding of large documents and complex conversations.',
    author: 'OpenAI',
    domain: 'x.com',
    source_platform: 'twitter',
    engagement_score: 8200,
    is_starred: true,
    is_read: false,
    is_archived: false,
    is_deleted: false,
    tags: ['AI', 'GPT', 'technology'],
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    collections: ['uncategorized']
  },
  {
    id: 3,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'Next.js 14 Release',
    url: 'https://x.com/vercel/status/1234567892',
    description: 'Next.js 14 is here with Turbo Mode performance improvements and Server Actions.',
    content: 'Next.js 14 is here! 🎉\n\n✨ Turbo Mode performance improvements\n🔥 Server Actions are stable\n📊 Enhanced analytics\n🎨 New create-next-app design\n\nUpgrade today and experience the future of React development.',
    author: 'Vercel',
    domain: 'x.com',
    source_platform: 'twitter',
    engagement_score: 5800,
    is_starred: false,
    is_read: false,
    is_archived: false,
    is_deleted: false,
    tags: ['nextjs', 'react', 'development'],
    thumbnail_url: 'https://via.placeholder.com/400x200',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    collections: ['uncategorized']
  }
];