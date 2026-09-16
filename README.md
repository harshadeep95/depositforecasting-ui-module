# Deposit Insight Engine - Free Edition

An interactive retail deposit forecasting application with what-if scenarios, persona-aware insights, and AI-powered analysis. Built with React, TypeScript, and TanStack Router.

> This is the **free, open-source version** of the Deposit Insight Engine, with all Lovable.dev dependencies removed and replaced with standard, open-source tools.

## Features

- 📊 **Interactive Forecasting** - Explore deposit trends and forecast scenarios
- 🎯 **What-If Analysis** - Adjust key drivers and see impact on forecasts
- 👥 **Persona-Based Insights** - Tailored perspectives for different roles
- 🤖 **AI Analysis** - Ask questions about your data (requires OpenAI API key)
- 📈 **Visual Analytics** - Charts, waterfalls, and tree visualizations
- 📑 **Scenario Management** - Save and compare different scenarios
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS

## Tech Stack

- **React 19** - UI framework
- **TanStack Router** - Client-side routing
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **shadcn/ui** - Component library
- **Vite** - Build tool

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or Bun package manager

### Installation

1. Clone or extract this project:
```bash
cd Deposit-Insight-Engine-Free
```

2. Install dependencies:
```bash
npm install
# or
bun install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
bun run dev
```

The app will open at `http://localhost:5173` (or the next available port).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── components/
│   ├── deposit/          # Main business components
│   └── ui/               # Reusable UI components (shadcn/ui)
├── lib/
│   ├── deposit-data.ts   # Core data models and definitions
│   ├── assumption-store.ts # State management for assumptions
│   ├── model-store.ts    # Forecast model selection
│   ├── audit-store.ts    # Change tracking
│   └── error-reporting.ts # Error handling
├── routes/               # TanStack Router page components
├── hooks/                # Custom React hooks
└── start.ts              # Application entry point
```

## Configuration

### Environment Variables

For AI-powered analysis features, you can optionally configure:

```bash
# .env.local
VITE_OPENAI_API_KEY=your_api_key_here
```

### Customizing Error Reporting

Edit `src/lib/error-reporting.ts` to integrate with your error tracking service:
- Sentry
- LogRocket
- Custom backend API
- Other error tracking platforms

## Building for Production

```bash
npm run build
```

The build output is in the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## Customization

### Changing the Data

The application uses fully synthetic, deterministic data defined in `src/lib/deposit-data.ts`. To use real data:

1. Modify the data loading in `src/lib/deposit-data.ts`
2. Update the `buildDataset()` function to fetch from your API
3. Adjust the UI components as needed to match your data structure

### Theming

The application uses Tailwind CSS with CSS custom properties for theming. Customize colors in your `src/styles.css` file.

### UI Components

Pre-built components from shadcn/ui are in `src/components/ui/`. Add more from https://ui.shadcn.com/:

```bash
# The components are already included; install any missing ones:
# npx shadcn-ui@latest add [component-name]
```

## Removing Lovable References

This version has been cleaned of all Lovable-specific code:
- ❌ Removed `@lovable.dev/vite-tanstack-config` dependency
- ❌ Removed Lovable-specific imports and configuration
- ✅ Replaced with standard Vite + TanStack Router setup
- ✅ Generic error reporting utility instead of Lovable telemetry
- ✅ Standard ESLint configuration

For AI features, integrate with OpenAI or your preferred LLM provider.

## Troubleshooting

### Port already in use
Vite will automatically try the next available port. To specify a port:
```bash
npm run dev -- --port 3000
```

### TypeScript errors
Ensure you have the correct Node.js version (18+):
```bash
node --version
```

### Build errors
Clear the cache and reinstall:
```bash
rm -rf node_modules dist
npm install
npm run build
```

## Contributing

This is a free, open-source project. Contributions are welcome! Please feel free to:
- Report issues
- Submit pull requests
- Suggest improvements

## License

This project is provided as-is for educational and commercial use.

## Data Disclaimer

**All data in this application is synthetic and generated for demonstration purposes.** It does not represent any real customer, company, or production system. Use for learning, prototyping, and testing only.

## Support

For questions or issues:
1. Check the code comments in key files
2. Review the component prop types (TypeScript)
3. Open an issue if you find bugs

## Acknowledgments

- Built with [React](https://react.dev)
- Routing by [TanStack Router](https://tanstack.com/router)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Charts with [Recharts](https://recharts.org)
