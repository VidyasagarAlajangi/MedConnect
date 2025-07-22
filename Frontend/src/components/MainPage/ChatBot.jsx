import { useState, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; // Import rehype-raw

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "**Hello! How can I assist you with your health concerns today?**",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const prompt = `
  You are Medicare AI, a helpful medical assistant.
You can give information about symptoms, medications, prevention, and precautions related to illnesses.
You can also recommend doctors from a list, based on their specialty.

Guidelines for Response:

* Use simple language.
* Always use bold for important terms like **Fever**, **Pain**, **Medications**, **Symptoms**, **Precautions**, **When to See a Doctor**, etc.
* Make all section headings and key medical terms bold.
* Use bullet points for lists.
* Give clear, short advice.
* Use quotes for specific instructions ("Take this medicine").
* Warn about serious problems (like **URGENT: SEE A DOCTOR NOW**).

Response Format:

**Condition:** [Illness Name]

**Symptoms:**
* [Symptom 1]
* [Symptom 2]
* ...

**Medications:** (if needed)
* [Medicine Name]: "[How to take it]"
* Possible medicine: "[Medicine name]" (Talk to your doctor)

**Precautions:**
* [Action 1]
* [Action 2]
* ...

**Suggestions:**
* [Suggestion 1]
* [Suggestion 2]
* ...

**When to See a Doctor:**
* [Reason 1]
* [Reason 2]


* Doctor type: [Specialty]

dont give doctor type in bold or in ** these quotes.
For a given disease,suggest the appropriate doctor type from the listed specializations. If the disease does not fall under any of these, provide the closest related specialization.

listed specializations : [General Physician, Cardiologist, Neurologist, Orthopedic Surgeon, Pulmonologist, Gastroenterologist, Endocrinologist, Nephrologist, Oncologist, Dermatologist, Ophthalmologist, Otolaryngologist (ENT Specialist), Rheumatologist, Hematologist, Urologist, Psychiatrist, Pediatrician, Gynecologist, Immunologist , Infectious Disease Specialist.]
If it's serious, say to see a doctor right away.
If the question is not about health, say: "Sorry it is irrelevant to my purpose. I can't help with that."
  `;
  const getBotResponse = async (userMessage) => {
    setIsLoading(true);

    try {
      // Step 1: Get AI Response
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyA_DBfQCGHA75C2Y3KEdr5g-8Blmb2AKZ8",
        {
          contents: [
            {
              parts: [
                {
                  text: `${
                    prompt || "Default Prompt"
                  }\n\nUser: ${userMessage}\n\nAssistant:`,
                },
              ],
            },
          ],
        },
        { headers: { "Content-Type": "application/json" } }
      );

      let botReply =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm not sure how to respond.";

      console.log("Gemini Raw Bot Reply:", botReply);

      // Step 2: Extract Doctor Specialization (handle multiple)
      const specializationMatch = botReply.match(/Doctor type:\s*(.+)/i);

      let specialization = null;

      if (specializationMatch) {
        const specializations = specializationMatch[1]
          .split(/or|and|,/i)
          .map((s) => s.trim())
          .filter((s) => s);
        specialization = specializations[0]; // Take the first match
      }

      console.log("Extracted Specialization:", specialization);

      // Step 3: Fetch Doctors if Specialization is Found
      if (specialization) {
        try {
          const doctorResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors?specialization=${encodeURIComponent(specialization)}`,
            { 
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
              }
            }
          );

          const doctors = Array.isArray(doctorResponse?.data?.data)
            ? doctorResponse.data.data
            : [];

          if (doctors.length > 0) {
            const doctorList = doctors
              .map(
                (doc) =>
                  `<div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 10px; background-color: #f9fafb;">
          <p style="font-size: 16px; font-weight: bold; color: #1a202c;">Dr. ${doc.name}</p>
          <p style="font-size: 14px; color: #4a5568;">Specialization: ${doc.specialization}</p>
          <a href="/doctor/${doc._id}" style="color: #319795; font-weight: bold; text-decoration: none;">View Profile</a>
        </div>`
              )
              .join("");

            botReply += `<div style="margin-top: 20px;">
    <p style="font-size: 18px; font-weight: bold; color: #2d3748;">Recommended Doctors:</p>
    ${doctorList}
  </div>`;
          } else {
            botReply += `<div style="margin-top: 20px;">
    <p style="font-size: 18px; font-weight: bold; color: #2d3748;">No doctors found for this specialization.</p>
    <p style="color: #4a5568;">Please try searching for a different specialization or contact our support.</p>
  </div>`;
          }
        } catch (error) {
          console.error("Error fetching doctors:", error);
          if (error.code === 'ERR_NETWORK') {
            botReply += `\n\n**Unable to connect to the server. Please check your internet connection and try again.**`;
          } else {
            botReply += `\n\n**Error fetching doctor data. Please try again later.**`;
          }
        }
      } else {
        botReply += `\n\n**Sorry, I couldn't identify a specialization.**`;
      }

      return botReply;
    } catch (error) {
      console.error("Error in getBotResponse:", error);
      return "Sorry, I'm having trouble responding right now.";
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    try {
      const botReplyText = await getBotResponse(input);

      const botMessage = {
        id: Date.now() + 1,
        text: botReplyText,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.log(error);
    }
  };

  // Loading animation component
  const LoadingIndicator = () => (
    <div className="flex space-x-1 justify-center items-center p-2">
      <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"></div>
      <div
        className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
        style={{ animationDelay: "0.2s" }}
      ></div>
      <div
        className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
        style={{ animationDelay: "0.4s" }}
      ></div>
    </div>
  );

  return (
    <div className="flex justify-center items-center  bg-gradient-to-br from-blue-50 to-teal-50 p-2">
      <div className="flex flex-col h-[560px] w-full  m-8 max-w-[75%] rounded-2xl shadow-xl overflow-hidden bg-white">

        <div className="bg-indigo-500 text-white p-3 text-center font-bold text-lg shadow-md">
          <div className="flex items-center justify-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>Health Chat Assistant</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`relative max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${
                    message.sender === "user"
                      ? "bg-teal-600 text-white rounded-tr-none"
                      : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {message.text}
                  </ReactMarkdown>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-teal-100 text-right"
                        : "text-slate-400"
                    }`}
                  >
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-800 px-4 py-2 rounded-2xl rounded-tl-none border border-slate-200">
                  <LoadingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="p-3 border-t flex items-center bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about health issues..."
            className="flex-1 p-3 border text-black bg-white border-slate-300 rounded-full mr-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium placeholder:text-slate-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="bg-teal-600 text-white p-3 rounded-full transition duration-200 hover:bg-teal-700 shadow-md disabled:opacity-50 flex justify-center items-center"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
