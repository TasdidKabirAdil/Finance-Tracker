# 💸 Kaneflow – Personal Finance Tracker

## 🧠 Overview  
**Kaneflow** is a modern full-stack web application designed to help individuals take control of their personal spending. With daily expense tracking, monthly financial summaries, savings goals, and AI-generated budget suggestions, it delivers a smart and personalized budgeting experience across devices.

---

## 🎯 Project Purpose  

This application was developed to:

- Build a responsive and secure personal finance tracking system  
- Use GraphQL for flexible API querying  
- Implement AI-assisted saving suggestions based on real expense history  
- Visualize financial data with interactive and dynamic charts  
- Practice full-stack deployment using cloud platforms  

---

## 💼 Key Features  

### 👤 User Features  
- Register, log in, and reset password securely  
- Set and manage monthly savings goals  
- Get AI-powered budget suggestions tailored to past behavior  
- Add, edit, and delete daily expenses by category  
- View summary of daily/monthly spending patterns  
- Visual breakdown of category-wise expenses (bar/pie/donut charts)  
- Compare spending across the past 5 months  
- View financial reports with top spending categories and savings  

---

## 🧠 AI-Powered Budget Suggestions  

A custom AI suggestion system helps users optimize their spending across flexible and volatile categories based on:

- Past 3 months' financial behavior  
- Income and target savings for the month  
- Fixed vs. flexible category rules  
- Realistic cutback percentages (0–30%) for each group  

🔍 Output includes optimized thresholds and a friendly recommendation note.

---

## 🧱 Tech Stack  

| Layer     | Stack                                      |
|-----------|--------------------------------------------|
| Frontend  | React 18+, Vite, Apollo Client, CSS Modules |
| Backend   | Node.js, Express, Apollo Server, GraphQL   |
| Database  | MongoDB (Mongoose ODM)                     |
| AI Logic  | Custom Budget Suggestion Engine (Rules-based) |
| Hosting   | Frontend: Netlify · Backend: Railway       |
| CI/CD     | GitHub + Railway + Netlify Integration     |

---

## 🛠️ Running Locally

### 📦 Prerequisites  
- Node.js v16+  
- MongoDB (local or cloud cluster)

### 🧩 Installation  

Clone this repo:

Backend
```
git clone https://github.com/your-username/Finance-Tracker.git
cd Finance-Tracker/backend
npm install
cp .env.example .env

```
Frontend
```
cd Finance-Tracker/frontend
npm install

```

# Add your Mongo URI and JWT_SECRET in the .env
npm run dev