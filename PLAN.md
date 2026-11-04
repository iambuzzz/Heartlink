# HeartLink — Product Plan (working name)

Personalised, interactive gift pages that people make for someone they love — partner, mom, dad, brother, sister, best friend, kid — and send as a private link or QR code. The buyer adds names, photos, words, a song or voice note; the recipient opens a small interactive "world" on their phone.

Status (3 Nov 2026): **building.** Theme = Firefly Garden. Brand stays **HeartLink**. Built: homepage, Birthday builder, recipient experience, preview, sample gift, backend (Supabase + Razorpay) code, gift link page with WhatsApp preview card. Waiting on: Supabase + Razorpay accounts to switch payments on. Ideas backlog in section 12.

---

## 1. Market research (Oct–Nov 2026)

### India — direct competitors

| Site | Scale (their own claims) | Price | Notable |
|---|---|---|---|
| cutiepage.in (leader) | 70,000+ users, 20,000+ orders, 30,000+ pages, ~1.5 yrs old | ₹79–499 | 100+ templates; blank builder with 250+ components (scratch card, quiz, countdown, polaroid, boarding pass); creator marketplace (designers sell templates, earn per sale); own domain ₹20; links never expire; password lock; wedding invites ₹499; "mini" pages ₹49 for 30 days |
| dilsecraft.com | 4,163 gifts, 50 templates, 4.8★ (87 ratings) | ₹49–299 (shown as "₹499, 70% off") | Templates by feeling (Miss you, Birthday, Love, Sorry…); 16 desi "mini gifts" ₹49; date invites where the "No" button runs away and the answer comes back; AI love-letter writer; add-ons: seal until a time +₹9, WhatsApp delivery +₹19, own song; free edit after paying; link lives 12 months; Razorpay/Cashfree; Meta/Snap/Google ads + Instagram creators |
| wishcupid.in | 15,000+ built, 1,700+ paid (~11% pay) | ₹99–299 | 6 colour themes per template; voice note on a vinyl; pre-written lines in English/Hindi/Hinglish; Mother's/Father's Day; event invites "coming soon" |
| lovearea.in | 2,000 customers in 2 months | from ₹49 | Cheap & simple; confession, date-asking, cheer-up pages; Cashfree |
| giftfeels.com/in | "43,776 joined" | free to start | Grows via SEO: pages per city, country and phrase ("wife birthday wishes") |
| lovelydesign.in, surprizyy.in | small | ₹49–149 | Low-price lookalikes |

### Global

| Site | Price | Notable |
|---|---|---|
| openyourletter.com | ~₹369 one-time (Stripe) | 14 interactive card types: star map of a date, places map, wordle with a secret word, photo puzzle, voice memo, roulette |
| lovetale.app | free + monthly plan | 15 stages in one gift, open notifications, password on paid plan |
| LoveYuu | $6/yr, $10 lifetime | Went viral on TikTok; founder reports $30k+ total, recent revenue much lower |
| Tribute.co / Kudoboard (US) | $5–99 | **Group** video/card gifts — many people contribute to one gift. Proven category |

### Koi Koi (koikoiapp.com) — studied 3 Nov 2026

Made by Inkpen Labs Pvt Ltd. Claims 10K+ gifts, 2,461 reviews, 4.9★, "5,000+ gift packs sold". These claims don't add up (5,000 packs alone would be 25,000+ gifts), so treat them as marketing.

**Catalog:** only ~10 cards. Birthday, Proposal, Apology and Show Your Love run all year. The rest are timed to festivals: Garba invite, Navratri blessing, Diwali, a romantic Diwali card, Bhai Dooj, Dhanteras. They add a new card for each festival instead of building a big library.

