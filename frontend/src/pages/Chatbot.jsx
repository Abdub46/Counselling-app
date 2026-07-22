import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your personal nutrition assistant. Ask me about healthy eating, your BMI, meal ideas, hydration, or lifestyle tips. I can't diagnose conditions or prescribe medication — for those, please book an appointment with a nutrition counsellor." },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setSending(true);

    try {
      const history = newMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      const { data } = await api.post('/chatbot/message', { message: text, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Chatbot is unavailable right now');
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble responding right now. Please try again shortly." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-4 flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-3rem)]">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-800">AI Nutrition Chatbot</h1>
        <p className="text-sm text-gray-500">Personalized guidance based on your profile</p>
      </div>

      <div className="card flex-1 overflow-y-auto flex flex-col gap-3 mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 rounded-xl px-4 py-2 text-sm">Typing...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="input-field flex-1"
          placeholder="Ask about nutrition, BMI, meals, hydration..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2">
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
