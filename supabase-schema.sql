-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE public.bookmarks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  content TEXT,
  thumbnail_url TEXT,
  favicon_url TEXT,
  author TEXT,
  domain TEXT,
  source_platform TEXT, -- 'twitter', 'linkedin', 'reddit', 'manual', etc.
  source_id TEXT, -- Original post/tweet ID
  engagement_score INTEGER DEFAULT 0,
  is_starred BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB, -- Flexible storage for platform-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collections table
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  color TEXT,
  icon TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  bookmark_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Junction table for many-to-many relationship between bookmarks and collections
CREATE TABLE public.bookmark_collections (
  bookmark_id BIGINT REFERENCES public.bookmarks(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  order_index INTEGER DEFAULT 0,
  PRIMARY KEY (bookmark_id, collection_id)
);

-- Tags table for better tag management
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Indexes for performance
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON public.bookmarks(created_at);
CREATE INDEX idx_bookmarks_domain ON public.bookmarks(domain);
CREATE INDEX idx_bookmarks_is_starred ON public.bookmarks(is_starred);
CREATE INDEX idx_bookmarks_is_archived ON public.bookmarks(is_archived);
CREATE INDEX idx_bookmarks_tags ON public.bookmarks USING GIN(tags);
CREATE INDEX idx_bookmarks_content_search ON public.bookmarks USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(content, '')));

CREATE INDEX idx_collections_user_id ON public.collections(user_id);
CREATE INDEX idx_collections_parent_id ON public.collections(parent_id);

CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_tags_usage_count ON public.tags(usage_count);

-- RLS (Row Level Security) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmark_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks" ON public.bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Collections policies
CREATE POLICY "Users can view own collections" ON public.collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON public.collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON public.collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON public.collections
  FOR DELETE USING (auth.uid() = user_id);

-- Bookmark collections policies
CREATE POLICY "Users can manage own bookmark collections" ON public.bookmark_collections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bookmarks
      WHERE bookmarks.id = bookmark_collections.bookmark_id
      AND bookmarks.user_id = auth.uid()
    )
  );

-- Tags policies
CREATE POLICY "Users can view own tags" ON public.tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON public.tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON public.tags
  FOR DELETE USING (auth.uid() = user_id);

-- Functions for advanced features
CREATE OR REPLACE FUNCTION search_bookmarks(
  search_query TEXT,
  user_id UUID,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id BIGINT,
  title TEXT,
  url TEXT,
  description TEXT,
  content TEXT,
  thumbnail_url TEXT,
  favicon_url TEXT,
  author TEXT,
  domain TEXT,
  source_platform TEXT,
  is_starred BOOLEAN,
  is_read BOOLEAN,
  is_archived BOOLEAN,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  rank REAL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.title,
    b.url,
    b.description,
    b.content,
    b.thumbnail_url,
    b.favicon_url,
    b.author,
    b.domain,
    b.source_platform,
    b.is_starred,
    b.is_read,
    b.is_archived,
    b.tags,
    b.created_at,
    ts_rank(
      to_tsvector('english', b.title || ' ' || COALESCE(b.description, '') || ' ' || COALESCE(b.content, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM public.bookmarks b
  WHERE b.user_id = search_bookmarks.user_id
    AND (
      to_tsvector('english', b.title || ' ' || COALESCE(b.description, '') || ' ' || COALESCE(b.content, ''))
      @@ plainto_tsquery('english', search_query)
      OR b.url ILIKE '%' || search_query || '%'
      OR b.author ILIKE '%' || search_query || '%'
      OR search_query = ANY(b.tags)
    )
  ORDER BY rank DESC, b.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Function to increment tag usage
CREATE OR REPLACE FUNCTION increment_tag_usage(user_id UUID, tag_name TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.tags (user_id, name, usage_count)
  VALUES (user_id, tag_name, 1)
  ON CONFLICT (user_id, name)
  DO UPDATE SET usage_count = tags.usage_count + 1;
END;
$$;

-- Trigger to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create default collections
  INSERT INTO public.collections (user_id, name, is_default)
  VALUES
    (NEW.id, 'All Bookmarks', TRUE),
    (NEW.id, 'Starred', TRUE),
    (NEW.id, 'Unread', TRUE);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookmarks_updated_at BEFORE UPDATE ON public.bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();