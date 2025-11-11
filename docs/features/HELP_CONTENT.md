# BookmarksX Help Content Structure

This document outlines the structure and content for all help topics in BookmarksX. Use this as a guide to implement the remaining help sections.

## Status

- ✅ **Collections** - COMPLETED (implemented in HelpPage.tsx)
- ⏳ **Getting Started** - TO DO
- ⏳ **Bookmark Management** - TO DO
- ⏳ **Tags & Filtering** - TO DO
- ⏳ **Search & Filters** - TO DO
- ⏳ **Import & Export** - TO DO
- ⏳ **Bulk Operations** - TO DO
- ⏳ **Settings** - TO DO
- ⏳ **Privacy & Data** - TO DO

---

## 1. Getting Started

**Target Users**: New users, first-time setup

### Sections:

#### 1.1 Welcome to BookmarksX

- What is BookmarksX?
- Key features overview
- Privacy-first approach (100% local storage)
- No account needed

#### 1.2 Quick Start Guide

**Step 1: Import Your Bookmarks**

- [GIF: Import process]
- How to export from X/Twitter
- Import from JSON file
- Import from other sources

**Step 2: Organize with Collections**

- Create your first collection
- Add bookmarks to collections
- [Screenshot: Collection structure]

**Step 3: Add Tags**

- What are tags?
- How to add tags manually
- Smart tag suggestions
- [GIF: Adding tags]

**Step 4: Search & Filter**

- Using the search bar
- Quick filters
- Advanced filtering
- [Screenshot: Filter options]

#### 1.3 First Steps Checklist

- [ ] Import your bookmarks from X/Twitter
- [ ] Create your first collection
- [ ] Add tags to organize bookmarks
- [ ] Try the search feature
- [ ] Explore settings and customize your experience

#### 1.4 Tips for Success

- **Alert Box (Info)**: Best practices for organizing bookmarks
  - Use collections for broad categories
  - Use tags for flexible cross-categorization
  - Regular cleanup keeps things organized
  - Export your data regularly as backup

---

## 2. Bookmark Management

**Target Users**: All users managing bookmarks

### Sections:

#### 2.1 Adding Bookmarks

**Manual Bookmark Creation**

- [GIF: Adding a bookmark]
- Step 1: Click "Add Bookmark" button
- Step 2: Fill in bookmark details (title, URL, description)
- Step 3: Add tags and select collection
- Step 4: Save bookmark

**Via Browser Extension**

- [Screenshot: Browser extension]
- Install BookmarksX extension
- Save bookmarks while browsing
- Auto-sync with app

**Import from X/Twitter**

- See Import & Export section

#### 2.2 Editing Bookmarks

**Edit Bookmark Details**

- [GIF: Editing a bookmark]
- Click on bookmark card
- Edit title, URL, description
- Update tags
- Change collection
- Save changes

**Quick Edit Options**

- Inline editing for quick updates
- Keyboard shortcuts

#### 2.3 Deleting Bookmarks

**Soft Delete (Move to Trash)**

- [Screenshot: Delete confirmation]
- Click delete icon on bookmark card
- Bookmark moves to Trash (30-day retention)
- Can be restored from Trash

**Permanent Delete**

- From Trash view
- Confirmation required
- Cannot be undone

**Trash & Recovery**

- View trash at any time
- Restore deleted bookmarks
- Auto-cleanup after 30 days
- [GIF: Restoring from trash]

#### 2.4 Starring Bookmarks

**What is Starring?**

- Mark important bookmarks
- Quick access via "Starred" collection
- Visual indicator on bookmark cards

**How to Star**

- [GIF: Starring a bookmark]
- Click star icon on bookmark card
- Find all starred bookmarks in "Starred" collection

#### 2.5 Archiving Bookmarks

**When to Archive**

- Bookmarks you've read
- Reference material to keep but not actively use
- Declutter your main view

**How to Archive**

- [Screenshot: Archive button]
- Click archive icon
- Access archived bookmarks via filter

#### 2.6 Duplicate Detection

**Automatic Duplicate Detection**

