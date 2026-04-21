import type { Meta, StoryObj } from '@storybook/react'
import TagChip from '../../src/components/tags/TagChip'

const meta: Meta<typeof TagChip> = {
  title: 'Components/Tags/TagChip',
  component: TagChip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tag: {
      control: 'text',
      description: 'The tag text to display',
    },
    isActive: {
      control: 'boolean',
      description: 'Whether the tag is in an active state',
    },
    isRemovable: {
      control: 'boolean',
      description: 'Whether the tag can be removed',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the tag',
    },
    variant: {
      control: 'select',
      options: ['default', 'filter', 'editable'],
      description: 'The visual variant of the tag',
    },
  },
}

export default meta
type Story = StoryObj<typeof TagChip>

export const Default: Story = {
  args: {
    tag: 'javascript',
  },
}

export const Active: Story = {
  args: {
    tag: 'javascript',
    isActive: true,
    variant: 'filter',
  },
}

export const Removable: Story = {
  args: {
    tag: 'javascript',
    isRemovable: true,
    variant: 'editable',
  },
}

export const SmallSize: Story = {
  args: {
    tag: 'javascript',
    size: 'sm',
  },
}

export const MediumSize: Story = {
  args: {
    tag: 'javascript',
    size: 'md',
  },
}

export const LargeSize: Story = {
  args: {
    tag: 'javascript',
    size: 'lg',
  },
}

export const FilterVariant: Story = {
  args: {
    tag: 'javascript',
    variant: 'filter',
  },
}

export const EditableVariant: Story = {
  args: {
    tag: 'javascript',
    variant: 'editable',
    isRemovable: true,
  },
}

export const WithClickHandler: Story = {
  args: {
    tag: 'javascript',
    onClick: (tag: string) => alert(`Clicked tag: ${tag}`),
  },
}

export const WithRemoveHandler: Story = {
  args: {
    tag: 'javascript',
    isRemovable: true,
    variant: 'editable',
    onRemove: (tag: string) => alert(`Removed tag: ${tag}`),
  },
}
