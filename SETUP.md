# Development Setup Guide

This project uses **ESLint**, **Stylelint**, and **Prettier** to maintain consistent code quality.

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

This installs all linting and formatting tools.

### 2. Install VS Code Extensions (Recommended)

When you open the project in VS Code, you'll see a prompt to install recommended extensions:

- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Stylelint** - CSS linting

Click **"Install All"** or install manually:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)

---

## 🛠️ Available Commands

### Check for Issues

```bash
npm run lint
```

Checks JavaScript, CSS, and formatting.

### Fix Issues Automatically

```bash
npm run lint:fix
```

Fixes all auto-fixable issues and formats code.

### Format Code

```bash
npm run format
```

Formats all JavaScript, CSS, and HTML files.

---

## ⚡ Auto-Formatting

### In VS Code

- **Save a file** → Automatically formats with Prettier
- **Save a file** → Automatically fixes ESLint/Stylelint issues

### On Git Commit

- Code is automatically linted and formatted
- **Commit will fail if there are errors**
- Run `npm run lint:fix` to fix issues before committing

---

## 📋 Code Style Rules

### JavaScript

- Use `const` and `let` (no `var`)
- Semicolons required
- Double quotes for strings
- 2 spaces for indentation

### CSS

- Lowercase class names
- Alphabetical property order
- Short hex colors (`#fff` not `#ffffff`)

### Formatting

- Max line length: 80 characters
- Trailing commas in arrays/objects
- 2 space indentation everywhere

---

## 🚫 Troubleshooting

### "ESLint not working in VS Code"

1. Open Command Palette (`Cmd/Ctrl + Shift + P`)
2. Run: `ESLint: Restart ESLint Server`

### "Prettier not formatting on save"

1. Check `.vscode/settings.json` exists
2. Verify Prettier is set as default formatter
3. Reload VS Code

### "Commit blocked by lint errors"

```bash
# Fix all issues
npm run lint:fix

# Try committing again
git commit -m "Your message"
```

### "Husky hooks not working"

```bash
# Reinstall husky
rm -rf .husky
npx husky init
chmod +x .husky/pre-commit
```

---

## 📖 Learn More

- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Stylelint Rules](https://stylelint.io/user-guide/rules)

---

## ✅ Quick Start Checklist

- [ ] Run `npm install`
- [ ] Install VS Code extensions
- [ ] Run `npm run lint:fix` to format existing code
- [ ] Make a test commit to verify hooks work
- [ ] Start coding! 🎉
