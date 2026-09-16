# Deposit Insight Engine - Free Edition - Setup & Troubleshooting Guide

## Quick Start

### 1. Install Dependencies

```bash
# Using npm
npm install

# Using Bun
bun install

# Using pnpm
pnpm install

# Using yarn
yarn install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port if 5173 is busy).

### 3. (Optional) Configure AI Features

For AI-powered analysis in the Sterling chatbot:

1. Copy `.env.example` to `.env.local`
2. Add your OpenAI API key: `VITE_OPENAI_API_KEY=sk-your-key`
3. The AI features will activate automatically

Without an API key, the chatbot still works with local, rule-based answers.

## Project Structure

```
Deposit-Insight-Engine-Free/
├── index.html                 # Entry point
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── eslint.config.js          # ESLint rules
├── .prettierrc                # Code formatting rules
├── package.json              # Dependencies & scripts
│
└── src/
    ├── start.ts              # App initialization
    ├── router.tsx            # Router setup
    ├── routeTree.gen.ts      # Auto-generated route tree
    ├── styles.css            # Global styles & design system
    │
    ├── components/
    │   ├── deposit/          # Business logic components
    │   │   ├── TopBar.tsx
    │   │   ├── ExecutiveSummary.tsx
    │   │   ├── Copilot.tsx   # AI analyst (updated for client-side)
    │   │   ├── DriverTree.tsx
    │   │   ├── ModelBrief.tsx
    │   │   └── ... (more components)
    │   │
    │   └── ui/               # shadcn/ui components (pre-built)
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── tabs.tsx
    │       └── ... (40+ UI components)
    │
    ├── lib/
    │   ├── deposit-data.ts        # Core data models & business logic
    │   ├── assumption-store.ts    # State management for assumptions
    │   ├── model-store.ts         # Forecast model selection
    │   ├── audit-store.ts         # Change tracking
    │   ├── qa.functions.ts        # AI Q&A (UPDATED: client-side)
    │   ├── error-reporting.ts     # Generic error handling
    │   ├── error-page.ts          # Error page HTML
    │   ├── lovable-error-reporting.ts (deprecated, for compatibility)
    │   └── utils.ts               # Utility functions
    │
    ├── hooks/
    │   └── use-mobile.tsx         # Mobile breakpoint detection
    │
    └── routes/
        ├── __root.tsx            # Root route layout
        ├── index.tsx             # Home/dashboard page
        └── decision-tree.tsx     # Decision tree page
```

## Key Changes from Original (Lovable-based) Version

### ✅ Removed Lovable Dependencies
- Removed `@lovable.dev/vite-tanstack-config`
- Removed Lovable-specific imports and configuration
- Removed Lovable error reporting telemetry

### ✅ Replaced With Standard Tools
- Standard Vite configuration
- Standard ESLint and Prettier setup
- Generic error reporting utility
- Client-side AI integration (OpenAI API or custom backend)

### ✅ Updated Components
- **Copilot.tsx**: Removed `useServerFn`, now uses direct async function calls
- **qa.functions.ts**: Replaced `createServerFn` with client-side OpenAI API integration
- **__root.tsx**: Updated to use new `reportError` function
- **error-reporting.ts**: New generic error reporting utility

### ✅ Simplified Architecture
- Removed TanStack Start server dependencies
- Pure client-side SPA with Vite
- No backend required (except optional AI API)

## Building for Production

### Development Build
```bash
npm run build:dev
```

### Production Build
```bash
npm run build
```

Output goes to the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## Troubleshooting

### Port Already in Use

If port 5173 is busy, Vite will automatically use the next available port. You can also specify a port:

```bash
npm run dev -- --port 3000
```

### TypeScript Errors

Ensure you have Node.js 18+:
```bash
node --version
```

If you see module resolution errors:
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

### Missing `routeTree.gen.ts`

The TanStack Router plugin auto-generates this file. It should be created when you:
1. Run `npm run dev`
2. Run `npm run build`

If it's still missing after running dev server:
```bash
rm src/routeTree.gen.ts
npm run dev
```

The file will be regenerated automatically.

### Build Errors

Clear everything and rebuild:
```bash
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### AI Features Not Working

1. **No AI responses (only local fallbacks)**
   - You haven't set `VITE_OPENAI_API_KEY` in `.env.local`
   - This is fine - local answers still work

2. **"Invalid API key" error**
   - Check your API key is correct
   - Ensure it's in `.env.local`, not `.env.production`
   - Restart the dev server after changing `.env.local`

3. **CORS errors when calling OpenAI**
   - OpenAI API must be called from the browser with a valid API key
   - Never expose backend keys - use a backend proxy instead

### Styling Issues

The app uses Tailwind CSS with the new v4 syntax. If styles aren't applying:

1. Restart dev server: `npm run dev`
2. Clear Tailwind cache: `rm -rf node_modules/.vite`
3. Rebuild: `npm run build`

## Customization Guide

### Adding a New Route

1. Create `src/routes/my-page.tsx`:
```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/my-page")({
  component: MyPageComponent,
});

function MyPageComponent() {
  return <div>Hello World</div>;
}
```

2. Route tree will auto-update on dev server restart

### Changing Colors/Theme

Edit `src/styles.css`:
- Lines with `:root` define light mode colors
- Lines with `.dark` define dark mode colors
- All colors use oklch format (CSS custom properties)

### Using Additional shadcn/ui Components

All components are pre-installed. Browse available components at https://ui.shadcn.com/docs/components

Import and use:
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
```

### Integrating with Your Own Data

Replace synthetic data in `src/lib/deposit-data.ts`:

1. Modify `buildDataset()` function
2. Fetch from your API instead of generating random data
3. Adjust component data structures to match your schema

## Performance Tips

### Development
- Use `npm run dev` for hot module replacement
- TypeScript checking happens in real-time
- Browser DevTools work normally

### Production
- Run `npm run build` for optimized output
- Bundle size is ~300KB gzipped (React + Router + UI components)
- All data is synthetic - replace with your API calls

## Integration Patterns

### With Backend API
```tsx
// In your components
const response = await fetch('https://api.example.com/deposit-data');
const data = await response.json();
```

### With Your Database
Replace data generation in `src/lib/deposit-data.ts`:
```tsx
export async function buildDataset() {
  const response = await fetch('/api/deposits');
  return response.json();
}
```

### With Error Tracking (e.g., Sentry)
Edit `src/lib/error-reporting.ts`:
```tsx
import * as Sentry from "@sentry/react";

export function reportError(error, context) {
  Sentry.captureException(error, { contexts: { app: context } });
}
```

## Deployment

### Vercel
```bash
vercel
```

### Netlify
```bash
npm run build
# Deploy the dist/ folder
```

### Docker
Create `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Traditional Server
```bash
npm run build
# Upload dist/ folder to your web server
```

## Support & Contributing

- **Questions?** Check the code comments and component prop types
- **Found a bug?** Open an issue with reproduction steps
- **Want to contribute?** Pull requests welcome!

## License

This project is free and open source.

## Further Reading

- [TanStack Router Docs](https://tanstack.com/router/latest)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Vite Docs](https://vitejs.dev)
