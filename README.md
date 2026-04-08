# Wall Calendar — Interactive React Component

A React-based wall calendar with range selection, notes, and theme switching.

## Features

* Wall calendar UI with hero image and binding design
* Month navigation with flip animation
* Date range selection (click start → hover → click end)
* Notes per date and per month (stored in localStorage)
* Light and dark theme toggle
* Responsive layout for all screen sizes
* Highlight for today
* Indicator for saved notes
* Different image for each month

## Running Locally

Requirements:

* Node.js 18+

```bash
git clone <your-repo-url>
cd wall-calendar
npm install
npm run dev
```

Open: http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

* React
* Vite
* CSS
* localStorage

## Project Structure

```
src/
├── main.jsx
├── App.jsx
├── App.css
└── index.css
```

## Deployment

```bash
npm i -g vercel
vercel
```
deployed on: https://wall-calendar-8sp3-c37z3s3qm-pandeysans-projects.vercel.app