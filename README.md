# 🌾 AgriTech Platform

An end-to-end platform designed to help farmers manage crops, track field images, and analyze agricultural data with AI/ML features such as crop health detection, growth stage estimation, market analysis and yield prediction.  

This project integrates a modern frontend, backend services, and MongoDB Atlas for data storage.

---

## 🚀 Features
- Farmer dashboard with **My Crops** and **Field Images** modules  
- Upload and manage crop/field images  
- Track crop categories and varieties 
- AI/ML integration (future: crop disease detection, yield prediction, irrigation scheduling)  
- Modular architecture for easy extension  

---

## 🛠️ Tech Stack
- **Frontend:** Angular + Tailwind CSS  
- **Backend:** Node.js + Express (runs with **nodemon**)  
- **Database:** MongoDB Atlas (external cluster)  
- **Styling:** Tailwind CSS  
- **Other:** REST APIs for integration, GitHub for version control  

---

## 📂 Project Structure
AgriTech_Platform/
│── frontend/ # Angular app (farmer dashboard, UI components)
│── backend/ # Node.js/Express backend APIs
│── ml-services/ # (optional) FastAPI-based ML modules for AI/ML features
│── README.md # Project documentation
│── .gitignore # Ensures .env and node_modules are not tracked

yaml
Copy code

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Sanjanaa30/AgriTech_Platform.git
cd AgriTech_Platform
2. Frontend Setup (Angular)
bash
Copy code
cd frontend
npm install
ng serve --open
Frontend runs on http://localhost:4200

3. Backend Setup (Node.js + Express)
bash
Copy code
cd backend
npm install
npx nodemon server.js
Backend runs on http://localhost:3000











