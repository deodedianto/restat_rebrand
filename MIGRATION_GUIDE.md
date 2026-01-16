# Blog Migration Guide - SEO-Preserving Migration

## ✅ Completed Infrastructure

All the code infrastructure for SEO-preserving blog migration has been implemented:

### 1. MDX Processing System
- ✅ `lib/mdx.ts` - Complete MDX utilities for reading and parsing blog posts
- ✅ `app/artikel/[category]/[slug]/page.tsx` - Dynamic routes with `generateMetadata` for SEO
- ✅ `app/artikel/page.tsx` - Updated listing page with dynamic content
- ✅ `app/api/articles/route.ts` - API endpoint for fetching articles

### 2. Redirect System
- ✅ `lib/blog-redirects.ts` - Complete mapping of all 37 old slugs to new URLs
- ✅ `next.config.ts` - 301 redirects configured (backup for Vercel)
- ✅ `netlify.toml` - 37 explicit redirect rules for Netlify (PRIMARY)

### 3. SEO Infrastructure
- ✅ `next-sitemap.config.js` - Sitemap configuration
- ✅ `package.json` - Postbuild script added

### 4. Dependencies Installed
- ✅ next-mdx-remote
- ✅ gray-matter
- ✅ reading-time
- ✅ next-sitemap (dev dependency)

---

## 🔴 MANUAL STEPS REQUIRED

### Step 1: Copy Blog Content

Run these commands to copy all 37 MDX files:

```bash
cd /Users/ddedia1/Documents/GitHub/restat_rebrand

# Create directories (may already exist)
mkdir -p content/posts/{interpretasi-uji-statistik,metode-penelitian,metode-statistik,software-statistik,tutorial-analisis-statistik}

# Copy all content
cp -r /Users/ddedia1/Documents/GitHub/restatblog/blog/content/posts/* content/posts/

# Verify files copied
find content/posts -name "index.mdx" | wc -l
# Should return: 37
```

### Step 2: Update Internal Links in MDX Files

Replace old domain references with new ones:

```bash
cd /Users/ddedia1/Documents/GitHub/restat_rebrand/content/posts

# Find all references to old blog domain
grep -r "blog.restatolahdata.id" .

# Replace with new domain structure
find . -name "*.mdx" -exec sed -i '' 's|https://blog.restatolahdata.id/|/artikel/|g' {} +

# Verify replacements
grep -r "blog.restatolahdata.id" .
# Should return: 0 results
```

**Note:** You may need to manually adjust some links to include the correct category path.

### Step 3: Deploy to Vercel

```bash
# Make sure all changes are committed
git add .
git commit -m "feat: implement blog migration infrastructure"
git push origin main

# Deploy to Vercel (if not auto-deployed)
vercel --prod
```

### Step 4: Deploy Netlify Redirects

```bash
cd /Users/ddedia1/Documents/GitHub/restatblog/blog

# Commit and push netlify.toml
git add netlify.toml
git commit -m "feat: add 301 redirects for blog migration"
git push origin main

# Netlify will auto-deploy
```

### Step 5: Test Redirects

After both deployments are live:

```bash
# Test a few sample redirects
curl -I https://blog.restatolahdata.id/cara-membaca-hasil-output-amos

# Should return:
# HTTP/1.1 301 Moved Permanently
# Location: https://restatolahdata.id/artikel/interpretasi-uji-statistik/cara-membaca-hasil-output-amos

# Test more URLs
curl -I https://blog.restatolahdata.id/cara-uji-one-way-anova-di-spss
curl -I https://blog.restatolahdata.id/download-spss-gratis
```

### Step 6: Verify SEO Metadata

Visit 3-5 article pages and check:

1. **View Page Source** (Right-click → View Page Source)
2. **Check for these tags:**
   - `<title>` - Should contain article title
   - `<meta name="description">` - Should contain description
   - `<link rel="canonical">` - Should point to `restatolahdata.id/artikel/...`
   - `<meta property="og:title">` - Open Graph for social sharing

### Step 7: Verify Sitemap

```bash
# Visit sitemap URL
open https://restatolahdata.id/sitemap.xml

# Should show all pages including artikel pages
```

Count URLs:
```bash
curl -s https://restatolahdata.id/sitemap.xml | grep -c "<url>"
# Should be 37+ (all artikel posts plus other pages)
```

### Step 8: Google Search Console Setup

#### A. Verify Both Properties

