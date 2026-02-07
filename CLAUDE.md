# App UI Playground

This is a prototyping tool for iOS-style app UIs in the browser.

## Required Skills

When working on UI in this project, use these skills if available:

- **frontend-design** - For creating distinctive, production-grade interfaces
- **interaction-design** - For microinteractions, motion, and transitions
- **baseline-ui** - To enforce quality standards and prevent UI slop
- **ui-ux-pro-max** - For design system recommendations

Check if skills are installed by looking in `~/.claude/skills/`. If a relevant skill exists, invoke it before starting UI work.

## Project Structure

- `core/` - Framework files (theme, components, navigation, icons)
- `apps/` - App-specific implementations
- `scripts/` - CLI tools for syncing from iOS

## Working with iOS Apps

This tool syncs with iOS apps. The key files it parses:
- `AppTabView.swift` - Tab structure and accessibility IDs
- `PrototypeTheme.swift` - Design tokens (spacing, colors, etc.)

## Style Guidelines

- Use CSS custom properties from `core/theme.css`
- Follow iOS Human Interface Guidelines
- Use SF Symbol icon names in `icon()` calls
- Support both light and dark modes
