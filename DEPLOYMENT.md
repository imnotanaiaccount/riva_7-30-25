# 🚀 Riva Portfolio - FREE Tier Deployment Guide

## ✅ All Services Use FREE Tiers (Zero Costs)

### 1. Environment Variables Setup

Create a `.env.local` file in your root directory with:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# n8n Webhook (FREE tier: 1,000 executions/month)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/lead-capture

# Brevo Email Service (FREE tier: 300 emails/day)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@riva.com
NOTIFICATION_EMAIL=hello@riva.com
```

### 2. Supabase Database Setup (Free Tier)

1. Create a Supabase project at https://supabase.com (Free tier)
2. Create a `leads` table with this SQL:

```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  project_type TEXT NOT NULL,
  message TEXT NOT NULL,
  newsletter BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. Get your project URL and anon key from Settings > API

### 3. n8n Setup (FREE Tier)

1. Go to https://n8n.io and create a free account
2. Create a webhook trigger
3. Add your automation workflow (email notifications, CRM integration, etc.)
4. Copy the webhook URL to your environment variables

**FREE Tier Limits:**
- ✅ 1,000 executions/month
- ✅ 5 active workflows
- ✅ All core features included

### 4. Brevo Setup (FREE Tier)

1. Go to https://brevo.com and create a free account
2. Get your API key from Settings > API Keys
3. Set up your sender email (verify your domain)

**FREE Tier Limits:**
- ✅ 300 emails/day
- ✅ 2,000 contacts
- ✅ All email features included

### 5. Netlify Deployment (Free Tier)

**Build Settings:**
- Build Command: `npm run build`
- Publish Directory: `.next`
- Node Version: 18

**Environment Variables in Netlify Dashboard:**
- Go to Site Settings > Environment Variables
- Add all variables from `.env.local`

**Free Tier Limits:**
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ 125,000 function invocations/month
- ✅ Unlimited sites

### 6. FREE Tier Services Summary

| Service | Free Tier | What We Use |
|---------|-----------|-------------|
| **Netlify** | 100GB bandwidth | Hosting & Functions |
| **Supabase** | 50,000 rows | Lead storage |
| **n8n** | 1,000 executions/month | Automation |
| **Brevo** | 300 emails/day | Email notifications |
| **Next.js** | Free | Framework |
| **Tailwind CSS** | Free | Styling |

### 7. Build & Test

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test locally
npm start
```

## Post-Deployment Checklist

### ✅ Test All Functionality

- [ ] Contact form submission works
- [ ] Form validation works
- [ ] Lead data saves to Supabase
- [ ] n8n webhook receives data
- [ ] Brevo sends email notifications
- [ ] All links work correctly
- [ ] Mobile responsiveness
- [ ] Loading performance

### ✅ Monitor FREE Tier Usage

**Netlify Dashboard:**
- Check bandwidth usage
- Monitor function invocations
- Review build minutes

**Supabase Dashboard:**
- Monitor database rows
- Check API calls
- Review storage usage

**n8n Dashboard:**
- Monitor execution count
- Check workflow status
- Review webhook performance

**Brevo Dashboard:**
- Monitor email sends
- Check delivery rates
- Review contact count

### ✅ Performance Optimization

Already optimized for free tiers:
- ✅ Next.js 14 with SWC minification
- ✅ Optimized images
- ✅ Tailwind CSS purging
- ✅ Lazy loading
- ✅ Optimized fonts

## Troubleshooting

### Common Issues:

1. **Build Errors:**
   ```bash
   npm run build
   # Check for any errors
   ```

2. **Environment Variables:**
   - Ensure they're added to Netlify dashboard
   - Check variable names match exactly
   - Redeploy after adding variables

3. **Contact Form Not Working:**
   - Verify Supabase credentials
   - Check browser console for errors
   - Test Netlify function directly

4. **n8n Not Receiving Data:**
   - Verify webhook URL is correct
   - Check n8n workflow is active
   - Monitor execution logs

5. **Brevo Not Sending Emails:**
   - Verify API key is correct
   - Check sender email is verified
   - Monitor email logs

6. **Free Tier Limits:**
   - Monitor usage in all dashboards
   - Optimize if approaching limits

## Maintenance

### Monthly Tasks:
- [ ] Check Netlify usage
- [ ] Monitor Supabase usage
- [ ] Check n8n execution count
- [ ] Monitor Brevo email usage
- [ ] Test contact form
- [ ] Update dependencies

### Updates:
```bash
npm update
npm audit fix
npm run build
# Redeploy on Netlify
```

## FREE Tier Guarantee

**Your site will never incur costs because:**
- ✅ All services use FREE tiers only
- ✅ n8n: 1,000 executions/month (plenty for portfolio)
- ✅ Brevo: 300 emails/day (more than enough)
- ✅ Supabase: 50,000 rows (years of leads)
- ✅ Netlify: 100GB bandwidth (months of traffic)
- ✅ No external API calls that could charge

---

**Your site is ready for FREE tier deployment! 🎉** 