# REPLACE direct-import with cookies-version logic

The cookies-version has the CORRECT, WORKING code in:

- `background/service-worker.js` lines 342-650

Just copy these exact functions to direct-import:

1. parseTweet() - Parses Twitter's new API structure
2. transformToBookmark() - Transforms to BookmarkX format CORRECTLY
3. extractThumbnail()
4. extractHashtags()
5. convertTextToHTML()

Use queryId: ire7TB3NNzZOIa2SeD8pLA (NOT Hf9iRaMf0HtJB6bdLmrJAg)

This is the version that was debugged and fixed a month ago!
