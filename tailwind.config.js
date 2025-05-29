module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 主色调
        "brand-blue": {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
          pressed: "#1e40af",
          dark: "#3b82f6",
        },
        // 辅助色系
        "app-gray": {
          light: "#f9fafb",
          border: "#d1d5db",
          text: "#6b7280",
          dark: "#111827",
        },
        // 功能色
        "app-success": "#10b981",
        "app-warning": "#f59e0b",
        "app-error": "#ef4444",
        "app-info": "#3b82f6",
        // 功能色 - 暗色版本
        "success-dark": "#34d399",
        "warning-dark": "#fbbf24",
        "error-dark": "#f87171",
        "info-dark": "#60a5fa",
        // 暗色主题
        "dark": {
          bg: "#1a1a1a",
          card: "#2d2d2d",
          text: "#ffffff",
          "text-secondary": "#a3a3a3",
          border: "#404040",
          "bg-light": "#383838",
        },
        // shadcn/ui compatible colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'light': '0 2px 8px rgba(0,0,0,0.1)',
        'medium': '0 4px 12px rgba(0,0,0,0.15)',
        'heavy': '0 8px 16px rgba(0,0,0,0.2)',
      },
      height: {
        'topbar': '60px',
        'statusbar': '30px',
      },
      width: {
        'sidebar': '280px',
        'sidebar-collapsed': '80px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}
