# Playflix Next.js — Streaming Web Application

Playflix-এর সম্পূর্ণ আধুনিক Next.js 14 (App Router) + TypeScript সংস্করণ। এটি আসল Blogger XML টেমপ্লেটের সমস্ত ফিচার ধারণ করে।

## 🚀 মূল ফিচারসমূহ (Features Included)

1. **Cinematic Hero Slider**:
   - TMDB Trending Movies থেকে অটো-রোটেটিং স্লাইডার (৭ সেকেন্ড অন্তর)।
   - ডাইনামিক স্টার রেটিং, ওভারভিউ, ব্যাজ এবং ডাইরেক্ট প্লে অপশন।
2. **OTT Platform Filtering**:
   - Netflix, Prime Video, Disney+, Apple TV+, Max, Hulu, Zee5, Hoichoi, ULLU, AltBalaji ফিল্টার।
3. **Advanced Browse & Mood Filter**:
   - অ্যাকশন, কমেডি, রোমান্স, হরর, সায়েন্স-ফিকশন ইত্যাদি মুড চিপস।
   - জঁরা (Genre Cloud), রিলিজ বছর (Year Slider), এবং ন্যূনতম রেটিং স্লাইডার।
   - ভাষা ভিত্তিক ফিল্টারিং (English, Hindi, Bengali, Korean, All)।
   - গ্রিড ভিউ (Grid View) এবং লিস্ট ভিউ (List View) টগল।
4. **Interactive Modals**:
   - **Quick View Modal**: পোস্টার, সংক্ষেপ, জঁরা, ট্রেলার বাটন এবং ওয়াচলিস্ট অ্যাড।
   - **Full View Modal with Player**: ভিডিও প্লেয়ার আইফ্রেম, মাল্টিপল সার্ভার সুইচিং (VidAPI, VidSrc, 2Embed), টিভি সিরিজের জন্য Season/Episode কন্ট্রোল, কাস্ট ও অনুরূপ সিনেমার তালিকা, সোশ্যাল শেয়ার।
5. **Watchlist & Continue Watching**:
   - লোকালস্টোরেজে ডেটা সংরক্ষণ।
   - প্রগ্রেস বার সহ কন্টিনিউ ওয়াচিং হিস্ট্রি।
6. **Smart Search**:
   - ইনস্ট্যান্ট সার্চ ড্রপডাউন, রিসেন্ট সার্চ হিস্ট্রি এবং ব্রাউজার স্পিচ রিকগনিশন (Voice Search)।
7. **Mobile Optimized**:
   - বটম ন্যাভিগেশন বার, রেসপনসিভ টাচ কার্ড ওভারলে।

---

## 🛠️ কীভাবে চালাবেন (How to Run)

### ১. Node.js ইনস্টল করুন (যদি না থাকে)
আপনার কম্পিউটারে Node.js ইনস্টল না থাকলে [Node.js Official Website](https://nodejs.org/) থেকে **LTS Version** ডাউনলোড ও ইনস্টল করে নিন।

### ২. ডিপেন্ডেন্সি ইনস্টল করুন
টার্মিনালে এই প্রজেক্ট ফোল্ডারে গিয়ে রান করুন:
```bash
cd "playflix-next"
npm install
```

### ৩. ডেভেলপমেন্ট সার্ভার চালু করুন
```bash
npm run dev
```
ব্রাউজারে যান: [http://localhost:3000](http://localhost:3000)

---

## 📁 ফাইল স্ট্রাকচার (Project Structure)

```
playflix-next/
├── src/
│   ├── app/
│   │   ├── globals.css         # থিম ভেরিয়েবল ও স্টাইল
│   │   ├── layout.tsx          # গ্লোবাল লেআউট ও ফন্ট
│   │   └── page.tsx            # মূল পৃষ্ঠা ও মোডাল লজিক
│   ├── components/
│   │   ├── BrowseView.tsx      # সার্চ ও ফিল্টারিং গ্রিড
│   │   ├── ContinueWatchingRow.tsx # দেখা চালিয়ে যাওয়ার রো
│   │   ├── FullViewModal.tsx   # ভিডিও প্লেয়ার মোডাল
│   │   ├── HeroSlider.tsx      # সিনেম্যাটিক স্লাইডার
│   │   ├── HomeRows.tsx        # ক্যাটাগরিভিত্তিক অনুভূমিক রো
│   │   ├── MobileBottomNav.tsx # মোবাইলের জন্য নিচের মেন্যু
│   │   ├── Navbar.tsx          # সার্চ, লোগো, ভয়েস সার্চ
│   │   ├── OTTTabs.tsx         # প্ল্যাটফর্ম সিলেক্টর
│   │   ├── ProgressBar.tsx     # টপ লোডিং বার
│   │   ├── QuickViewModal.tsx  # কুইক প্রিভিউ মোডাল
│   │   ├── StatsBar.tsx        # লাইভ কাউন্ট পরিসংখ্যান
│   │   └── Toast.tsx           # নোটিফিকেশন টোস্ট
│   ├── context/
│   │   └── AppContext.tsx      # গ্লোবাল স্টেট ও লোকালস্টোরেজ
│   └── lib/
│       ├── api.ts              # TMDB API হেল্পার
│       ├── config.ts           # সার্ভার ও কনফিগ ডাটা
│       ├── types.ts            # টাইপস্ক্রিপ্ট ইন্টারফেস
│       └── utils.ts            # সাধারণ ইউটিলিটি
├── .env.local                  # TMDB API কী
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```
