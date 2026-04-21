import type { Meta, StoryObj } from '@storybook/react'
import LazyImage from '../../src/components/LazyImage'

const meta: Meta<typeof LazyImage> = {
  title: 'Components/LazyImage',
  component: LazyImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'The image source URL',
    },
    alt: {
      control: 'text',
      description: 'Alt text for the image',
    },
    objectFit: {
      control: 'select',
      options: ['cover', 'contain', 'fill', 'scale-down', 'none'],
      description: 'How the image should fit within its container',
    },
    w: {
      control: 'text',
      description: 'Width of the image container',
    },
    h: {
      control: 'text',
      description: 'Height of the image container',
    },
  },
}

export default meta
type Story = StoryObj<typeof LazyImage>

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    alt: 'Sample landscape',
    w: '300px',
    h: '200px',
  },
}

export const Cover: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    alt: 'Sample landscape',
    w: '300px',
    h: '200px',
    objectFit: 'cover',
  },
}

export const Contain: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    alt: 'Sample landscape',
    w: '300px',
    h: '200px',
    objectFit: 'contain',
  },
}

export const RoundedCorners: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    alt: 'Sample landscape',
    w: '300px',
    h: '200px',
    borderRadius: '12px',
  },
}

export const Circular: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    alt: 'Sample landscape',
    w: '150px',
    h: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
}

export const Clickable: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    alt: 'Sample landscape',
    w: '300px',
    h: '200px',
    cursor: 'pointer',
    onClick: () => alert('Image clicked!'),
  },
}

export const WithError: Story = {
  args: {
    src: 'https://invalid-url-that-will-fail.com/image.jpg',
    alt: 'Broken image',
    w: '300px',
    h: '200px',
  },
}

export const SmallThumbnail: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    alt: 'Sample landscape',
    w: '80px',
    h: '80px',
    borderRadius: '6px',
  },
}
