/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./frontend/**/*.{vue,js}"
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: 'hsl(var(--card) / <alpha-value>)',
        'card-foreground': 'hsl(var(--card-foreground) / <alpha-value>)',
        panel: 'hsl(var(--panel) / <alpha-value>)',
        'panel-foreground': 'hsl(var(--panel-foreground) / <alpha-value>)',
        popover: 'hsl(var(--popover) / <alpha-value>)',
        'popover-foreground': 'hsl(var(--popover-foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
          soft: 'hsl(var(--primary-soft) / <alpha-value>)',
          strong: 'hsl(var(--primary-strong) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        'border-strong': 'hsl(var(--border-strong) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        sidebar: 'hsl(var(--sidebar) / <alpha-value>)',
        'sidebar-foreground': 'hsl(var(--sidebar-foreground) / <alpha-value>)',
        'sidebar-border': 'hsl(var(--sidebar-border) / <alpha-value>)',
        'sidebar-accent': 'hsl(var(--sidebar-accent) / <alpha-value>)',
        dc: {
          primary: 'hsl(var(--primary) / <alpha-value>)',
          'primary-light': 'hsl(var(--primary-soft) / <alpha-value>)',
          'primary-dark': 'hsl(var(--primary-strong) / <alpha-value>)',
          accent: 'hsl(var(--accent) / <alpha-value>)',
          dark: 'hsl(var(--foreground) / <alpha-value>)',
          light: 'hsl(var(--muted) / <alpha-value>)',
        }
      }
    }
  },
  plugins: []
}
