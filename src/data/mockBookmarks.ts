export interface Bookmark {
  id: number;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  metrics: {
    likes: string;
    retweets: string;
    replies: string;
  };
  tags: string[];
  hasMedia: boolean;
  isStarred: boolean;
}

export const mockBookmarks: Bookmark[] = [
  {
    id: 1,
    author: {
      name: 'Elon Musk',
      username: '@elonmusk',
      avatar: 'https://via.placeholder.com/40'
    },
    content: 'The future of transportation is electric. Tesla is leading the charge with sustainable energy solutions that will transform how we move. 🚗⚡',
    timestamp: '2h',
    metrics: {
      likes: '12.5K',
      retweets: '2.1K',
      replies: '856'
    },
    tags: ['tech', 'tesla', 'electric'],
    hasMedia: true,
    isStarred: false
  },
  {
    id: 2,
    author: {
      name: 'OpenAI',
      username: '@OpenAI',
      avatar: 'https://via.placeholder.com/40'
    },
    content: 'Introducing GPT-4 Turbo with 128K context length. This represents a significant leap forward in AI capabilities, enabling more comprehensive understanding of large documents and complex conversations.',
    timestamp: '4h',
    metrics: {
      likes: '8.2K',
      retweets: '3.4K',
      replies: '1.2K'
    },
    tags: ['AI', 'GPT', 'technology'],
    hasMedia: false,
    isStarred: true
  },
  {
    id: 3,
    author: {
      name: 'Vercel',
      username: '@vercel',
      avatar: 'https://via.placeholder.com/40'
    },
    content: 'Next.js 14 is here! 🎉\n\n✨ Turbo Mode performance improvements\n🔥 Server Actions are stable\n📊 Enhanced analytics\n🎨 New create-next-app design\n\nUpgrade today and experience the future of React development.',
    timestamp: '6h',
    metrics: {
      likes: '5.8K',
      retweets: '1.9K',
      replies: '432'
    },
    tags: ['nextjs', 'react', 'development'],
    hasMedia: true,
    isStarred: false
  }
];