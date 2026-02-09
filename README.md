<div align="center">

# 🚀 Mohammed Halboup — Portfolio

**Full-Stack Developer**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-blue?style=for-the-badge)](https://mohammedhalboup.dev)
[![GitHub](https://img.shields.io/badge/GitHub-MohdEssam77-181717?style=for-the-badge&logo=github)](https://github.com/MohdEssam77)
[![Email](https://img.shields.io/badge/Email-Contact-red?style=for-the-badge&logo=gmail)](mailto:mohammedhalboub23@gmail.com)

<br />

*A modern, responsive portfolio built with Astro & Tailwind CSS*

</div>

---

## ✨ Features

- ⚡ **Blazing Fast** — Built with [Astro](https://astro.build) for optimal performance and SEO
- 🎨 **Modern Design** — Clean, minimal aesthetic with smooth animations and sticky card effects
- 📱 **Fully Responsive** — Optimized for all screen sizes, from mobile to desktop
- 🌙 **Dark Theme** — Elegant dark theme with carefully crafted color palette
- 🏆 **Hackathons Section** — Dedicated section showcasing hackathon projects with images and achievements
- 🔧 **Easy to Customize** — All content managed through a single config file
- 🚀 **Deploy Ready** — Static build ready for Vercel, Netlify, or any static host

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Astro](https://astro.build) | Static Site Generator |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling & Design System |
| [TypeScript](https://www.typescriptlang.org) | Type Safety |
| [Prettier](https://prettier.io) | Code Formatting |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/MohdEssam77/myportfolio.git

# Navigate to the project
cd myportfolio

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser to see the result.

### Build for Production

```bash
# Create production build
pnpm build

# Preview the production build locally
pnpm preview
```

---

## 📁 Project Structure

```
myportfolio/
├── public/              # Static assets (images, icons, etc.)
├── src/
│   ├── components/      # Reusable Astro components
│   ├── config/          # Site configuration & content
│   ├── layouts/         # Page layouts
│   ├── pages/           # Route pages
│   ├── styles/          # Global styles
│   └── types/           # TypeScript type definitions
├── astro.config.mjs     # Astro configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

---

## ⚙️ Customization

All site content is managed in a single file: **`src/config/index.ts`**

### Personal Information

```typescript
export const SITE_CONFIG: SiteConfig = {
  title: "Mohammed Halboup — Full-Stack Developer",
  author: "Mohammed Halboup",
  description: "Full-Stack Engineer at PCC and CS student at Saarland University",
  // ... social links, navigation, etc.
};
```

### Adding Projects

```typescript
projects: [
  {
    name: "Project Name",
    summary: "Brief description of your project...",
    linkPreview: "https://your-live-demo.com",  // Optional
    linkSource: "https://github.com/your/repo", // Optional
    image: "/project-image.png",
  },
  // ... more projects
],
```

### Adding Hackathons

```typescript
hackathons: [
  {
    name: "Hackathon Name",
    location: "City, Country",
    summary: "What you built and achieved...",
    rank: "Winner / 1st Place",  // Optional
    images: ["/image1.png", "/image2.png"],  // Up to 3 images
    link: "https://github.com/your/repo",  // Optional
    preview: "https://live-demo.com",  // Optional
  },
  // ... more hackathons
],
```

### Adding Experience

```typescript
experience: [
  {
    company: "Company Name",
    position: "Your Role",
    startDate: "Jan 2024",
    endDate: "Present",
    summary: [
      "Achievement or responsibility #1",
      "Achievement or responsibility #2",
    ],
  },
],
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Mohammed Halboup](https://github.com/MohdEssam77)**

</div>