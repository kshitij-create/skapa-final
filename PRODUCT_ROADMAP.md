# SKAPA - Product Roadmap & Feature Backlog

**Current Status:** Frontend Demo Mode with beautiful UI + Mock Data  
**Goal:** Build a complete, social music app that Gen Z will love

---

## 🎯 Phase 1: Core Foundation (Make It Real)

### Priority: P0 (Must Have - Next 2-4 Weeks)

#### 1. **Connect Real Spotify** 🎵
- [ ] Get Spotify Premium account
- [ ] Implement OAuth login flow
- [ ] Fetch real "now-playing" data
- [ ] Auto-refresh listening status
- [ ] Display real album covers
- [ ] Show actual play progress

**Why:** This is the core value proposition. Without real Spotify data, it's just a pretty demo.

---

#### 2. **Backend & Database** 🔧
**Option A: Firebase (Recommended - Easiest)**
- [ ] Set up Firebase project
- [ ] Configure Firestore database
- [ ] Implement Firebase Auth
- [ ] Deploy Cloud Functions for Spotify
- [ ] Real-time sync with Firestore

**Option B: Fix Render.com/Fly.io**
- [ ] Deploy Python backend successfully
- [ ] Set up MongoDB Atlas
- [ ] Configure environment variables
- [ ] Test all API endpoints

**Why:** Need persistent data and real-time sync for multiplayer features.

---

#### 3. **User Authentication** 🔐
- [ ] Spotify-based login (primary)
- [ ] Profile creation on first login
- [ ] Unique username/handle system
- [ ] Save user preferences
- [ ] Session management
- [ ] Logout functionality

**Why:** Users need accounts to save their data and connect with friends.

---

#### 4. **Real GPS Locations** 📍
- [ ] Request location permissions
- [ ] Get device GPS coordinates
- [ ] Update user location in real-time
- [ ] Privacy controls (show/hide location)
- [ ] Fuzzy location (approximate, not exact)
- [ ] Location-based friend discovery

**Why:** Makes the map actually useful - see friends nearby, not random cities.

---

## 🚀 Phase 2: Social Features (Make It Multiplayer)

### Priority: P1 (High Priority - Weeks 3-6)

#### 5. **Friend System** 👥
- [ ] Search users by username/name
- [ ] Send friend requests
- [ ] Accept/reject requests
- [ ] Friend list management
- [ ] Remove friends
- [ ] See friends' listening activity
- [ ] Friends-only vs public toggle

**Why:** Core social feature. Without friends, it's a solo experience.

---

#### 6. **Notifications** 🔔
- [ ] Push notifications (Expo Notifications)
- [ ] Friend request alerts
- [ ] "Friend started listening" alerts
- [ ] Room invitations
- [ ] New drop nearby alerts
- [ ] Notification settings/preferences
- [ ] In-app notification center (already in UI)

**Why:** Keep users engaged and coming back to the app.

---

#### 7. **Enhanced Rooms** 📻
- [ ] Room chat (text messages)
- [ ] Voice chat integration (Agora/Twilio)
- [ ] Reactions with sound effects
- [ ] Host controls (kick users, mute)
- [ ] Room invitations to friends
- [ ] Private rooms (invite-only)
- [ ] Room history & replays
- [ ] Scheduled listening parties

**Why:** Makes rooms more interactive and sticky.

---

#### 8. **Drops Enhancement** 📍
- [ ] Reaction types (wave, fire, heart)
- [ ] Comments on drops
- [ ] Drop notifications when nearby
- [ ] Your drops history
- [ ] Trending drops
- [ ] Drop leaderboard (most popular)

**Why:** Makes the map more interactive and engaging.

---

## 🎨 Phase 3: Engagement Features (Make It Addictive)

### Priority: P2 (Medium Priority - Weeks 6-10)

#### 9. **Sonic DNA Matching** 🧬
**AI-powered music compatibility**
- [ ] Analyze user's Spotify listening history
- [ ] Calculate music taste vectors
- [ ] Match users with similar taste
- [ ] "Match %" score (e.g., "87% match with Priya")
- [ ] Discover new friends via taste
- [ ] "Your music twin" feature

**Algorithm Ideas:**
- Genre overlap
- Artist overlap
- Mood patterns (listen to sad music at night?)
- Obscurity score (mainstream vs indie)
- Listening intensity (casual vs obsessed)

**Why:** Unique differentiator. Helps users find meaningful connections through music.