1. **Old Property:** `blog.restatolahdata.id`
   - Keep this active (don't delete!)
   - Used to monitor traffic drop-off
   
2. **New Property:** `restatolahdata.id`
   - Should already exist
   - Will cover `/artikel` automatically

#### B. Submit Sitemap

Within 1 hour of launch:

1. Go to Google Search Console
2. Select property: `restatolahdata.id`
3. Navigate to: Sitemaps → Add new sitemap
4. Enter: `https://restatolahdata.id/sitemap.xml`
5. Click Submit

#### C. Monitor First 24 Hours

| Hour | Check | Expected | Action if Not |
|------|-------|----------|---------------|
| 0-1 | Sitemap submitted | Status: "Success" | Resubmit |
| 0-2 | Test 10 old URLs | All redirect | Fix Netlify config |
| 4-8 | Old GSC property | Impressions dropping | Check redirects |
| 8-24 | New GSC property | New URLs appearing | Request indexing manually |

---

## 📊 VALIDATION CHECKLIST

Before announcing migration is complete:

### Content Integrity
- [ ] All 37 MDX files in `content/posts/`
- [ ] All images displaying correctly
- [ ] Run: `find content/posts -name "*.mdx" | wc -l` → Should return 37

### URL & Redirects
- [ ] All 37 redirects in `lib/blog-redirects.ts`
- [ ] Test 5 redirects return HTTP 301
- [ ] Location headers show correct new URLs

### Metadata (MOST CRITICAL)
- [ ] Visit 3 artikel pages, view source
- [ ] Each has `<title>` tag
- [ ] Each has `<meta name="description">`
- [ ] Each has canonical tag pointing to NEW domain
- [ ] Run: `curl -s https://restatolahdata.id/artikel/interpretasi-uji-statistik/cara-membaca-hasil-output-amos | grep canonical`

### Sitemap & Discoverability
- [ ] Visit `https://restatolahdata.id/sitemap.xml` - loads successfully
- [ ] Sitemap contains 37+ URLs
- [ ] Visit `https://restatolahdata.id/robots.txt` - allows crawling
- [ ] Robots.txt includes sitemap URL

### Internal Links
- [ ] Run: `grep -r "blog.restatolahdata.id" content/posts/` → Should return 0
- [ ] Click 5 random article links - all load correctly

### Google Search Console
- [ ] Old property verified: `blog.restatolahdata.id`
- [ ] New property verified: `restatolahdata.id`
- [ ] Sitemap submitted to new property

---

## 📈 POST-LAUNCH MONITORING

### Week 1: The Dip (NORMAL)
- **Expected:** Traffic drops 10-30%
- **Check Daily:** GSC for errors
- **Action:** Screenshot metrics as baseline

### Week 2: Recovery Begins
- **Expected:** 15-25 URLs indexed in new property
- **Check:** Old property impressions dropping
- **Action:** Document any ranking drops >5 positions

### Week 3-4: Stabilization
- **Expected:** Traffic recovers to 70-90%
- **Check:** All 37 URLs indexed
- **Action:** Identify struggling posts, review metadata

### Month 2+: Success
- **Expected:** Traffic equals or exceeds original
- **Check:** Rankings stable
- **Action:** Remove old GSC property (after 3 months)

---

## 🚨 TROUBLESHOOTING

### Problem: Old URLs return 404
**Diagnosis:** Netlify redirects not deployed
**Fix:** Redeploy `netlify.toml` to Netlify

### Problem: Redirects show 302 (not 301)
**Diagnosis:** Wrong status code
**Fix:** Change `status: 302` to `status: 301` in netlify.toml

### Problem: No traffic on new site
**Diagnosis:** Redirects aren't firing OR DNS issue
**Fix:** Test redirects manually with curl, verify DNS

### Problem: Canonical tags point to old domain
**Diagnosis:** Metadata generation issue
**Fix:** Check `generateMetadata` in `app/artikel/[category]/[slug]/page.tsx`

### Problem: Traffic drops >50%
**Diagnosis:** Major issue with redirects or metadata
**Fix:**
1. Test all redirects immediately
2. Verify canonical tags
3. Check GSC for 404 errors
4. Request indexing for top 10 posts in GSC

---

## ✅ SUCCESS CRITERIA

Migration is successful when:

1. ✅ All 37 old URLs return 301 redirects
2. ✅ All 37 new URLs indexed in GSC
3. ✅ Traffic recovers to 90%+ of pre-migration
4. ✅ Rankings stable within ±3 positions
5. ✅ 0 (zero) 404 errors in GSC
6. ✅ All metadata pointing to new domain

---

## 📞 SUPPORT

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Review the migration plan: `.cursor/plans/blog_seo_migration_plan_*.plan.md`
3. Verify all validation checklist items
4. Check Google Search Console for specific errors

**Remember:** 2-4 weeks of traffic volatility is NORMAL. Don't panic during Week 1-2!
