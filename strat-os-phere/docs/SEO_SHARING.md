# SEO & Social Sharing

This document describes how Open Graph and Twitter Card metadata are implemented across Plinth, and how to test and maintain social sharing previews.

## Overview

Plinth implements Open Graph (OG) and Twitter Card metadata across the application to ensure that when URLs are shared in iMessage/SMS, Slack, Twitter/X, Discord, and other platforms, they show attractive, branded previews with clear titles, descriptions, and images.

## Implementation

### Global Metadata

Global metadata defaults are defined in `app/layout.tsx` using `generateMetadata()` and the `createBaseMetadata()` helper from `lib/seo/metadata.ts`. This provides:

- Default title template: `%s — Plinth`
- Default description: Brand-focused messaging about competitive intelligence
- Default OG image: `/api/og?variant=default`
- Twitter Card: `summary_large_image`
- Icons: favicon and apple-touch-icon

### Page-Specific Metadata

Each page can override metadata using `generateMetadata()` exports:

- **Marketing home** (`app/page.tsx`): Brand positioning, canonical URL
- **Login** (`app/login/page.tsx`): Sign-in focused, noindex
- **Results** (`app/projects/[projectId]/results/page.tsx`): Results-focused, noindex, OG variant "results"
- **Competitors** (`app/projects/[projectId]/competitors/page.tsx`): Competitors-focused, noindex, OG variant "competitors"

**Important**: Private routes (projects, dashboard, login) explicitly set `robots: { index: false }` to prevent indexing. They also do not include project names or competitor names in metadata to avoid leaking sensitive information.

### OG Image Generation

OG images are generated dynamically via `/app/api/og/route.tsx` using Next.js `ImageResponse`. Images are 1200x630px (standard OG image size) and support three variants via query parameter:

- `?variant=default` - Default brand image
- `?variant=results` - Results page variant (includes "Results" badge)
- `?variant=competitors` - Competitors page variant (includes "Competitors" badge)

Images use a dark, enterprise aesthetic with:
- Dark background (#0a0a0a)
- Subtle gradient overlays
- Plinth wordmark
- Variant-specific headline
- Tagline: "Strategy, grounded."

### Robots & Sitemap

- **`app/robots.ts`**: Disallows indexing of `/api/`, `/projects/`, `/dashboard`, `/auth/`, and `/login`
- **`app/sitemap.ts`**: Only includes the marketing home page (public routes only)

## Pages with Previews

| Page | Title | OG Variant | Indexable |
|------|-------|------------|-----------|
| `/` (home) | "Plinth — Strategy-grade competitive intelligence" | default | Yes |
| `/login` | "Sign in — Plinth" | default | No |
| `/projects/[projectId]/results` | "Results — Plinth" | results | No |
| `/projects/[projectId]/competitors` | "Competitors — Plinth" | competitors | No |

All other pages inherit global defaults.

## Testing

### Quick Local Test

1. Run the development server: `npm run dev`
2. Open a page (e.g., `http://localhost:3000`)
3. View page source and verify `<meta>` tags are present:
   - `og:title`
   - `og:description`
   - `og:image`
   - `twitter:card`
   - `twitter:title`
   - `twitter:description`
   - `twitter:image`

### OG Image Test

Test the OG image endpoint directly:
- `http://localhost:3000/api/og`
- `http://localhost:3000/api/og?variant=results`
- `http://localhost:3000/api/og?variant=competitors`

Images should render correctly at 1200x630px.

### Production Testing Tools

#### Facebook Sharing Debugger (Meta)
- URL: https://developers.facebook.com/tools/debug/
- Paste your production URL
- Click "Debug" to see how Facebook sees your page
- Click "Scrape Again" to clear cache and refresh preview

#### Twitter Card Validator
- Note: Twitter Card Validator was deprecated, but you can test by:
  1. Posting a link in a Twitter/X post (draft, don't publish)
  2. The preview should appear automatically
  3. Check that title, description, and image render correctly

#### LinkedIn Post Inspector
- URL: https://www.linkedin.com/post-inspector/
- Paste your production URL
- View how LinkedIn will render the preview

#### Slack
- Paste the URL in a Slack message (channel or DM)
- Slack will unfurl the preview
- If preview doesn't update after changes, use: `/unfurl_refresh <url>` command (Slack admins only)

#### Discord
- Paste the URL in a Discord message
- Discord will embed the preview
- Previews cache aggressively; changes may take time to appear

### Testing Checklist

For each page with custom metadata:

- [ ] Title appears correctly in preview
- [ ] Description appears correctly in preview
- [ ] OG image renders at correct size (1200x630)
- [ ] Image variant matches page context
- [ ] Twitter Card shows large image preview
- [ ] No sensitive data (project names, competitor names) in previews for private routes
- [ ] Canonical URL is set for marketing pages
- [ ] Private routes have `noindex` robots directive

## Caching & Cache Busting

Social platforms aggressively cache OG metadata and images. After making changes:

1. **Facebook/Meta**: Use Sharing Debugger's "Scrape Again" button
2. **Twitter/X**: May require waiting or using their API to refresh
3. **Slack**: Use `/unfurl_refresh <url>` command (admin only) or wait for cache expiry
4. **LinkedIn**: Use Post Inspector's refresh feature

To force image cache refresh, you can add a version query parameter:
```
/api/og?variant=default&v=2
```

However, the current implementation doesn't include versioning. If cache busting becomes necessary, consider adding a version parameter or hash to image URLs.

## Maintenance

### Adding a New Page with Custom Metadata

1. Create `generateMetadata()` function in the page file:
   ```ts
   import type { Metadata } from 'next';
   import { createPageMetadata } from '@/lib/seo/metadata';

   export async function generateMetadata(): Promise<Metadata> {
     return createPageMetadata({
       title: "Your Page Title — Plinth",
       description: "Your page description",
       path: "/your-path",
       ogVariant: "default", // or "results" or "competitors"
       robots: { index: false }, // if private
       canonical: true, // if public marketing page
     });
   }
   ```

2. For private routes, always set `robots: { index: false }`
3. Never include user data, project names, or competitor names in metadata for private routes
4. Test the preview using the tools above

### Adding a New OG Image Variant

1. Update `/app/api/og/route.tsx`:
   - Add variant to the type union
   - Add variant config in `variantConfig` object
   - Define headline and badge (if applicable)

2. Use the new variant in page metadata:
   ```ts
   ogVariant: "your-variant"
   ```

3. Test the image renders correctly at `/api/og?variant=your-variant`

## Troubleshooting

### Images Not Showing
- Verify `/api/og` route is accessible
- Check image URL is absolute (uses `metadataBase`)
- Ensure image renders correctly when accessed directly
- Check platform-specific requirements (some platforms have size limits)

### Metadata Not Updating
- Clear platform cache using tools above
- Verify `generateMetadata()` is exported correctly
- Check that metadataBase is set correctly in root layout
- Ensure page is using `generateMetadata()` not static `metadata` export

### Private Data Leaking
- Review all `generateMetadata()` functions for private routes
- Ensure no project names, competitor names, or user data in metadata
- Test previews for private routes to verify no leaks
- Use generic descriptions like "Results — Plinth" instead of "Project X Results"

## References

- [Next.js Metadata Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Next.js ImageResponse Documentation](https://nextjs.org/docs/app/api-reference/functions/image-response)

