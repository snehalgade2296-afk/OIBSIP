# ⚡ TaskFlow — Premium Task Manager

A visually stunning, production-ready To-Do Web App that feels like a modern SaaS productivity tool.

---

## 🚀 Features

### Core
| Feature | Detail |
|---|---|
| Add Tasks | Input with validation, Enter key support, error shake animation |
| Pending Tasks | Cards with creation date/time, priority badge, edit/delete/complete actions |
| Completed Tasks | Separate section with completion timestamp, strike-through style, undo support |
| Task Editing | Smooth modal with inline priority selector |
| Task Deletion | Confirmation dialog before removal, animated card exit |

### Advanced
| Feature | Detail |
|---|---|
| Statistics Dashboard | Progress ring + bar, total/pending/done counts |
| Search & Filter | Real-time search, All / Pending / Completed chips + sidebar nav |
| Priority Levels | High (Red), Medium (Orange), Low (Green) — badge on every card |
| Local Storage | Full persistence across page refreshes |
| Dark / Light Mode | Toggle with preference saved to localStorage |

### Interactive Extras
| Feature | Detail |
|---|---|
| Drag & Drop | Reorder tasks within the same section |
| Confetti 🎉 | Canvas confetti burst when a task is completed |
| Live Clock | Real-time HH:MM:SS display in the header |
| Progress Ring | SVG gradient ring showing % completion |
| Keyboard Shortcuts | `Enter` to add, `Ctrl+Enter` to save edit, `Esc` to close modals |
| Toast Notifications | Add / Edit / Delete / Complete actions all show styled toasts |
| Motivational Messages | Rotates every 8 seconds in the header |
| Floating Action Button | Mobile FAB scrolls to input and focuses it |

---

## 📁 File Structure

```
taskflow/
├── index.html          # Main HTML — layout, modals, skeleton
├── css/
│   └── style.css       # Full styling — variables, glassmorphism, animations, responsive
├── js/
│   └── app.js          # All JavaScript — state, CRUD, render, drag-drop, confetti
└── README.md           # This file
```

---

## 🎨 Design Highlights

- **Aesthetic:** Dark-first glassmorphism dashboard with vivid accent gradients
- **Fonts:** [Syne](https://fonts.google.com/specimen/Syne) (headings) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) (body)
- **Icons:** [Font Awesome 6](https://fontawesome.com/)
- **CSS Variables:** Full theming system — swap dark ↔ light instantly
- **Animations:** Card enter/exit, toast slide, confetti canvas, modal scale, progress ring

---

## 🖥️ How to Use

1. **Open** `index.html` in any modern browser — no server needed.
2. **Add a task:** Type in the input bar, choose a priority, press `Add Task` or `Enter`.
3. **Complete a task:** Click the circle on the left of any pending card.
4. **Edit a task:** Click the ✏️ pencil icon, update text & priority, save.
5. **Delete a task:** Click the 🗑️ trash icon and confirm.
6. **Reorder:** Drag cards up/down within their section.
7. **Filter:** Use the sidebar nav or the chips above the task list.
8. **Theme:** Toggle dark/light with the button at the bottom of the sidebar.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Enter` | Add task (when input is focused) |
| `Ctrl + Enter` | Save edit (inside edit modal) |
| `Esc` | Close any open modal |

---

## 🔧 Technical Notes

- **Zero dependencies** — pure HTML, CSS, and vanilla JavaScript.
- **No build step** — open directly in a browser.
- **LocalStorage schema** — key `taskflow_tasks_v2`, stored as JSON array.
- **Accessibility** — ARIA labels on all interactive elements, live regions for clock/toasts.
- **Performance** — DOM diffing (update in-place instead of full re-render), CSS transitions offloaded to the GPU with `transform` and `opacity`.
- **Responsive** — sidebar collapses to overlay on ≤ 900 px; FAB visible on mobile; all layouts stack gracefully at 375 px.

---

## 📸 Browser Support

| Browser | Support |
|---|---|
| Chrome 100+ | ✅ Full |
| Firefox 100+ | ✅ Full |
| Safari 15.4+ | ✅ Full (`:has()` required for priority radio highlight) |
| Edge 100+ | ✅ Full |

---

## 📄 License

MIT — free to use, modify, and distribute.

---

Made with ⚡ by **TaskFlow**
