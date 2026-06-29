# Personal Portfolio Website — Week 3: JavaScript

**Course:** Web Development | MIT ADT University (MITSoE)  
**Student:** Harsh  
**Branch:** B.Tech Computer Science & Engineering  
**Week Focus:** JavaScript — Making Websites Interactive

---

## Project Overview

This is the Week 3 iteration of my personal portfolio website, enhanced with JavaScript to add interactivity, form validation, and dynamic content. The project builds on the HTML/CSS foundation from Weeks 1–2.

---

## File Structure

```
portfolio/
├── index.html       ← Main page structure
├── style.css        ← Styling + dark mode variables
├── script.js        ← All JavaScript functionality
├── README.md        ← This file
└── images/          ← Project images (placeholder)
```

---

## JavaScript Features Implemented

| Feature | Description |
|---|---|
| Dark / Light Mode | Toggle with `localStorage` persistence across sessions |
| Typing Animation | Cycles through role titles with typewriter effect |
| Sticky Navbar | Highlights active section on scroll |
| Counter Animation | Stats count up when scrolled into view |
| Skill Bar Animation | Bars fill in using `IntersectionObserver` |
| Image Slider | Auto-play + manual prev/next + dot navigation |
| Project Filter | Filter cards by category without page reload |
| Form Validation | Real-time + submit validation with error messages |
| Character Counter | Live count on message textarea |
| Back to Top Button | Appears on scroll, smooth-scrolls to top |
| Hamburger Menu | Mobile navigation toggle |
| Dynamic Footer Year | Automatically shows current year |

---

## Setup Instructions

1. Clone or download the repository
2. Open `index.html` in any modern browser — no server needed
3. All files must remain in the same folder

```bash
git clone https://github.com/harsh/portfolio
cd portfolio
# Open index.html in your browser
```

---

## DOM Manipulation Used

- `document.getElementById()` — selecting specific elements
- `document.querySelectorAll()` — selecting groups of elements
- `element.classList.add/remove/toggle()` — updating CSS classes
- `element.textContent` — changing displayed text
- `localStorage.setItem/getItem()` — saving user preferences

---

## Event Listeners Used

- `click` — dark mode toggle, slider buttons, filter buttons, form submit
- `scroll` — navbar highlight, back-to-top visibility
- `blur` — real-time form field validation
- `focus` — clear field error on re-focus
- `input` — character counter update
- `keydown` — keyboard arrow keys for slider
- `DOMContentLoaded` — initialise all features after DOM is ready

---

## Form Validation Logic

The contact form validates:
- **Name** — required, min 2 characters
- **Email** — required, must match `user@domain.tld` pattern
- **Subject** — required, min 3 characters
- **Message** — required, min 20 characters

Validation runs on `blur` (when user leaves a field) and again on submit. Fields turn green (valid) or red (error) with descriptive error messages beneath each input.

---

## Technologies Used

- HTML5 (semantic elements)
- CSS3 (custom properties, Grid, Flexbox, transitions)
- Vanilla JavaScript (ES6+, no libraries or frameworks)

---

## Browser Compatibility

Tested in: Chrome, Firefox, Edge, Safari (mobile + desktop)