- [Screenshot: Duplicate warning]
- BookmarksX detects duplicate URLs
- Options when duplicate found:
  - Skip (don't import)
  - Replace (update existing)
  - Keep Both (allow duplicate)

**Manual Duplicate Management**

- Search for duplicates
- Merge or delete duplicates
- [GIF: Managing duplicates]

#### 2.7 Bookmark Properties

**What Information is Stored?**

- Title (required)
- URL (required)
- Author (optional)
- Domain (auto-detected)
- Description (optional)
- Tags (multiple)
- Collections (multiple)
- Media (images, videos)
- Timestamps (created, updated)
- Engagement metrics (likes, retweets for X/Twitter imports)
- Flags (starred, read, archived)

**Code Example:**

```typescript
interface Bookmark {
  id: string
  title: string
  url: string
  author?: string
  domain: string
  description?: string
  tags: string[]
  collections: string[]
  media: { type: 'image' | 'video'; url: string }[]
  createdAt: Date
  updatedAt: Date
  isStarred: boolean
  isRead: boolean
  isArchived: boolean
}
```

---

## 3. Tags & Categorization

**Target Users**: Users organizing with tags

### Sections:

#### 3.1 Understanding Tags

**What are Tags?**

- Flexible labels for bookmarks
- Multiple tags per bookmark
- Cross-collection organization
- Searchable and filterable

**Tags vs Collections**

- **Collections**: Hierarchical, folder-like structure
- **Tags**: Flat, flexible, cross-cutting labels
- Use both for maximum organization power

#### 3.2 Adding Tags

**Manual Tagging**

- [GIF: Adding tags to a bookmark]
- Step 1: Click on bookmark
- Step 2: Enter tags (comma-separated)
- Step 3: Save

**Tag Input Options**

- Comma-separated: `design, inspiration, ui`
- Individual entry with autocomplete
- Select from existing tags

#### 3.3 Smart Tag Suggestions

**AI-Powered Tag Suggestions**

- [Screenshot: Tag suggestions panel]
- Automatic tag recommendations based on:
  - Bookmark content analysis (NLP)
  - Domain detection (e.g., "GitHub" for github.com)
  - URL patterns
  - Existing tag patterns
  - Learning from your tagging habits

**How to Use Smart Suggestions**

- [GIF: Using tag suggestions]
- Click "Suggest Tags" button
- Review suggested tags
- Select tags to apply
- Click "Apply Tags"

**Suggestion Sources:**

1. **Domain-based**: Suggests tags based on website
2. **NLP Keyword Extraction**: Analyzes content for keywords
3. **URL Pattern Detection**: Detects common URL patterns
4. **Learning-based**: Learns from your existing tags

#### 3.4 Tag Categories

**Organizing Tags into Categories**

- [Screenshot: Tag category manager]
- Create tag categories (e.g., "Topics", "Projects", "Priority")
- Assign tags to categories
- Filter by category

**Common Tag Categories**

- Topics (technology, design, marketing)
- Projects (project names)
- Status (to-read, reading, completed)
- Priority (high, medium, low)
- Type (article, video, tool, tutorial)

#### 3.5 Tag Manager

**Centralized Tag Management**

- [Screenshot: Tag Manager modal]
- View all tags
- See tag usage counts
- Rename tags
- Merge similar tags
- Delete unused tags

**Accessing Tag Manager**

- Click "Manage Tags" in settings
- Or from Tags filter dropdown

#### 3.6 Tag Merging

**When to Merge Tags**

- Duplicate tags (e.g., "js" and "javascript")
- Typos or variations
- Consolidating similar concepts

**How to Merge**

- [GIF: Merging tags]
- Step 1: Open Tag Manager
- Step 2: Select tags to merge
- Step 3: Choose target tag name
- Step 4: Confirm merge
- All bookmarks updated automatically

#### 3.7 Bulk Tagging

**Add/Remove Tags from Multiple Bookmarks**

- [Screenshot: Bulk tag operation]
- Select multiple bookmarks
- Click "Bulk Tag" button
- Add or remove tags
- Apply to all selected bookmarks

See also: **Bulk Operations** section

#### 3.8 Tag Filtering

**Filter Bookmarks by Tags**

- [GIF: Tag filtering]
- Click tag filter dropdown
- Select one or more tags
- Choose AND/OR logic:
  - **AND**: Show bookmarks with ALL selected tags
  - **OR**: Show bookmarks with ANY selected tag

**Tag Filter Combinations**

- Combine with other filters (date, author, domain)
- Save as filter preset
- [Screenshot: Combined filters]

---

## 4. Search & Filters

**Target Users**: All users finding bookmarks

### Sections:

#### 4.1 Full-Text Search

**Search Across All Fields**

- [GIF: Using search]
- Searches in:
  - Bookmark titles
  - Descriptions
  - Authors
  - URLs
  - Tags
  - Collection names

**Search Tips**

- Case-insensitive
- Partial word matching
- Searches all visible bookmarks in current view

**Search Box Location**

- Top of page in SearchHeader
- Always accessible

#### 4.2 Quick Filters (Filter Bar Tabs)

**Quick Filter Tabs**

- [Screenshot: Filter bar tabs]
- **All Bookmarks**: Show everything
- **Today**: Bookmarks added today
- **This Week**: Bookmarks from past 7 days
- **Threads**: Multi-part content
- **Media**: Bookmarks with images/videos

**How to Use**

- Click tab to activate filter
- Active tab highlighted
- Combines with other filters

#### 4.3 Advanced Filters

**Filter Panel**

- [Screenshot: Advanced filter panel]
- Access via "Filters" button in header

**Available Filters:**

1. **Author Filter**
   - Filter by bookmark author
   - Select from list of authors
   - Multi-select supported

2. **Domain Filter**
   - Filter by website domain
   - Groups bookmarks by source
   - [Screenshot: Domain filter]

3. **Content Type Filter**
   - Article
   - Tweet
   - Video
   - Image
   - Other

4. **Date Range Filter**
   - [Screenshot: Date picker]
   - Presets:
     - Today
     - This Week
     - This Month
     - Custom Range
   - Custom date picker for precise ranges

5. **Tag Filter**
   - See Tags & Categorization section
   - AND/OR logic
   - Multi-tag selection

6. **Quick Filter Toggles**
   - Additional quick toggles with tooltips
   - Combine multiple toggles

#### 4.4 Filter Presets

**Save Your Filter Combinations**

- [GIF: Saving filter preset]
- Set up your filters
- Click "Save Preset"
- Name your preset
- Quick access to saved filters

**Load Filter Presets**

- [Screenshot: Preset dropdown]
- Click preset name to apply
- Instantly applies all filter settings

**Manage Presets**

- Edit preset name
- Update preset filters
- Delete unused presets

**Example Use Cases:**

- "Work Research" preset: Work collection + research tag + this week
- "Videos to Watch" preset: Media filter + to-watch tag + unread
- "Design Inspiration" preset: Design tag + media filter + starred

#### 4.5 Combining Filters

**Multiple Filter Logic**

- [Diagram: Filter combination logic]
- All filters use AND logic
- Example: Author="John" AND Tag="React" AND Date="This Week"
- Narrows results with each filter added

**Filter Badge Indicators**

- Visual badges show active filters
- Clear individual filters
- Clear all filters button

---

## 5. Import & Export

**Target Users**: Users managing data portability

### Sections:

#### 5.1 Import from X/Twitter

**Export from X/Twitter**

- [Screenshot: X/Twitter export process]
- Step 1: Go to X/Twitter settings
- Step 2: Request data export
- Step 3: Download bookmark data
- Step 4: Extract bookmarks.json file

**Import into BookmarksX**

- [GIF: Import process]
- Step 1: Click "Import" button
- Step 2: Select "Import from X/Twitter"
- Step 3: Choose bookmarks.json file
- Step 4: Configure duplicate handling
- Step 5: Import

**Data Normalization**

- X/Twitter format automatically converted
- Media extracted
- Metadata preserved
- [Code Example: X payload structure]

#### 5.2 Import from JSON

**BookmarksX JSON Format**

- [Screenshot: JSON import]
- Import previously exported BookmarksX data
- Maintains all metadata
- Collections and tags preserved

**JSON File Structure**

```json
{
  "bookmarks": [...],
  "collections": [...],
  "tags": [...],
  "version": "1.0"
}
```

#### 5.3 Duplicate Handling

**Automatic Duplicate Detection**

- [Screenshot: Duplicate options]
- Detects duplicates by URL during import

**Duplicate Handling Options:**

1. **Skip**: Don't import duplicates (default)
2. **Replace**: Update existing bookmark with new data
3. **Keep Both**: Import as separate bookmark

**Configure in Settings**

- Set default duplicate handling preference
- Settings > Import > Duplicate Handling

#### 5.4 Export to JSON

**Full Data Export**

- [GIF: Export process]
- Step 1: Click "Export" button
- Step 2: Select "Export to JSON"
- Step 3: Choose export options
- Step 4: Download file

**Export Options**

- Include/exclude deleted items
- Include/exclude media URLs
- Formatted or minified JSON

**Use Cases**

- Backup your data
- Transfer to another device
- Share bookmarks with others
- Data portability

#### 5.5 Export to CSV

**Spreadsheet-Compatible Format**

- [Screenshot: CSV export options]
- Export to Excel/Google Sheets compatible format

**CSV Columns**

- Title
- URL
- Author
- Domain
- Description
- Tags (comma-separated)
- Collections (comma-separated)
- Created Date
- Starred (Yes/No)
- Archived (Yes/No)

**Use Cases**

- Analyze bookmarks in spreadsheet
- Share with non-BookmarksX users
- Create reports

#### 5.6 Export to HTML

**Browser Bookmark Format**

- [Screenshot: HTML export]
- Standard HTML bookmark file format
- Compatible with all browsers

**Import into Browsers**

- Chrome: Bookmarks > Import bookmarks
- Firefox: Bookmarks > Import and Backup
- Safari: File > Import From > Bookmarks HTML File
- Edge: Favorites > Import favorites

**Limitations**

- Only preserves title, URL, folder structure
- Tags and metadata not preserved
- Collections converted to folders

#### 5.7 Data Validation

**Import Validation**

- [Screenshot: Validation errors]
- Validates data before import
- Checks for:
  - Valid URLs
  - Required fields
  - Correct data types
  - File format

**Error Handling**

- Clear error messages
- Shows which items failed
- Option to skip errors and continue
- Or cancel import to fix issues

---

## 6. Bulk Operations

**Target Users**: Power users managing many bookmarks

### Sections:

#### 6.1 Bulk Selection

**Select Multiple Bookmarks**

- [GIF: Bulk selection]
- Click checkbox on bookmark cards
- Or use "Select All" button
- Selection count badge appears

**Selection Options**

- Select individual bookmarks
- Select all in current view
- Clear selection

**Visual Feedback**

- Selected bookmarks highlighted
- Selection toolbar appears
- Count of selected items

#### 6.2 Bulk Move to Collection

**Move Multiple Bookmarks at Once**

- [Screenshot: Bulk move dialog]
- Step 1: Select bookmarks
- Step 2: Click "Move to Collection"
- Step 3: Choose target collection
- Step 4: Confirm

**Options**

- Move (remove from current collection)
- Copy (keep in current, add to new)
- Multi-collection assignment

#### 6.3 Bulk Tagging

**Add/Remove Tags from Multiple Bookmarks**

- [GIF: Bulk tagging]
- Step 1: Select bookmarks
- Step 2: Click "Bulk Tag" button
- Step 3: Enter tags to add or remove
- Step 4: Apply

**Tag Operations**

- Add tags to all selected
- Remove tags from all selected
- Replace tags on all selected

#### 6.4 Bulk Delete

**Delete Multiple Bookmarks**

- [Screenshot: Bulk delete confirmation]
- Step 1: Select bookmarks
- Step 2: Click "Delete" button
- Step 3: Confirm deletion
- All moved to Trash

**Recovery**

- Can be restored from Trash
- See Trash & Recovery section

#### 6.5 Bulk Archive

**Archive Multiple Bookmarks**

- Select bookmarks
- Click "Archive" button
- All selected bookmarks archived
- Access via Archive filter

#### 6.6 Smart Tag Suggestions for Bulk

**AI Tag Suggestions for Selected Bookmarks**

- [GIF: Bulk smart tagging]
- Step 1: Select bookmarks
- Step 2: Click "Suggest Tags"
- Step 3: Review suggested tags
- Step 4: Apply to all or individually

**How It Works**

- Analyzes all selected bookmarks
- Finds common themes
- Suggests relevant tags
- Individual customization possible

---

## 7. Settings

**Target Users**: All users customizing experience

### Sections:

#### 7.1 Extension Settings

**Auto-Sync Settings**

- [Screenshot: Sync settings]
- Auto-sync interval options:
  - Off (manual sync only)
  - Every 5 minutes
  - Every 15 minutes
  - Every 30 minutes
  - Every hour
- Sync notifications toggle

**Default Tags**

- Set default tags for new bookmarks
- Auto-applied to all new bookmarks
- Can be removed individually

**Auto-Open App on Bookmark**

- Toggle to open app when saving bookmark
- Useful for immediate organization

**Default Collection**

- Set default collection for new bookmarks
- Falls back to "All Bookmarks" if not set

#### 7.2 Display Settings

**Theme Settings**

- [Screenshot: Theme selector]
- Dark Mode
- Light Mode
- Auto (system preference)
- [GIF: Theme switching]

**Font Size**

- Small
- Medium (default)
- Large
- Affects readability

**View Mode Preference**

- Grid View (default)
- List View
- Compact View
- Remember preference

**Cards Per Page**

- 10, 20, 30, 50, 100
- Pagination control
- Performance consideration

**Compact View Toggle**

- Denser display
- More bookmarks visible
- Less detail per card

**Media Preview Mode**

- Auto (show all media)
- Click to load (privacy)
- Off (no media previews)

**Animations**

- Enable/disable animations
- Performance toggle
- Accessibility consideration

**Sort Preference**

- Default sort order
- Date (newest/oldest)
- Title (A-Z, Z-A)
- Author
- Domain

**Sidebar State**

- Collapsed by default
- Expanded by default
- Remember last state

#### 7.3 Privacy Settings

**Analytics**

- [Alert Box: Privacy First]
- BookmarksX does NOT collect analytics
- 100% local storage
- No tracking, no cookies, no servers

**Search History**

- Enable/disable search history
- Clear search history
- Local only, never shared

**Data Storage**

- All data in browser localStorage
- View storage usage
- Clear all data option (with confirmation)

#### 7.4 Import/Export Settings

**Default Duplicate Handling**

- Skip duplicates (default)
- Replace existing
- Keep both
- Applied during import

**Export Format Preferences**

- Default export format (JSON, CSV, HTML)
- Include deleted items
- Include media URLs

#### 7.5 Accessibility Settings

**Keyboard Shortcuts**

- Enable/disable shortcuts
- View shortcut reference
- [Table: Keyboard shortcuts]

**Screen Reader Support**

- ARIA labels enabled
- Semantic HTML
- Focus management

**Reduced Motion**

- Respect system preference
- Disable animations
- Static transitions

---

## 8. Privacy & Data

**Target Users**: Privacy-conscious users, data portability

### Sections:

#### 8.1 100% Local Storage

**No Backend, No Server**

- [Alert Box: Privacy Guarantee]
- All data stored in browser localStorage
- No cloud storage
- No external servers
- No database
- Complete privacy

**What This Means**

- Your data never leaves your device
- No account required
- No sign-up, no login
- No third parties
- No data breaches possible

#### 8.2 No Tracking

**Zero Analytics**

- No analytics tools
- No user tracking
- No cookies
- No fingerprinting
- No telemetry

**What We DON'T Collect**

- ✗ Personal information
- ✗ Browsing history
- ✗ Usage patterns
- ✗ IP addresses
- ✗ Device information
- ✗ Anything

#### 8.3 Data Portability

**You Own Your Data**

- Export anytime
- No vendor lock-in
- Standard formats (JSON, CSV, HTML)
- Transfer between devices
- Share with others

**Export Options**

- See Import & Export section
- Full data export
- Partial exports
- Scheduled backups (manual)

#### 8.4 Data Security

**Input Sanitization**

- All user input sanitized
- XSS prevention
- SQL injection N/A (no database)
- Safe HTML rendering

**Built-in React Protection**

- React's built-in XSS protection
- Content Security Policy
- Safe rendering

#### 8.5 Data Management

**Storage Usage**

- [Screenshot: Storage info]
- View current storage usage
- Browser localStorage limits
- Typical: 5-10MB available

**Clear All Data**

- [Screenshot: Clear data warning]
- Requires confirmation
- Permanently deletes all bookmarks
- Export before clearing (recommended)
- Cannot be undone

#### 8.6 Browser Compatibility

**Supported Browsers**

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with localStorage

**localStorage Support Required**

- All modern browsers supported
- Private/Incognito mode may have limitations

#### 8.7 Data Backup Best Practices

**Recommended Backup Strategy**

- Export data weekly/monthly
- Store exports in secure location
- Multiple backup locations
- Version your exports (date in filename)

**Automatic Backup (Future Feature)**

- Scheduled auto-exports
- Browser extension sync
- Coming soon

---

## 9. Additional Topics (Future Expansion)

### 9.1 View Modes & Display

- Grid view details
- List view details
- Compact view details
- Infinite scroll behavior
- Sorting options deep dive

### 9.2 AI Insights & Analytics

- Trending topics explanation
- Recent activity tracking
- Bookmark validation deep dive
- Validation summary interpretation
- Time-based activity analysis

### 9.3 Trash & Recovery

- Soft delete behavior
- 30-day retention policy
- Restore process
- Permanent deletion
- Auto-cleanup details

### 9.4 Drag & Drop

- Drag bookmarks to collections
- Reorder collections
- Visual drag indicators
- Drag preview
- Accessibility considerations

### 9.5 Mobile Features

- Mobile-specific UI
- Touch gestures
- Mobile sidebar
- Responsive considerations

### 9.6 Keyboard Shortcuts

- Complete shortcut reference
- Customizable shortcuts
- Power user workflows

### 9.7 Onboarding

- First-time user experience
- Splash screen
- Quick start wizard

### 9.8 Context Menus

- Bookmark context menu
- Collection context menu
- Quick actions

### 9.9 Notifications & Feedback

- Toast notifications
- Error messages
- Loading states
- Confirmation dialogs

### 9.10 Bookmark Validation

- Link validation process
- Validation progress tracking
- Invalid bookmark management
- Cached validation results

---

## Implementation Guidelines

### For Each Help Topic:

1. **Structure**
   - Clear heading hierarchy (h1 > h2 > h3)
   - Numbered steps for processes
   - Bulleted lists for options

2. **Visual Placeholders**
   - Use `<Box>` with dashed border for [GIF] placeholders
   - Use `<Box>` with dashed border for [Screenshot] placeholders
   - Include descriptive alt text

3. **Components to Use**
   - `<Alert>` for tips, warnings, notes
   - `<Code>` for code examples
   - `<VStack>`, `<HStack>` for layout
   - `<Text>`, `<Heading>` for typography
   - `<UnorderedList>`, `<OrderedList>` for lists

4. **Code Examples**
   - Use `<Code>` component from Chakra UI
   - TypeScript examples where applicable
   - Real-world use cases

5. **Accessibility**
   - Semantic HTML
   - ARIA labels where needed
   - Focus management
   - Screen reader friendly

6. **Responsive Design**
   - Mobile-first approach
   - Stack on small screens
   - Readable on all devices

---

## Next Steps

1. ✅ Collections section (DONE - implemented in HelpPage.tsx)
2. Implement Getting Started section next (highest priority)
3. Then Bookmark Management
4. Then Tags & Filtering
5. Continue through all sections
6. Add actual GIFs and screenshots to replace placeholders
7. Add contextual tooltips throughout the app
8. Create searchable help index
9. Add help button in header (DONE)
10. Test all help content for accuracy

---

## Notes

- Keep content concise and scannable
- Use real examples from the app
- Update as features change
- Test all instructions
- Get user feedback
- Iterate and improve

---

**Last Updated**: 2025-01-08
**Version**: 1.0
**Maintainer**: BookmarksX Team
