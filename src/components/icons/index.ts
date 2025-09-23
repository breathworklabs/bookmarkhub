// Optimized icon exports - only import what we need to reduce bundle size
// This barrel file allows for tree shaking while keeping imports clean

// Common UI icons
export { LuMenu } from 'react-icons/lu'
export { LuStar } from 'react-icons/lu'
export { LuExternalLink } from 'react-icons/lu'
export { LuDownload } from 'react-icons/lu'

// Bookmark specific icons
export { LuBookmarkPlus } from 'react-icons/lu'
export { LuShare2 } from 'react-icons/lu'
export { LuTrash2 } from 'react-icons/lu'
export { LuPencil } from 'react-icons/lu'
export { LuPlay } from 'react-icons/lu'

// Folder and collection icons
export { LuFolder } from 'react-icons/lu'
export { LuFolderPlus } from 'react-icons/lu'
export { LuFolderOpen } from 'react-icons/lu'
export { LuClock } from 'react-icons/lu'
export { LuArchive } from 'react-icons/lu'
export { LuEllipsis } from 'react-icons/lu'

// Filter and form icons
export { LuTag } from 'react-icons/lu'
export { LuUser } from 'react-icons/lu'
export { LuGlobe } from 'react-icons/lu'
export { LuCalendar } from 'react-icons/lu'
export { LuChevronDown } from 'react-icons/lu'
export { LuChevronLeft } from 'react-icons/lu'
export { LuChevronRight } from 'react-icons/lu'

// Modal and navigation icons
export { LuX } from 'react-icons/lu'
export { LuImport } from 'react-icons/lu'

// This approach:
// 1. Allows tree shaking to work properly
// 2. Centralizes icon imports for better maintenance
// 3. Reduces bundle size by eliminating unused icons
// 4. Provides a single source of truth for all icons used in the app