**Builder (observed on /birthday):** a 6-step wizard, one question per screen, with music and sound effects.
1. Who's it for? Partner / Family / Friends, then the exact relation (Girlfriend, Wife…). **One template serves every relationship;** the wording changes with the relation.
2. Names (theirs, yours) and optional age
3. Pick a cake (3 choices)
4. "Balloons": 4 short reasons, **already filled in with suggestions** you can tap to swap
5. Up to 5 photos with a caption each. **"Do this later": photos can be added after paying**
6. Letter (500 characters max), with suggested letters in **English or Hinglish**

Then it plays the full recipient experience as a preview, with the paywall at the bottom: "Test's surprise is ready · ~~₹499~~ ₹199 · Unlock your private link". Payment is Razorpay. The link never expires.

**What the recipient sees (birthday):** tap to start → light the cake and make a wish → pop balloons, each revealing a message → photos → letter.

**Pricing:** ₹199 per gift (anchored at "₹499, 60% off"). Prepaid credit packs: 5 for ₹599, 10 for ₹999, valid 12 months, new cards included. Diwali pack: 5 for ₹499.

**Accounts:** no signup. The first visit silently creates an anonymous account (`/api/auth/anonymous`). Drafts are saved in the browser (`koikoi:draft:<card>`) and gifts are linked to a device ID (`/api/gifts?device_id=…`). There's an "Order History" page and an optional login. A `koikoi:bucket_no` key points to A/B testing (probably prices or copy).

**Tech:** Next.js (Turbopack) on Vercel, Razorpay Checkout, dotLottie animations, SVG artwork, mp3 sound effects.

**Marketing tools:** GA4, Google Ads remarketing, Meta Pixel + Conversions API, Microsoft Clarity, Amplitude (with session replay), Bing, Jumpp tracking, Cookiebot. They grow through **paid ads**. There are also SEO pages (`/cards/<type>`, `/blog`), WhatsApp support and Instagram (@koikoiapp).

**Lessons for us**
- A guided wizard with suggested text converts better than a blank form. People freeze at an empty letter box.
- Make one template work for every relationship, with relationship-aware wording. That's cheaper than building a template per relation.
- Show the full preview before payment. The paywall comes when the buyer is most excited.
- Let people add photos after paying, so the slowest step isn't in the way.
- Prepaid credit packs bring cash upfront and repeat use. Copy the model, not the screens.
- Release a new card for every festival.
- Use anonymous accounts plus browser drafts, so there's no signup wall.
- They don't have group gifts or reply-back. Our differentiators still stand.

### What everyone does
- Free to build and preview → pay once when publishing. No subscriptions in India.
- Fake struck-through "original" price.
- Private link + QR + optional password.
- Festival templates (Rakhi, Bhai Dooj, Navratri, Diwali) and Instagram creators for marketing.
- About 1 in 10 builders pay (WishCupid: 1,700 / 15,000).

### Gaps (our opening)
1. **Group gifts** — nobody in India's gift-page market does this well. Family makes one page for parents' 25th anniversary; friends/coworkers for a birthday or farewell. Higher price, and every contributor sees the product.
2. **Reply back** — recipient sends a voice note / selfie / written reply to the sender. Emotional payoff + turns the recipient into the next buyer.
3. **Family, not just couples** — ~80% of competitor templates are romantic.
4. **Quality over quantity** — a few polished experiences beat 100 average ones.

---

## 2. Positioning

"Gifts made by everyone who loves them." Group and family first; couples templates included because they're the steady earners.

## 3. MVP (Minimum Viable Product)

The smallest version people can use and pay for. Launch fast, learn, then add.

**In the MVP**
- Homepage + catalog filterable by **who it's for** and **the moment**
- Template page with a live demo
- Builder: guided step-by-step wizard (one question per screen) with suggested lines/letters in English + Hinglish; step 1 picks the relationship so one template adapts its wording; client-side photo compression; anonymous account + drafts saved without signup; phone/email asked only at checkout
- Full recipient-experience preview with the paywall on top; photos can be added after payment
- Payment: Razorpay (UPI, cards); webhook marks the gift paid
- Gift page: unguessable link, optional password, QR code, optional "lock until date", open notification to sender
- **Group contributions**: share link where others add a photo / message / voice note; creator sets a reveal date
- **Reply back**: recipient records a reaction or writes back
- "My gifts" dashboard: edit after paying, see opens, copy link/QR
- Admin: orders, refunds, template on/off, takedown of reported content
- 6–8 polished, original templates: Love story, Birthday, Sorry, Miss You (long distance), Proposal, For Mom/Dad, Siblings, Best Friend

