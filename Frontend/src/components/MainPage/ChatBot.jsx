import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { addMessage, updateChatHistory, clearChat } from "../../utils/chatSlice";
import { Send, Trash2 } from "lucide-react";

const BOT_AVATAR = (
  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
      <circle cx="9" cy="13" r="1" fill="white" stroke="none" />
      <circle cx="15" cy="13" r="1" fill="white" stroke="none" />
    </svg>
  </div>
);

const SUGGESTIONS = ["I have a headache", "Suggest a cardiologist", "Cold and fever symptoms"];

const ChatBot = () => {
  const dispatch = useDispatch();
  const { messages, chatHistory } = useSelector((state) => state.chat);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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
For a given disease,suggest the appropriate doctor type from the listed specializations. If the disease does not fall under any of these, provide the closest related specialization.

listed specializations : [General Physician, Cardiologist, Neurologist, Orthopedic Surgeon, Pulmonologist, Gastroenterologist, Endocrinologist, Nephrologist, Oncologist, Dermatologist, Ophthalmologist, Otolaryngologist (ENT Specialist), Rheumatologist, Hematologist, Urologist, Psychiatrist, Pediatrician, Gynecologist, Immunologist , Infectious Disease Specialist.]
If it's serious, say to see a doctor right away.
If the question is not about health, say: "Sorry it is irrelevant to my purpose. I can't help with that."
  `;
  const getBotResponse = async (userMessage) => {
    setIsLoading(true);

    try {
      // Step 1: Get AI Response from Backend (with full conversation history for context)
      const response = await axiosInstance.post("/api/chat/ai", {
        message: userMessage,
        history: chatHistory,  // send prior turns so AI remembers context
      });

      let botReply = response.data?.reply || "I'm not sure how to respond.";

      // Step 2: Update history with this exchange (keep last 20 turns to stay within token limits)
      dispatch(updateChatHistory({ userMessage, botReply }));

      console.log("Backend AI Reply:", botReply);

      // Step 3: Extract Doctor Specialization
      // Gemini may format as: "* Doctor type: General Physician"
      //                    or: "Doctor type: **General Physician**"
      //                    or: "- Doctor type: Cardiologist"
      // We strip bullet markers, bold markers, and extra whitespace
      const specializationMatch = botReply.match(
        /(?:\*|-|•)?\s*doctor\s+type\s*:\s*\*{0,2}([^*\n]+)\*{0,2}/i
      );

      let specialization = null;

      if (specializationMatch) {
        // Take the first entry (before "or" / "and" / ",")
        const raw = specializationMatch[1].trim();
        const first = raw.split(/\s*(?:or|and|,)\s*/i)[0].trim();
        // Strip any trailing punctuation or parenthetical
        specialization = first.replace(/[.,;:!?]+$/, "").split("(")[0].trim();
      }

      // Also try to find using the known specialization list as a fallback
      // These must EXACTLY match values stored in the DB
      if (!specialization) {
        const knownSpecializations = [
          "General Physician", "Cardiologist", "Neurologist", "Orthopedic",
          "Pulmonologist", "Gastroenterologist", "Endocrinologist", "Nephrologist",
          "Oncologist", "Dermatologist", "Ophthalmologist", "ENT",
          "Rheumatologist", "Hematologist", "Urologist",
          "Psychiatrist", "Pediatrician", "Gynecologist", "Immunologist",
          "Infectious Disease Specialist",
        ];
        for (const spec of knownSpecializations) {
          if (new RegExp(`\\b${spec}\\b`, "i").test(botReply)) {
            specialization = spec;
            break;
          }
        }
      }

      console.log("Extracted Specialization:", specialization);

      // Step 3: Fetch Doctors if Specialization is Found
      if (specialization) {
        try {
          const doctorResponse = await axiosInstance.get(
            `/api/doctors?specialization=${encodeURIComponent(specialization)}`
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
            botReply += `<div style="margin-top: 20px; color: #718096;">
    <p>No registered doctors found for <strong>${specialization}</strong> in our system.</p>
  </div>`;
          }
        } catch (error) {
          console.error("Error fetching doctors:", error);
          botReply += `\n\n**Error fetching doctor data. Please try again later.**`;
        }
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
    if (!input.trim() || isLoading) return;
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    dispatch(addMessage(userMessage));
    const msgText = input;
    setInput("");
    try {
      const botReplyText = await getBotResponse(msgText);
      const botMessage = {
        id: Date.now() + 1,
        text: botReplyText,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      dispatch(addMessage(botMessage));
    } catch (error) {
      console.log(error);
    }
  };

  /* ── FIX: prevent Enter key from scrolling the page ── */
  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Loading dots ─────────────────────────────────── */
  const LoadingDots = () => (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-2 h-2 rounded-full bg-blue-400 inline-block"
          style={{ animation: `chatBounce 1.3s ${i * 0.18}s ease-in-out infinite` }} />
      ))}
    </div>
  );

  /* ── Empty state with suggestion chips ─────────────── */
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full gap-5 select-none px-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
          <circle cx="9" cy="13" r="1" fill="white" stroke="none" />
          <circle cx="15" cy="13" r="1" fill="white" stroke="none" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-bold text-gray-800 text-base mb-1">MedConnect AI Assistant</p>
        <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
          Ask me anything about your health — symptoms, medications, or finding the right doctor.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => setInput(s)}
            className="text-xs px-3.5 py-2 rounded-full border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors font-medium">
            {s}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes chatBounce {
          0%, 100% { transform: translateY(0);   opacity: .4; }
          50%       { transform: translateY(-6px); opacity: 1;  }
        }
        .bot-prose p      { margin: 0 0 6px; line-height:1.65; }
        .bot-prose ul     { padding-left:18px; margin:4px 0 8px; }
        .bot-prose li     { margin-bottom:3px; }
        .bot-prose strong { font-weight:700; color:#1e3a5f; }
        .bot-prose a      { color:#2563EB; font-weight:600; text-decoration:none; }
        .bot-prose a:hover{ text-decoration:underline; }
      `}</style>

      <div className="flex justify-center items-start bg-blue-50 px-4 py-10 min-h-[680px]">
        <div className="flex flex-col w-full max-w-3xl rounded-2xl overflow-hidden bg-white"
          style={{ height: "620px", boxShadow: "0 20px 60px rgba(37,99,235,0.10),0 4px 16px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.05)" }}>

          {/* ── HEADER ─────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                  <circle cx="9" cy="13" r="1" fill="#2563EB" stroke="none" />
                  <circle cx="15" cy="13" r="1" fill="#2563EB" stroke="none" />
                </svg>
              </div>
              <div>
                <p className="text-gray-900 font-bold text-base tracking-tight">Health Assistant</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">AI Live</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-blue-600 text-xs font-semibold">MedConnect AI</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => dispatch(clearChat())}
              className="group flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-500 transition-all px-3 py-2 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear History</span>
            </button>
          </div>

          {/* ── MESSAGES ────────────────────────────────── */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-5 py-5 bg-gray-50 space-y-4">
            {messages.length === 0 && !isLoading ? (
              <EmptyState />
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.sender === "bot" && BOT_AVATAR}
                    <div className={`flex flex-col gap-1 max-w-[78%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.sender === "user"
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm"
                        : "bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100 bot-prose"
                        }`}>
                        {msg.sender === "bot"
                          ? <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{msg.text}</ReactMarkdown>
                          : <p>{msg.text}</p>
                        }
                      </div>
                      <span className="text-[11px] text-gray-400 px-1">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2.5 items-start">
                    {BOT_AVATAR}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                      <LoadingDots />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── INPUT BAR ───────────────────────────────── */}
          <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Describe your symptoms or ask a health question…"
                disabled={isLoading}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5
                           text-sm text-gray-900 placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:opacity-50 transition-all"
              />
              <button onClick={sendMessage} disabled={isLoading || !input.trim()}
                aria-label="Send"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center
                           hover:opacity-90 active:scale-95 transition-all shadow-sm
                           disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-2">
              For emergencies, please call <span className="text-blue-500 font-semibold">112</span> immediately.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
