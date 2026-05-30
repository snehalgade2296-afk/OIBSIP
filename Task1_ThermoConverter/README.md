# 🌡️ ThermoConvert

A **modern, professional, and highly interactive Temperature Converter** built with pure HTML, CSS, and Vanilla JavaScript. No frameworks, no dependencies — just clean, production-quality code.

---

## ✨ Features

### Core Conversion
- ✅ Celsius ↔ Fahrenheit ↔ Kelvin (all six directions)
- ✅ Real-time preview as you type
- ✅ Formula display with each result
- ✅ All-units panel (shows C, F, and K simultaneously)
- ✅ Absolute zero validation (no physically impossible temperatures)
- ✅ Formatted output to 2 decimal places

### UI / UX
- ✅ **Dark / Light mode** toggle (preference saved in localStorage)
- ✅ Glassmorphism design with animated background orbs
- ✅ Gradient hero title, warm amber-orange accent system
- ✅ Fully responsive — mobile, tablet, and desktop
- ✅ Smooth CSS animations and micro-interactions
- ✅ Live date/time clock in the header
- ✅ Loading spinner on the Convert button (premium feel)

### Interactivity
- ✅ **Swap units** button with 360° spin animation
- ✅ **Copy to clipboard** button for the result
- ✅ **Toast notifications** (success, error, info)
- ✅ Keyboard shortcut: `Enter` to convert, `Ctrl/Cmd + K` to focus input
- ✅ Accessible (ARIA labels, roles, `aria-live` regions)

### History
- ✅ Conversion history (last 20 entries)
- ✅ Persisted in `localStorage` between sessions
- ✅ "Clear All" button
- ✅ Time-stamped entries

---

## 📁 File Structure

```
temperature-converter/
├── index.html          — Main HTML (semantic, accessible)
├── css/
│   └── style.css       — All styles (glassmorphism, dark/light, animations)
├── js/
│   └── app.js          — All JavaScript (conversion, UI, state)
└── README.md           — This file
```

---

## 🚀 Getting Started

1. **Download** or clone the project folder.
2. Open `index.html` in any modern browser.
3. No build step, no server, no dependencies required.

```bash
# If you have Python installed, you can run a quick local server:
python3 -m http.server 8080
# Then open http://localhost:8080
```

---

## 🧮 Conversion Formulas

| From        | To          | Formula                              |
|-------------|-------------|--------------------------------------|
| Celsius     | Fahrenheit  | `F = (C × 9/5) + 32`                 |
| Fahrenheit  | Celsius     | `C = (F − 32) × 5/9`                 |
| Celsius     | Kelvin      | `K = C + 273.15`                     |
| Kelvin      | Celsius     | `C = K − 273.15`                     |
| Fahrenheit  | Kelvin      | `K = (F − 32) × 5/9 + 273.15`        |
| Kelvin      | Fahrenheit  | `F = (K − 273.15) × 9/5 + 32`        |

---

## ⌨️ Keyboard Shortcuts

| Key              | Action                          |
|------------------|---------------------------------|
| `Enter`          | Trigger conversion              |
| `Ctrl / Cmd + K` | Focus the temperature input     |

---

## 🛠️ Technology Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Markup     | HTML5 (semantic, ARIA-accessible)           |
| Styling    | CSS3 (custom properties, glassmorphism, keyframes) |
| Logic      | Vanilla JavaScript ES6+ (no libraries)      |
| Fonts      | Google Fonts — Syne + DM Sans               |
| Storage    | `localStorage` (history + theme preference) |

---

## 🎨 Design Decisions

- **Aesthetic**: Dark-first glassmorphism with a warm amber-orange accent system — avoids generic purple-on-white AI aesthetics
- **Typography**: `Syne` (display / headings) paired with `DM Sans` (body) — characterful, editorial
- **Animation philosophy**: High-impact moments (page load stagger, result pop-in, swap spin) over scattered micro-interactions
- **Color**: A single dominant accent (`#ff7b2c`) with a warm companion (`#ffb347`) — confident, not timid

---

## 📱 Browser Support

Works in all modern browsers:
- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

> `backdrop-filter` (glassmorphism blur) degrades gracefully in unsupported browsers — the UI still looks great.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with precision and care — ThermoConvert*
