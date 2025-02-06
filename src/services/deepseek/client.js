export const deepseekClient = {
  async complete(prompt) {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }]
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('DeepSeek API 호출 중 오류:', error);
      throw error;
    }
  }
};
