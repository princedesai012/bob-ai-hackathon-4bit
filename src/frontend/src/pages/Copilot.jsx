import React, { useState } from 'react';
import { queryCopilot } from '../services/allApis';
import { MessageSquare, User, Bot, Send } from 'lucide-react';

const Copilot = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am SupplyShield AI. I can analyze disruptions, recommend recovery plans, and query real-time database data. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await queryCopilot(userMessage);
      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'ai', content: res.data.data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection to backend failed.' }]);
    }
    setLoading(false);
  };

  const exampleQueries = [
    "Which shipments are most at risk right now?",
    "Show me cold-chain shipments affected by this disruption.",
    "Which vehicles are available for redeployment?",
    "A major port disruption is expected to last 48 hours. Analyze the impact, identify the highest-risk shipments, check cold-chain exposure, find available fleet assets, and create a prioritized recovery plan."
  ];

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center">
        <MessageSquare className="w-6 h-6 mr-3 text-blue-400" />
        <div>
          <h2 className="font-bold text-lg">AI Copilot</h2>
          <p className="text-xs text-gray-400">Ask SupplyShield about your supply chain</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-start ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'ai' && (
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-lg p-4 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'}`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded bg-gray-300 flex items-center justify-center ml-3 mt-1 flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        {messages.length === 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {exampleQueries.map((q, i) => (
              <button 
                key={i} 
                onClick={() => setInput(q)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full border border-gray-200 transition-colors"
              >
                {q.length > 50 ? q.substring(0, 50) + '...' : q}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about disruptions, risk, or recovery options..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Copilot;
