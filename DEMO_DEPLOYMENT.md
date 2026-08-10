# Desert Air HVAC Demo Site — Deployment Guide

## ✅ What's Built

### Homepage (`/`)
- **Hero Section** — Company name, tagline, phone CTA, "Book Now" button
- **Services Grid** — 6 service cards: AC repair, heating, plumbing, drain cleaning, water heater install, 24/7 emergency
- **Trust Bar** — 15+ years, licensed/insured, 4.9★ 200+ reviews, same-day service
- **Service Area** — Las Vegas Valley coverage map: Henderson, Paradise, Spring Valley, Boulder City, etc.
- **CTA Section** — Final call to action with phone and chat options
- **Footer** — Contact info, service links, hours, social placeholders

### Maya Chatbot Widget
- **Floating chat bubble** — Bottom-right, all pages, mobile-optimized
- **AI-Powered Flow** — Uses Claude Sonnet 4.6 to collect:
  1. Service type (AC, heating, plumbing, emergency)
  2. Urgency level
  3. Customer name & phone
  4. Service address
  5. Appointment slot confirmation
- **One-click booking** — Claude tool use triggers `POST /api/intake` → saves to in-memory database
- **Smart handoff** — If chat doesn't resolve, direct link to call `(702) 555-0147`

### Design & UX
- **Color scheme** — Blue/orange (HVAC-associated), trust-forward
- **Mobile-first** — Fully responsive, assumed view on phone during sales calls
- **Fast** — Built with Next.js 16 + Tailwind CSS, zero-dependency bloat
- **Modern look** — Outclasses typical contractor sites visually (design goal: prospect says "yes" on the call)

---

## 🚀 Deploy to Vercel

### Step 1: Set Environment Variables
Create these in your Vercel project settings:

```
ANTHROPIC_API_KEY=sk-ant-v0-...  # From https://console.anthropic.com/
```

### Step 2: Deploy the Branch
```bash
git push -u origin claude/terminal-code-rimhv8
```

Then visit: `https://github.com/kaistats/hvac/pull/new/claude/terminal-code-rimhv8`

Click **"Create Pull Request"** → Vercel will auto-preview at:
```
https://hvac-claude-terminal-code-rimhv8.vercel.app
```

Once merged to `main`, the site goes live at your main domain.

### Step 3: Test the Preview
1. Open the Vercel preview on your phone
2. Click "Book Now" or the chat bubble
3. Go through the Maya flow: "AC not cooling" → name/phone → confirm time slot
4. Should see booking confirmation

---

## 💾 Next Steps: Supabase Integration

### Currently: In-Memory Bookings
Bookings are stored in `/lib/bookings.ts` and lost on deploy. For persistence:

### Add Supabase:
1. Create a project at https://supabase.com
2. Create table `demo_leads`:
   ```sql
   CREATE TABLE demo_leads (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     customer_name TEXT NOT NULL,
     phone TEXT NOT NULL,
     service_type TEXT NOT NULL,
     urgency TEXT,
     address TEXT,
     slot TEXT,
     notes TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```
4. Update `/lib/bookings.ts` to use Supabase instead of in-memory

---

## 📞 Real Twilio Integration

The intake API structure is ready for SMS. Currently:
- Bookings save but don't trigger SMS
- To enable: Add Twilio credentials to env, import Twilio SDK, call `twilio.messages.create()` in `/api/intake/route.ts` after successful booking

One-line swap: When ready, replace the mock booking with a real Twilio SMS.

---

## 🔑 Environment Variables Checklist

**Required (to deploy):**
- [ ] `ANTHROPIC_API_KEY` — Anthropic API key

**Optional (for persistence):**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Supabase service key

**Optional (for real SMS):**
- [ ] `TWILIO_ACCOUNT_SID` — Twilio account ID
- [ ] `TWILIO_AUTH_TOKEN` — Twilio auth token
- [ ] `TWILIO_FROM_NUMBER` — Twilio phone number for outbound SMS

---

## 🎯 Demo Flow for Sales Calls

1. **Send prospect this URL** (Vercel preview link):
   ```
   https://hvac-claude-terminal-code-rimhv8.vercel.app
   ```

2. **They open on their phone** → Hero section shows immediately

3. **You say**: "This is what I build. Responsive, modern, AI-powered scheduling. Let me show you the chat..."

4. **Click "Book Now"** → Maya pops up, asks what they need

5. **They say**: "AC repair" → Maya collects name, phone, address, confirms time

6. **They see**: Booking confirmation in the chat

7. **Prospect reaction**: "This is exactly what we need. Can you build this for us with our branding?"

8. **Your response**: "Yes. I clone this template, swap your logo/colors/city, and deploy in 30 minutes. Let's go."

---

## 📋 What Prospects Will See

| Section | Content |
|---------|---------|
| Hero | "Desert Air HVAC & Plumbing" + 24/7 badge + call/book CTAs |
| Services | 6 polished cards with icons (AC, heating, plumbing, drain, water heater, emergency) |
| Trust | "15+ years" / "Licensed" / "4.9★" / "Same-day" |
| Service Area | Map-style coverage grid (Henderson, Paradise, etc.) |
| CTA | Final "Call Now / Chat with Us" buttons |
| Footer | Hours, contact, links |
| Chat | Maya bubbles up on any page, guides them to booking |

---

## ⚠️ Customization for Actual Client Sites

Once a prospect says yes:

1. **Clone this repo**
2. **Replace constants**:
   - `PHONE` in `ChatWidget.tsx` → their number
   - `"Desert Air HVAC & Plumbing"` → their company name
   - Service area cities in `page.tsx` → their service area
   - Trust bar numbers (years, reviews) → their actual numbers
   - Colors: Adjust `from-blue-900` / `to-orange-500` to match their branding
3. **Redeploy to Vercel** under their subdomain (e.g., `myplumber-demo.vercel.app`)
4. **Done in ~30 minutes**

This template is the blueprint—use it for every new prospect.

---

## 🐛 Troubleshooting

**Chat not responding?**
- Check `ANTHROPIC_API_KEY` is set in Vercel
- Check `/api/intake` route exists and builds
- Browser console for errors (F12)

**Booking not saving?**
- In-memory store only persists during current session
- Integrate Supabase (see above) for permanent storage

**Phone number not clickable?**
- Ensure `PHONE_HREF` matches standard `tel:` format
- Test on actual phone (simulator may not support tel: links)

---

## 📊 Analytics & Next Steps

Track:
- [ ] Vercel page view count
- [ ] Booking submissions (track in Supabase once integrated)
- [ ] Chat engagement (how many open the widget)
- [ ] Conversion rate (prospects who book vs. who land)

Iterate:
- [ ] A/B test hero image/copy
- [ ] Test different CTA button text
- [ ] Monitor Lighthouse score for performance
- [ ] Add Google Analytics

---

**Created**: August 10, 2026  
**Status**: Ready to preview and deploy  
**Next milestone**: Send preview link to first prospect, gather feedback, integrate Supabase