**After launch**
- AI letter writer (English / Hindi / Hinglish)
- WhatsApp scheduled delivery
- More templates (toward 50+), colour themes
- Own-domain add-on
- Wedding & event invites
- Creator marketplace (designers sell templates)
- International (Stripe, USD pricing)

## 4. Template architecture

Each template = **a field schema** (names, photos[], lines[], letter, song, voice) **+ one renderer component**. The builder form is generated from the schema, so adding a template means designing it, not changing the app.

## 5. Tech stack

- Next.js (App Router) + TypeScript + Tailwind + Framer Motion
- Supabase: Postgres, auth (phone OTP / email magic link), storage — or Postgres + Cloudflare R2
- Razorpay (India); Stripe later for international
- An AI API for the letter writer (phase 2)
- Hosting: Vercel or Cloudflare. Must load fast on budget Android over 4G
- Analytics: PostHog + Meta pixel

**Main tables:** `users`, `templates`, `gifts` (slug, template_id, content JSON, status draft/paid, reveal_at, expires_at, password_hash), `media`, `contributions`, `replies`, `orders`, `events` (opens).

## 6. Pricing (starting point)

- Solo mini gift: ₹99
- Standard: ₹149–199
- Group gift: ₹299–999 (by number of contributors)
- Add-ons: timed unlock ₹19, WhatsApp delivery ₹29, voice note ₹29, own domain
- Credit packs (Koi Koi model): e.g. 5 gifts ₹599, 10 gifts ₹999, valid 12 months; festival packs
- International later: $4.99–9.99

## 7. Growth

- Instagram/Reels creators posting real reaction videos
- SEO pages per relationship × occasion ("birthday gift page for mom", "anniversary surprise for parents")
- "Made with ♡ on HeartLink" button at the end of every gift
- Festival calendar: Christmas/New Year → **Valentine's week 7–14 Feb 2027 (biggest)** → Holi → Mother's Day → Friendship Day → Rakhi → Karwa Chauth → Diwali → Bhai Dooj

## 8. Timeline

