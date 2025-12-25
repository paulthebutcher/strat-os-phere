# Sharing Metadata QA Guide

This document outlines how to test and verify sharing metadata (Open Graph, Twitter Cards, SEO) for Plinth marketing pages.

## What to Check

When sharing Plinth URLs, verify the following platforms show correct metadata:

1. **Slack preview**
   - Title, description, and image should appear
   - Image should be the OG image (1200×630)
   - No broken image placeholders

2. **iMessage preview**
   - Rich preview card should display
   - Title and description should be readable
   - Image should render correctly

3. **LinkedIn preview**
   - Open Graph metadata should display
   - Large image preview should work
   - Title and description should match the page

4. **Twitter/X card**
   - Should use `summary_large_image` card type
   - Large image should display (1200×630)
   - Title and description should be present

5. **Facebook preview**
   - Open Graph tags should work
   - Image and metadata should display correctly

## How to Test

### Using OG Debuggers

Use public Open Graph debugging tools to verify metadata:

1. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Enter the Plinth URL to test
   - Checks OG tags, image dimensions, and displays a preview

2. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Enter the Plinth URL to test
   - Shows how the card will appear on Twitter/X

3. **LinkedIn Post Inspector**
   - URL: https://www.linkedin.com/post-inspector/
   - Enter the Plinth URL to test
   - Validates LinkedIn-specific metadata

4. **OpenGraph.xyz**
   - URL: https://www.opengraph.xyz/
   - General-purpose OG tag validator
   - Shows all metadata tags and preview

### Manual Testing

1. **Copy a Plinth URL** (e.g., homepage, how-plinth-thinks, example page)
2. **Paste into Slack/iMessage** and wait for preview to generate
3. **Verify**:
   - Title matches page metadata
   - Description matches page metadata
   - Image appears (not broken or placeholder)
   - URL is correct

### Key Pages to Test

- `/` (Homepage)
  - Title: "Find your unfair advantage — Plinth"
  - Description: Default description about confidence boundaries
- `/how-plinth-thinks`
  - Title: "How Plinth thinks — Plinth"
  - Description: About turning signals into defensible calls
- `/trust`
  - Title: "Trust & confidence boundaries — Plinth"
  - Description: About inspectable evidence and assumptions
- `/example`
  - Title: "A real example — Plinth"
  - Description: About sample opportunities with confidence boundaries

## Environment Setup

### Required Environment Variable

Ensure `NEXT_PUBLIC_SITE_URL` is set in your deployment environment (e.g., Vercel):

- **Production**: Should be your production domain (e.g., `https://plinth.com`)
- **Preview/Staging**: Should match your preview URL (e.g., `https://preview-xyz.vercel.app`)
- **Local Development**: Falls back to `http://localhost:3000` automatically

### Verification

1. Check Vercel environment variables: Settings → Environment Variables
2. Ensure `NEXT_PUBLIC_SITE_URL` is set for the appropriate environments
3. After deployment, test with OG debuggers to confirm URLs are correct

## Common Issues

### Broken Images

- **Symptom**: OG image doesn't appear in previews
- **Check**: 
  - OG image API route is accessible (`/api/og?variant=default`)
  - Image dimensions are correct (1200×630)
  - Image URL is absolute (includes domain)

### Wrong Title/Description

- **Symptom**: Preview shows wrong or generic metadata
- **Check**:
  - Page exports `generateMetadata()` function
  - Metadata includes correct title and description
  - No caching issues (OG debuggers cache results - use "Fetch new scrape")

### Wrong Canonical URL

- **Symptom**: Canonical URL points to wrong domain or path
- **Check**:
  - `NEXT_PUBLIC_SITE_URL` is set correctly
  - `metadataBase` in base metadata is correct
  - Canonical URLs are absolute (include domain)

## Expected Metadata Structure

All pages should include:

```typescript
{
  title: "Page Title — Plinth",
  description: "Page description...",
  openGraph: {
    title: "Page Title — Plinth",
    description: "Page description...",
    url: "https://plinth.com/page-path",
    siteName: "Plinth",
    type: "website",
    images: [{
      url: "https://plinth.com/api/og?variant=default",
      width: 1200,
      height: 630,
      alt: "Page Title — Plinth"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Title — Plinth",
    description: "Page description...",
    images: ["https://plinth.com/api/og?variant=default"]
  },
  alternates: {
    canonical: "https://plinth.com/page-path"
  }
}
```

## After Deployment Checklist

- [ ] Test homepage preview on Slack
- [ ] Test homepage preview on iMessage
- [ ] Test homepage preview on LinkedIn
- [ ] Test homepage preview on Twitter/X
- [ ] Verify OG debuggers show correct metadata for all key pages
- [ ] Confirm canonical URLs are correct
- [ ] Confirm OG images render correctly (1200×630)
- [ ] Verify `NEXT_PUBLIC_SITE_URL` is set in production