---

#### 10. **Weekly Wrapped** 📊
**Personal music insights (like Spotify Wrapped)**
- [ ] Top 5 tracks this week
- [ ] Top 3 artists
- [ ] Total listening hours
- [ ] Most active listening time
- [ ] Mood breakdown
- [ ] New discoveries count
- [ ] Share as beautiful image/story

**Why:** Users love personal insights. Highly shareable.

---

#### 11. **Streaks & Achievements** 🏆
- [ ] Daily listening streak
- [ ] Achievements system:
  - "Night Owl" (listen after midnight 7 days)
  - "Explorer" (100 new tracks discovered)
  - "Social Butterfly" (join 50 rooms)
  - "Tastemaker" (10 friends tuned into your drops)
  - "Loyal Fan" (listen to same artist 5 days straight)
- [ ] Achievement badges on profile
- [ ] Leaderboards (friends only)

**Why:** Gamification increases retention and engagement.

---

#### 12. **Artist Drops & Events** 🎤
**Exclusive first-listen events**
- [ ] Artists can create "drop" events
- [ ] Countdown timer to release
- [ ] Virtual listening party at drop time
- [ ] Limited edition badges for attendees
- [ ] Chat with other fans during event
- [ ] Integration with Spotify for Fans API

**Example:** "Travis Scott drops Utopia in 2 hours. 1,247 fans waiting."

**Why:** Creates FOMO and exclusive experiences. Great for artist partnerships.

---

#### 13. **Vibe Feed** 🌊
**Alternative to social media feed (but without posting pressure)**
- [ ] Auto-generated stories from listening activity
  - "Arnav is on a Late Night vibe for 3 days 🌊"
  - "Priya discovered 12 new artists this week 🔥"
  - "Marcus and 5 friends all listening to Travis Scott"
- [ ] No manual posting required (passive social)
- [ ] React to friends' vibe moments
- [ ] "Vibe twins" - see when you match friends' moods

**Why:** Social engagement without the pressure of creating content.

---

## 💎 Phase 4: Premium Features (Monetization)

### Priority: P2 (Revenue - Weeks 10-14)

#### 14. **SKAPA Pro Subscription** ⭐
**₹149/month or ₹1,499/year**

**Features:**
- [ ] Unlimited room hosting (vs 3/week free)
- [ ] Custom room themes/backgrounds
- [ ] Priority room discovery
- [ ] Advanced stats & insights
- [ ] Ad-free experience
- [ ] Custom profile themes
- [ ] Early access to new features
- [ ] "Pro" badge on profile

**Why:** Core revenue stream. Pays for servers and development.

---

#### 15. **Token Economy** 💰
**Gift tokens to artists and room hosts (like Twitch Bits)**

**Features:**
- [ ] Buy token packs (₹49 for 100, ₹199 for 500)
- [ ] Gift tokens in rooms
- [ ] Animated gift effects (fireworks, confetti)
- [ ] Top gifters leaderboard
- [ ] Artists/hosts cash out tokens
- [ ] Token balance on profile

**Revenue Split:** 70% to creator, 30% to SKAPA

**Why:** Additional revenue + empowers creators.

---

#### 16. **Label Insights Dashboard** 📈
**B2B Product for Record Labels**

**Features:**
- [ ] Real-time engagement metrics
- [ ] Genre/mood trends by city
- [ ] Artist hype tracking
- [ ] Pre-release sentiment analysis
- [ ] Demographic breakdown
- [ ] Export reports

**Pricing:** Custom enterprise pricing (₹50,000-5,00,000/month)

**Target:** Universal, Sony, Warner, T-Series, etc.

**Why:** High-margin B2B revenue. Labels pay a lot for early signals.

---

## 🔥 Phase 5: Growth & Polish (Scale It)

### Priority: P3 (Nice to Have - Weeks 14+)

#### 17. **Onboarding Improvements**
- [ ] Spotify taste import (analyze top tracks)
- [ ] Find friends from contacts
- [ ] Suggested rooms based on taste
- [ ] Interactive tutorial (first-time user)
- [ ] Skip onboarding option

---

#### 18. **Discovery Features**
- [ ] Explore tab with trending rooms
- [ ] Genre-based room discovery
- [ ] "Hot right now" section
- [ ] Friend recommendations
- [ ] Similar users based on taste

---