- **Phase 1 (~3 weeks):** MVP above. Live before Christmas / New Year.
- **Phase 2 (Dec → mid-Jan):** AI writer, more templates, WhatsApp delivery.
- **Phase 3 (Valentine's 2027):** big template drop, creator/affiliate push.

## 9. What the owner handles

- Brand name + domain (~₹1,000/yr)
- Razorpay account (sole proprietor with PAN + bank account works); needs terms, privacy and refund pages (drafts can be written for you)
- Instagram content
- Running costs at start: ~₹0–2,500/month hosting + ~2% Razorpay fee per payment

## 10. Ground rules

- All templates, designs and copy are original. Competitors were studied only through their public pages for business model and features — no copying of their code, designs or text.

## 11. Open decisions

- [ ] Market: India first (recommended) or global?
- [ ] Final brand name (HeartLink is a placeholder)
- [x] Study Koi Koi (koikoiapp.com) — done 3 Nov 2026, see section 1
- [ ] Go-ahead to start building Phase 1

## 12. Ideas backlog (3 Nov 2026)

**Approved by owner — build next:** blow into the mic to blow out candles · soft music + chimes · voice note in the jar · WhatsApp preview card (done).

**From research** (what people say made them cry):
- *Letters from everyone* — e.g. 30 letters from friends, family, teachers for a 30th birthday; a son recording mom's friends talking about her. → validates **group gifts** as the core feature.
- *"Open when…" letters* — the most repeated long-distance idea: open when you miss me / can't sleep / had a fight / need to smile.
- *Runaway "No" button* proposals and clickable envelopes / polaroids are common in existing builders — expected basics, not differentiators.

**New ideas to pitch:**
1. **Open-when jar** (long distance): several sealed fireflies, each labelled with a mood; optionally one unlocks per day.
2. **Valentine's week drip** (7–14 Feb): one new surprise unlocks each day, Rose Day → Valentine's Day. Built for our biggest season.
3. **Love coupons**: "1 Maggi at 2 a.m.", "a no-phone date". The recipient taps Redeem and the sender gets notified.
4. **Reaction reply**: after opening, the recipient can send a 5-second selfie video or voice reply back (with permission). Senders post these as Reels, which markets us for free.
5. **Parents mode**: bigger text, full Hindi, one big button per screen, so Maa and Papa can open it without help.
6. **QR gift tag**: a printable card or sticker for physical gifts; scanning it opens the page.
7. **"How well do you know me" quiz** before the letter, with cute fail messages.
8. **Countdown teaser link**: "Something's coming for you in 2 days…" before the reveal, to build anticipation.
9. **Firefly initials**: in the finale, fireflies arrange into their initials.
10. **Our song**: a YouTube/Spotify link that starts at the letter moment.

Sources: [QLovy](https://qlovy.com/en/blog/gift-for-girlfriend), [BeMyVal](https://peerlist.io/valys/project/bemyval---date-proposal-website-maker), [Open-when ideas](https://twodrifters.us/blog/open-when-letter-ideas.html), [AOL / Ask Reddit roundup](https://www.aol.com/excuse-while-cry-55-most-061335290.html), [Substack: best gift ever](https://mixedprints.substack.com/p/pawn-shop-finds-poems-and-great-sex).

## 13. Decisions & roadmap (3 Nov 2026)

**Decisions**
- Brand: **HeartLink**. Theme: **Firefly Garden**.
- Data: **Supabase** (Postgres + private storage), server-side only with the service-role key; buyers stay anonymous via a device cookie.
- Payments: **Direct UPI + UTR** (no gateway, 0% fee). Payments go to a business UPI ID (PhonePe/Paytm/BharatPe for Business); P2M payments up to ₹2,000 carry zero MDR.
  - Each order gets a unique amount (₹99.01–₹99.99), so every bank credit maps to exactly one order. An unpaid order frees its amount after 2 hours; a claimed one holds it for 48 hours.
  - The buyer pays, enters the 12-digit UTR, and the link unlocks instantly.
  - The admin checks UTRs in `/admin` against the bank statement and verifies or rejects them. A reject pauses the gift.
  - Razorpay and YouPI-PG were considered and rejected. YouPI-PG's own docs say it is experimental, allows one buyer at a time, and needs a manual CSV.
  - We move to automatic confirmation when volume needs it.

**Done**
- Homepage, Birthday builder and gift experience.
- Mic blow-out, Jhappi (hug) button, polaroid-develop photos, hidden fireflies with a secret note.
- UPI checkout, admin review, `/g/<slug>` gift page with a WhatsApp preview card, share page.

**Next (owner-approved)**
1. Soft music + chimes (done: synthesised in src/lib/sound.ts, no audio files; mute button remembers the choice).
2. Voice note in the jar (done: builder step records up to 60s, stored privately, plays from a jar after the letter).
3. Paper-plane reply (done: text and/or 30s voice, max 30 per gift, shown on My gifts).
4. "My gifts" page (done: /gifts, per device; opens, jhappis, replies, share, schedule, QR tag).
5. New templates (done): Open When ₹99 · Know-me Quiz ₹79 · Chat Replay ₹99 · Pinky Promise ₹49, each with a /sample page.
6. Valentine's week (done, ₹199): 8 days from a chosen start date; future days never leave the server.
7. QR gift tag (done: /g/<slug>/tag, print-ready).
8. Countdown teaser + timed unlock (done: sender seals until a time; the link shows a countdown and an .ics reminder; content is withheld until then).
