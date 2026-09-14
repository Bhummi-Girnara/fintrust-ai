/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft primary palette
        primary: {
          50: "#f0f7ff",
          100: "#d0e2ff",
          200: "#a2c5ff",
          300: "#73a8ff",
          400: "#458bff",
          500: "#1c6eff",
          600: "#195bcc",
          700: "#144899",
          800: "#0f3566",
          900: "#0a2242",
        },
        // Soft background variants
        soft: {
          50: "#fafdff",
          100: "#f0f8ff",
          200: "#dceeff",
        },
        // Muted for subtle elements
        muted: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
        },
      },
      borderRadius: {
        // Increased radii for softer feel
        sm: "0.375rem", // 6px
        md: "0.5rem",   // 8px
        lg: "0.75rem",  // 12px
        xl: "1rem",     // 16px
        "2xl": "1.25rem", // 20px
        "3xl": "1.5rem",  // 24px
      },
      boxShadow: {
        // Soft, subtle shadows
        soft: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)",
        "soft-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        "soft-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.06)",
      },
      // Typography scale (optional, can also use default)
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      // Spacing stays default (4px grid)
    },
  },
  plugins: [],
};