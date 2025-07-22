# MedConnect 🏥💬

**MedConnect** is a comprehensive telemedicine platform designed to revolutionize the healthcare experience by connecting patients, doctors, and pharmacies through a seamless digital interface. Built using the MERN stack, it integrates AI-powered symptom analysis, real-time consultations, and smart medicine delivery options to provide quality care from the comfort of your home.

---

## 🚀 Features

### 👨‍⚕️ For Patients

- **Registration & Profile**: Create and manage your health profile securely.
- **Symptom Checker**: AI-powered bot to detect diseases from symptoms using ML APIs.
- **Doctor Recommendations**: Filter and find best-rated doctors by specialization.
- **Virtual Consultations**: Schedule and join video calls via integrated Meet API.
- **Prescription & Delivery**: Receive e-prescriptions and get meds delivered from nearby pharmacies.

### �펺 For Doctors

- **Doctor Dashboard**: View patient details, past consultations, and prescribe medications.
- **Appointment Scheduling**: Accept/reject appointments and manage availability.
- **Secure Communication**: Meet integration for private video sessions.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI Integration**: Gemini API 
- **Authentication**: JWT-based secure login
- **Video Conferencing**: Agora API
- **Cloud**: Cloudinary (for storing prescriptions/images)

---

## 📂 Folder Structure

```
medconnect/
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│
├── backend/               # Node.js + Express backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── ...
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/VidyasagarAlajangi/medconnect.git
cd medconnect
```

### 2. Setup Backend

```bash
cd backend
npm install
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```



## 🔐 Environment Variables

Create `.env` files in the appropriate directories and include:

### For `server/.env`

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
MEET_API_KEY=your_meet_api_key
```

---

## 📈 Future Enhancements

- Real-time chat between doctor and patient
- Payment gateway for appointment booking
- Admin dashboard for managing users and analytics
- EHR (Electronic Health Records) integration

---

## 🤝 Contributing

1. Fork this repo 🍴
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-name`)
5. Open a Pull Request ✅

---


## 💡 Inspiration

MedConnect was built to reduce the gap between patients and healthcare access, especially in underserved or rural areas. With AI assistance and seamless connectivity, quality healthcare can be made more accessible and efficient.

---


## 📢 Contact

- **Developer**: [Vidya Sagar Alajangi](https://github.com/VidyasagarAlajangi/)
- **Email**: [vidyasagaralajangi@gmail.com](mailto\:vidyasagaralajangi@gmail.com)]
- **LinkedIn**: ([Profile](https://www.linkedin.com/in/alajangi-vidyasagar/))

---

