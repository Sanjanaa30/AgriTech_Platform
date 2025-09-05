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
1. AgriTech_Platform/
  - frontend/ # Angular app (farmer dashboard, UI components)
  - backend/ # Node.js/Express backend APIs
  - ml-services/ # (optional) FastAPI-based ML modules for AI/ML features
  - README.md # Project documentation
  - .gitignore # Ensures .env and node_modules are not tracked

---

## ⚙️ Setup Instructions
### 1. Clone the repository
```
git clone https://github.com/Sanjanaa30/AgriTech_Platform.git
cd AgriTech_Platform
```

### 2. Frontend Setup (Angular)
```
cd frontend
npm install
ng serve --open
```
Frontend runs on http://localhost:4200

### 3.  Connecting to MongoDB Atlas
This project uses **MongoDB Atlas** as the database.
- Log in to MongoDB Atlas.
- Obtain the cluster connection string (from the Atlas dashboard).
  Example:
```
mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/agritech?retryWrites=true&w=majority
```
- In the backend/ folder, copy .env.example to .env:
```
cp .env.example .env # Linux/Mac
copy .env.example .env # Windows (PowerShell)
```
- Update the .env file with your credentials:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/agritech
PORT=5000
```
- Start the backend:
```
npx nodemon server.js
```
 The server will automatically connect to MongoDB Atlas.

### 4. Backend Setup (Node.js + Express)
```
cd backend
npm install
npx nodemon server.js
```

---

## 🔒 Environment Configuration 
- `.env` contains sensitive credentials and should **never** be committed to GitHub.
- The repository’s `.gitignore` ensures `.env` is ignored.
- Use `.env.example` to share the required variables safely.  

---

## Roadmap
- Farmer dashboard with crop management
- AI/ML pipeline for crop health detection
- Market price trend alerts
- Harvest/irrigation scheduling

---

## Note
 This project is only for learning and development purposes. 






















