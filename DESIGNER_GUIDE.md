# Designer Guide

This guide explains how to customize the visual appearance of the PRNI Political Party website without touching business logic.

## Theme System Overview

The site uses a CSS variables-based theming system. All visual properties are controlled through tokens defined in `app/globals.css`. Tailwind CSS utilities reference these tokens, ensuring consistent styling throughout.

## Quick Reference

| What to Change | Where |
|----------------|-------|
| Colors | `app/globals.css` → CSS variables |
| Fonts | `app/globals.css` → `--font-sans`, `--font-heading` + `app/layout.tsx` for font imports |
| Font sizes | `app/globals.css` → `--text-display-*` |
| Spacing | `app/globals.css` → `--section-spacing`, `--container-padding` |
| Border radius | `app/globals.css` → `--radius` |
| Shadows | `app/globals.css` → `--shadow-*` |
| Component styles | `components/ui/*.tsx` |
| Header/Footer | `components/layout/header.tsx`, `footer.tsx` |

## Color System

Colors use HSL format without the `hsl()` wrapper: `"hue saturation% lightness%"`.

### Primary Colors

```css
:root {
  /* Main brand color - used for buttons, links, accents */
  --primary: 220 60% 25%;
  --primary-foreground: 0 0% 98%;
  
  /* Secondary brand color - for highlights, badges */
  --secondary: 45 85% 45%;
  --secondary-foreground: 220 60% 15%;
}
```

### Semantic Colors

```css
:root {
  /* Background and text */
  --background: 45 20% 97%;
  --foreground: 220 30% 15%;
  
  /* Cards and elevated surfaces */
  --card: 0 0% 100%;
  --card-foreground: 220 30% 15%;
  
  /* Muted/secondary text and backgrounds */
  --muted: 45 15% 92%;
  --muted-foreground: 220 15% 45%;
  
  /* Interactive element highlights */
  --accent: 45 60% 90%;
  --accent-foreground: 220 60% 20%;
  
  /* Status colors */
  --destructive: 0 72% 51%;
  --success: 142 72% 29%;
  --warning: 38 92% 50%;
}
```

## Typography

### Font Families

Fonts are loaded in `app/layout.tsx` and assigned to CSS variables:

```typescript
// Classic theme fonts
const playfair = Playfair_Display({ ... });  // Headings
const crimson = Crimson_Pro({ ... });        // Body text

// Modern theme fonts
const dmSans = DM_Sans({ ... });
const syne = Syne({ ... });
```

To change fonts:

1. Import new fonts from `next/font/google` in `app/layout.tsx`
2. Update CSS variables in `app/globals.css`:

```css
:root {
  --font-sans: "Your Body Font", system-ui, sans-serif;
  --font-heading: "Your Heading Font", Georgia, serif;
}
```

### Font Sizes

Custom display sizes for headlines:

```css
:root {
  --text-display-xl: 4.5rem;  /* 72px - Hero */
  --text-display-lg: 3.5rem;  /* 56px - Page titles */
  --text-display: 2.5rem;     /* 40px - Section headings */
  --leading-display: 1.1;     /* Line height for display text */
}
```

## Spacing

```css
:root {
  --section-spacing: 6rem;      /* Vertical padding between sections */
  --container-padding: 1.5rem;  /* Horizontal padding for containers */
}
```

## Border Radius

```css
:root {
  --radius: 0.375rem;  /* Base radius - lg is this, md is -2px, sm is -4px */
}
```

For more rounded (modern feel): `--radius: 0.75rem;`
For sharper (corporate feel): `--radius: 0.25rem;`

## Shadows

```css
:root {
  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-elevated: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-dropdown: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
```

## Built-in Themes

### Classic Theme (Default)

- Traditional, trustworthy aesthetic
- Serif fonts (Playfair Display + Crimson Pro)
- Deep navy primary, warm gold secondary
- Subtle, warm background tones
- Conservative border radius

### Modern Theme

- Contemporary, bold aesthetic
- Sans-serif fonts (Syne + DM Sans)
- Vibrant emerald primary, electric purple secondary
- Clean white backgrounds
- Larger border radius

Switch themes by setting `NEXT_PUBLIC_THEME="modern"` in your environment or editing `app/layout.tsx`.

## Creating a Custom Theme

1. Copy the `:root` block in `app/globals.css`
2. Create a new `[data-theme="custom"]` selector
3. Modify all variables to your liking
4. Update fonts in `app/layout.tsx` if needed
5. Set `NEXT_PUBLIC_THEME="custom"`

Example custom theme:

```css
[data-theme="bold"] {
  --font-sans: "Montserrat", system-ui, sans-serif;
  --font-heading: "Bebas Neue", sans-serif;
  
  --primary: 0 85% 50%;           /* Bold red */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 240 80% 50%;       /* Vivid blue */
  --secondary-foreground: 0 0% 100%;
  
  --background: 240 10% 10%;      /* Dark background */
  --foreground: 0 0% 95%;
  
  --radius: 0;                    /* Sharp corners */
}
```

## Component Customization

### Buttons

Edit `components/ui/button.tsx` to modify variants:

```typescript
const buttonVariants = cva(
  "...", // Base styles
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // Add or modify variants
        gradient: "bg-gradient-to-r from-primary to-secondary text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        // Add sizes
        huge: "h-14 px-12 text-lg",
      },
    },
  }
);
```

### Cards

Edit `components/ui/card.tsx` for card styling:

```typescript
const Card = ({ className, ...props }) => (
  <div
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-card",
      // Add hover effects, animations, etc.
      "transition-all duration-200 hover:shadow-elevated",
      className
    )}
    {...props}
  />
);
```

## Layout Customization

### Header

`components/layout/header.tsx`:
- Navigation links
- Logo styling
- Mobile menu behavior

### Footer

`components/layout/footer.tsx`:
- Footer columns
- Social links
- Copyright text

### Container Width

In `tailwind.config.ts`:

```typescript
theme: {
  container: {
    center: true,
    padding: "2rem",
    screens: {
      "2xl": "1400px",  // Max container width
    },
  },
},
```

## Hero Section

The hero section in `app/(public)/page.tsx` uses:

- `.hero-pattern` for subtle background gradients
- `.gradient-text` for colorful text
- Animation classes like `.animate-fade-in`

Customize the pattern:

```css
.hero-pattern {
  background-image: 
    radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.05) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, hsl(var(--secondary) / 0.05) 0%, transparent 50%);
}
```

## Animations

Available animation utilities:

```css
.animate-fade-in { ... }
.animation-delay-100 { animation-delay: 100ms; }
.animation-delay-200 { animation-delay: 200ms; }
/* etc. */
```

For staggered reveals, apply incrementing delays to child elements.

## Dark Mode

A dark mode is partially configured but not enabled by default. To enable:

1. Add dark mode toggle logic
2. Use the `.dark` class on `<html>`
3. Dark color overrides are in `app/globals.css` under `.dark`

## Testing Changes

1. Run `npm run dev`
2. Make changes to CSS variables
3. Changes apply immediately (hot reload)
4. Test on multiple screen sizes
5. Check color contrast for accessibility

## Accessibility Checklist

- Ensure color contrast ratio ≥ 4.5:1 for text
- Test focus states (`:focus-visible` styles)
- Verify keyboard navigation works
- Check screen reader compatibility
- Test with prefers-reduced-motion

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [HSL Color Picker](https://hslpicker.com/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Google Fonts](https://fonts.google.com/)
