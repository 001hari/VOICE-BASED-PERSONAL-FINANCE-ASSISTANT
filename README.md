# Personal Expense Tracker

A voice-first personal finance assistant built with React. Track expenses, set budgets, manage financial goals, and get smart saving suggestions — all with voice or manual input.

## Features

- **Voice-based expense entry** — Speak to add transactions (Web Speech API)
- **Manual/text entry** — Traditional form with type, category, amount, date
- **Automatic categorization** — Voice parser matches income/expense categories
- **Voice date parsing** — Say "yesterday", "Monday", "March 5th" etc.
- **Income & budget tracking** — Set monthly budget, track spending progress
- **Financial goal setting** — Create savings goals with progress tracking
- **Smart saving suggestions** — Personalized tips based on spending patterns
- **Monthly spending insights** — Category breakdowns, comparisons, forecasts
- **Overspending alerts** — Warnings when approaching/exceeding budget
- **Balance prediction** — End-of-month spending forecast

## Tech Stack

- React 16 (Create React App)
- Material UI v4 (Icons)
- Chart.js + react-chartjs-2 (Doughnut charts)
- Web Speech API (Voice recognition)
- CSS (Nothing-inspired design system)
- localStorage (Data persistence)

## Getting Started

```bash
npm install --legacy-peer-deps
npm start
```

Open [http://localhost:3000](http://localhost:3000) in **Chrome** or **Edge** for voice input support.

## Voice Commands

- "Add income 500 salary today"
- "Expense 100 food yesterday"
- "Income 45000 salary Monday"
- "Spent 2000 on travel"

Made by - Hari