#### 19. **Profile Enhancements**
- [ ] Edit bio, avatar, banner
- [ ] Music personality quiz
- [ ] Top genres visualization
- [ ] Listening heatmap (activity by hour)
- [ ] Favorite decades/eras
- [ ] "Music journey" timeline

---

#### 20. **Advanced Map Features**
- [ ] Heatmap of listening activity
- [ ] Filter by mood/genre on map
- [ ] 3D view option
- [ ] Time machine (see yesterday's activity)
- [ ] City-wide stats

---

#### 21. **Platform Expansion**
- [ ] Apple Music integration
- [ ] YouTube Music integration
- [ ] SoundCloud support
- [ ] Cross-platform presence

---

#### 22. **Social Sharing**
- [ ] Share tracks to Instagram Stories
- [ ] Generate shareable images
- [ ] "Now Playing" widgets
- [ ] Weekly Wrapped stories
- [ ] Referral program (invite friends)

---

#### 23. **Performance & Polish**
- [ ] Offline mode (cache data)
- [ ] Better error handling
- [ ] Loading states everywhere
- [ ] Smooth animations (already great!)
- [ ] Accessibility improvements
- [ ] Dark/light mode toggle (currently dark only)
- [ ] Multiple language support

---

#### 24. **Moderation & Safety**
- [ ] Report users
- [ ] Block users
- [ ] Content moderation (drops, rooms)
- [ ] Privacy settings
- [ ] Age verification
- [ ] Community guidelines

---

## 📅 Suggested Timeline

### **Month 1: Make It Real**
- ✅ Connect Spotify
- ✅ Deploy backend (Firebase or fixed Render)
- ✅ User authentication
- ✅ Real GPS locations

### **Month 2: Make It Social**
- ✅ Friend system
- ✅ Push notifications
- ✅ Enhanced rooms with chat
- ✅ Better drops

### **Month 3: Make It Sticky**
- ✅ Sonic DNA matching
- ✅ Weekly Wrapped
- ✅ Streaks & achievements
- ✅ Vibe feed

### **Month 4: Make Money**
- ✅ SKAPA Pro subscription
- ✅ Token economy
- ✅ Label insights (pilot)

### **Month 5+: Scale & Grow**
- ✅ Growth features
- ✅ Platform expansion
- ✅ Performance optimization

---

## 🎯 MVP for Launch (Minimum Viable Product)

**If you want to launch quickly, focus on these:**

1. ✅ Real Spotify integration
2. ✅ Backend deployed and working
3. ✅ User authentication
4. ✅ Friend system (add/remove friends)
5. ✅ Real GPS locations
6. ✅ Push notifications (basic)
7. ✅ Working rooms (no chat needed yet)
8. ✅ Basic drops (no reactions needed yet)

**That's enough to launch and test with 50-100 users!**

---

## 💡 Feature Ideas (Future Brainstorm)

- **Music Challenges:** "Listen to 5 genres today"
- **Collaborative Playlists:** Build playlists with friends in real-time
- **Time Capsules:** Save today's vibe, open in 1 year
- **Mood Calendar:** Visual history of your music moods
- **Listening Goals:** "Discover 20 new artists this month"
- **Music Bingo:** Check off tracks/artists as you listen
- **DJ Mode:** Take turns playing tracks in room
- **Karaoke Rooms:** Sing along feature
- **Concert Buddy Finder:** Find friends going to same shows
- **Local Venue Integration:** See live music nearby

---

## 🤔 Questions to Decide

1. **Backend:** Firebase (easier) or Python (more control)?
2. **Auth:** Spotify-only or add Google/Apple Sign-In?
3. **Monetization:** Start with Pro subscription or wait?
4. **Platform:** iOS-first, Android-first, or both simultaneously?
5. **Scope:** Launch MVP fast or build more features first?

---

## 📊 Success Metrics to Track

- **Activation:** % users who connect Spotify
- **Retention:** % users who return after 7 days
- **Engagement:** Avg. minutes per session
- **Social:** Avg. friends per user
- **Viral:** Friend invites sent per user
- **Revenue:** % users who convert to Pro

---

## 🎨 Design Improvements (Optional)

- [ ] More mood/vibe options (currently 5)
- [ ] Custom avatar creator
- [ ] Animated backgrounds
- [ ] Sound effects throughout app
- [ ] Haptic feedback
- [ ] Gesture shortcuts

---

**Which phase should we start with? Or which specific feature interests you most?** 🚀
