import { useState } from 'react';
import { deepseekClient } from '../../services/deepseek/client';
import { analyzeAvailability } from '../../services/deepseek/prompts';

function ChatBot({ messages, setMessages, roomData }) {
  const [input, setInput] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 사용자 메시지 추가
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // DeepSeek API 호출
      const response = await deepseekClient.complete(
        analyzeAvailability(input, roomData)
      );

      // 시간대 분석 및 저장
      const availableSlots = parseAvailability(response.content);
      updateAvailableSlots(roomData.id, availableSlots);

      // 봇 응답 추가
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.content
      }]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-4 ${
              msg.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="가능한 시간을 입력하세요..."
          className="w-full p-2 border rounded"
        />
      </form>
    </div>
  );
}

export default ChatBot; 