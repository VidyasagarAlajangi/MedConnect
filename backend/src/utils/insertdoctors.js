const mongoose = require("mongoose");
const Doctor = require("./models/Doctor"); // Adjust the path if needed

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Database connected successfully");
}).catch((error) => {
  console.error("Database connection error: ", error);
});



const sampleDoctors = [
  {
    user: "65fd1a3c5c7b1a001d2e8f00",
    specialization: "Cardiologist",
    experience: 10,
    address: "123 Heart St, NY",
    availableSlots: [
      { date: "2025-04-10", slots: ["10:00 AM", "11:00 AM", "2:00 PM"] },
      { date: "2025-04-11", slots: ["9:00 AM", "1:00 PM"] }
    ]
  },
  {
    user: "65fd1a3c5c7b1a001d2e8f01",
    specialization: "Dermatologist",
    experience: 8,
    address: "456 Skin Ave, CA",
    availableSlots: [
      { date: "2025-04-12", slots: ["10:30 AM", "3:00 PM"] },
      { date: "2025-04-13", slots: ["9:00 AM", "11:00 AM"] }
    ]
  },
  {
    user: "65fd1a3c5c7b1a001d2e8f02",
    specialization: "Neurologist",
    experience: 12,
    address: "789 Brain Rd, TX",
    availableSlots: [
      { date: "2025-04-15", slots: ["8:00 AM", "12:00 PM"] },
      { date: "2025-04-16", slots: ["9:00 AM", "4:00 PM"] }
    ]
  },
  {
    user: "65fd1a3c5c7b1a001d2e8f03",
    specialization: "Orthopedic",
    experience: 15,
    address: "111 Bone St, FL",
    availableSlots: [
      { date: "2025-04-17", slots: ["10:00 AM", "1:00 PM"] }
    ]
  },
  {
    user: "65fd1a3c5c7b1a001d2e8f04",
    specialization: "Pediatrician",
    experience: 7,
    address: "222 Kids St, IL",
    availableSlots: [
      { date: "2025-04-18", slots: ["9:00 AM", "3:00 PM"] }
    ]
  }
];

// Adding 10 more sample doctors with varied details
for (let i = 5; i < 15; i++) {
  sampleDoctors.push({
    user: `65fd1a3c5c7b1a001d2e8f${i.toString().padStart(2, "0")}`,
    specialization: ["Ophthalmologist", "ENT", "Gynecologist", "Dentist", "Psychiatrist", "Surgeon", "Radiologist", "Anesthesiologist", "Urologist", "Endocrinologist"][i % 10],
    experience: 5 + (i % 10),
    address: `${100 + i} Medical Plaza, City ${i}`,
    availableSlots: [
      { date: `2025-04-${10 + (i % 10)}`, slots: ["10:00 AM", "1:00 PM", "3:00 PM"] }
    ]
  });
}

Doctor.insertMany(sampleDoctors)
  .then(() => {
    console.log("Sample doctors inserted successfully");
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error("Error inserting doctors: ", error);
  });
