# Contributing to Deposit Insight Engine Free

First off, thanks for considering contributing to this project! It's people like you that make this such a great tool.

## Code of Conduct

This project adheres to the Contributor Covenant [code of conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct.html). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [issue list](https://github.com/YOUR_USERNAME/deposit-insight-engine-free/issues) as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**
* **Include your operating system, browser, and Node version**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain the expected behavior**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Follow the styleguides (see below)
* End all files with a newline
* Avoid platform-dependent code
* Code changes should include tests (if applicable)

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### TypeScript Styleguide

* Use TypeScript strict mode
* Add type annotations for all function parameters and returns
* Use interface over type for object shapes
* Use const over let, let over var
* Use arrow functions for callbacks

### React Styleguide

* Use functional components with hooks
* Use composition over inheritance
* Keep components focused on a single responsibility
* Use descriptive component and prop names
* Add JSDoc comments for complex components

### CSS/Tailwind Styleguide

* Use Tailwind utility classes
* Follow the CSS property order convention
* Avoid custom CSS unless absolutely necessary
* Use semantic HTML elements

## Development Setup

### Getting Started

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/deposit-insight-engine-free.git
cd deposit-insight-engine-free

# 2. Install dependencies
npm install

# 3. Create a new feature branch
git checkout -b feature/amazing-feature

# 4. Start development server
npm run dev

# 5. Make your changes
# 6. Lint your code
npm run lint

# 7. Format your code
npm run format

# 8. Build to verify
npm run build
```

### Running Tests (If Applicable)

```bash
# Run any available tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Debugging

```bash
# Start dev server with debugging
npm run dev

# Browser DevTools: F12
# Check browser console for errors
```

## Submitting Changes

1. **Push to your fork:**
   ```bash
   git push origin feature/amazing-feature
   ```

2. **Submit a Pull Request:**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template
   - Click "Create Pull Request"

3. **Address review comments:**
   - Make requested changes
   - Push to your branch (automatically updates PR)
   - Comment when ready for re-review

## Project Structure

```
src/
├── components/
│   ├── deposit/       # Business logic components
│   └── ui/            # Reusable UI components
├── lib/
│   ├── deposit-data.ts    # Data models
│   ├── assumption-store.ts # State management
│   └── ...
├── routes/            # Page components
├── hooks/             # Custom React hooks
└── start.ts           # Application entry
```

## Useful Links

* [GitHub Issues](https://github.com/YOUR_USERNAME/deposit-insight-engine-free/issues)
* [Project README](../README.md)
* [Deployment Guide](../DEPLOYMENT.md)
* [React Documentation](https://react.dev)
* [TypeScript Documentation](https://www.typescriptlang.org/docs)
* [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Additional Notes

### Issue and Pull Request Labels

* `bug` - Something isn't working
* `enhancement` - New feature or request
* `documentation` - Improvements or additions to documentation
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `question` - Further information is requested
* `wontfix` - This will not be worked on

## Recognition

Contributors will be recognized in the project's README and CONTRIBUTORS.md file!

---

Thank you for contributing! 🎉
