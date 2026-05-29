# Portofolang - Backend Developer & Creative Enthusiast Portfolio

Modern portfolio website built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, and **GSAP** animations. Showcase your development projects, creative works, and UI/UX designs.

**Live Demo:** https://galang-arrauf.com

## 🚀 Features

- ✅ **Responsive Design** - Mobile-first, fully responsive layout
- ✅ **Modern Animations** - GSAP ScrollTrigger for smooth scroll animations
- ✅ **Dynamic Island Navigation** - macOS-inspired animated navbar
- ✅ **Project Showcase** - Grid layout for development projects
- ✅ **Design Gallery** - Image and video showcase system
- ✅ **Contact Form** - Integrated with Formspree for email submissions
- ✅ **SEO Optimized** - Meta tags, sitemap, robots.txt, Open Graph
- ✅ **PWA Ready** - Web app manifest and mobile support
- ✅ **Error Handling** - Custom 404 and error pages
- ✅ **Performance** - Image optimization, compression, lazy loading

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.4 | React framework |
| React | 19.2.4 | UI library |
| Tailwind CSS | 4.x | Styling |
| GSAP | 3.15.0 | Animations |
| Remixicon | 4.1.0 | Icons |

## 📋 Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the values in `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_CV_DRIVE_ID=YOUR_GOOGLE_DRIVE_FILE_ID
NEXT_PUBLIC_FORMSPREE_ID=YOUR_FORMSPREE_ID
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourname
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/in/yourname
NEXT_PUBLIC_EMAIL=your-email@example.com
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
portofolang/
├── public/
│   ├── image/              # Project images & thumbnails
│   ├── favicon.ico         # Website icon
│   ├── manifest.json       # PWA manifest
│   └── robots.txt          # SEO robots file
├── src/app/
│   ├── api/
│   │   └── cv/route.js     # CV download endpoint
│   ├── design/
│   │   └── page.js         # Design gallery page
│   ├── globals.css         # Global styles & Tailwind config
│   ├── layout.js           # Root layout with metadata
│   ├── page.js             # Home page (main portfolio)
│   ├── not-found.js        # 404 error page
│   ├── error.js            # Global error handler
│   ├── sitemap.js          # Dynamic sitemap for SEO
│   └── robots.js           # Dynamic robots.txt for SEO
├── .env.example            # Environment variables template
├── eslint.config.mjs       # ESLint configuration
├── next.config.mjs         # Next.js configuration
├── package.json            # Project dependencies
├── postcss.config.mjs      # PostCSS configuration
└── jsconfig.json           # JavaScript/Babel config
```

## 🎨 Customization

### Update Portfolio Data

Edit `src/app/page.js` to update:

```javascript
const SKILLS_DATA = [
  // Your skills and expertise
];

const DEV_PROJECTS = [
  // Your development projects
];

const FEATURED_CREATIVE = [
  // Your design & video work
];
```

### Modify Colors

Edit `src/app/globals.css`:

```css
@theme {
  --color-bg-dark: #0a0a0a;      /* Background */
  --color-card-bg: #111111;       /* Card background */
  --color-primary: #8a2be2;       /* Primary color */
  --color-accent: #4fffa3;        /* Accent color */
}
```

### Add Your CV

1. Upload your CV to Google Drive
2. Share the file and copy the **File ID**
3. Update `.env.local`:
   ```env
   NEXT_PUBLIC_CV_DRIVE_ID=YOUR_FILE_ID
   ```

## 📊 Build & Deploy

### Build for Production

```bash
npm run build
npm start
```

### Deploy on Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Deploy automatically on git push

```bash
vercel
```

### Deploy on Netlify

```bash
npm run build
# Upload 'out' directory to Netlify
```

## 🔍 SEO Configuration

- **Meta Tags** - Update in `src/app/layout.js`
- **Sitemap** - Auto-generated at `/sitemap.xml`
- **Robots.txt** - Auto-generated at `/robots.txt`
- **Open Graph** - Update OG tags in metadata

## 📝 Form Submission

Uses [Formspree](https://formspree.io) for contact form:

1. Create account at formspree.io
2. Get your form endpoint ID
3. Update `src/app/page.js` form action

## 📱 Mobile Support

- Fully responsive (mobile, tablet, desktop)
- PWA manifest for app-like experience
- Touch-friendly navigation
- Optimized for all devices

## 🎬 Adding Videos

Videos are embedded from Google Drive. To add your videos:

1. Upload to Google Drive
2. Get shareable link and extract File ID
3. Update `GALLERY_DATA` in `src/app/design/page.js`:

```javascript
{
  id: 1,
  title: "Your Video Title",
  category: "video",
  videoUrl: "https://drive.google.com/file/d/FILE_ID/preview",
  desc: "Video description"
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Images not showing | Check `/public/image/` folder paths in data |
| Icons not displaying | Verify Remixicon CDN link in layout.js |
| CV download fails | Update Google Drive File ID in .env.local |
| Form not sending | Check Formspree ID and endpoint in page.js |

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [GSAP Documentation](https://gsap.com)
- [Remixicon Icons](https://remixicon.com)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact: your-email@example.com
- LinkedIn: https://linkedin.com/in/your-profile

---

**Made with ❤️ by Galang Arrauf | Built with Next.js & Tailwind CSS**

