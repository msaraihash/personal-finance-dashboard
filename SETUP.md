# WealthPath Setup - Manual Steps

## 1. Add Custom Domain to Cloudflare Pages

Since you've already purchased `wealthpath.ca`, you need to add it to your Pages project:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Click on your **wealthpath** project
4. Go to **Custom domains** tab
5. Click **Set up a custom domain**
6. Enter `wealthpath.ca` and click **Continue**
7. Cloudflare will automatically configure DNS if the domain is in your account

Once complete, your site will be live at **https://wealthpath.ca**

---

## 2. Create Buy Me a Coffee Account

1. Go to [buymeacoffee.com](https://buymeacoffee.com)
2. Sign up and choose your username (e.g., `wealthpath`)
3. Copy your profile URL (e.g., `https://buymeacoffee.com/wealthpath`)
4. Update the link in `src/components/LandingPage.tsx` line 250

---

## 3. Get Affiliate Links

### Wealthsimple
1. Sign up for their [referral program](https://help.wealthsimple.com/hc/en-ca/articles/4408382062107)
2. Replace the placeholder link in `LandingPage.tsx` line 326

### Questrade
1. Sign up for their [affiliate program](https://www.questrade.com/affiliate)
2. Replace the placeholder link in `LandingPage.tsx` line 351

---

## Quick Commands

After making updates:
- **Test locally**: `npm run dev`
- **Deploy**: `npm run deploy`
