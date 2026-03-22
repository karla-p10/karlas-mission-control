# 🤖 Rosie App

**Your family command center.** Task management + Google Calendar integration built for busy moms.

Jetsons-inspired branding — Rosie the robot maid, keeping your household running smoothly in the 21st century.

---

## ✨ Features (v1)

- **Dashboard** — Personalized greeting, today's tasks at a glance, upcoming calendar events
- **Tasks** — Full task management with categories, priorities, statuses, and due dates
- **Calendar** — Monthly calendar view with tasks mapped to dates
- **Settings** — Profile, notifications, Google Calendar integration (UI placeholder)

## 🎨 Design

- **Primary color:** Soft teal/mint (`#5BB5A2`)
- **Accent:** Warm coral (`#FF6B6B`)
- **Typography:** Space Grotesk (headings) + Inter (body)
- **Style:** Rounded, friendly, sophisticated — the kind of app that makes you feel organized just looking at it

## 🛠 Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (base-ui components)
- **Zustand** (state management with localStorage persistence)
- **date-fns** (date utilities)
- **Lucide React** (icons)

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx            # Dashboard
│   ├── tasks/page.tsx      # Tasks page
│   ├── calendar/page.tsx   # Calendar page
│   ├── settings/page.tsx   # Settings page
│   ├── layout.tsx          # Root layout + fonts
│   └── globals.css         # Theme & CSS variables
├── components/
│   ├── AppShell.tsx        # Main layout wrapper
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── TopBar.tsx          # Top navigation bar
│   ├── TaskCard.tsx        # Individual task card
│   ├── TaskModal.tsx       # Add/edit task dialog
│   ├── CategoryBadge.tsx   # Task category pill
│   ├── StatusBadge.tsx     # Task status indicator
│   ├── DashboardCard.tsx   # Dashboard section card
│   ├── CalendarGrid.tsx    # Monthly calendar view
│   ├── SettingsSection.tsx # Settings section wrapper
│   └── ui/                 # shadcn/ui components
└── lib/
    ├── store.ts            # Zustand store + mock data
    └── utils.ts            # Utility functions
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📋 Task Categories

| Category | Emoji | Color |
|----------|-------|-------|
| Home | 🏠 | Amber |
| Kids | 👧 | Pink |
| Work | 💼 | Blue |
| Personal | ✨ | Purple |
| Health | 💚 | Green |
| Errands | 🛒 | Orange |

## 🗺 Roadmap

- [ ] Google Calendar OAuth integration
- [ ] Real-time notifications
- [ ] Recurring tasks
- [ ] Family member accounts (multi-user)
- [ ] Mobile app (React Native / Expo)
- [ ] AI task suggestions ("Looks like Jake's birthday is coming up...")
- [ ] Voice input for quick task add

## 🤖 About the Name

Rosie is named after Rosie the Robot Maid from *The Jetsons* — the original household AI that kept the family organized. She did it with style and a little sass. So does this app.

---

*Built with ❤️ for busy moms who deserve better tools.*
