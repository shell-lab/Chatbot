import React, { useState, useEffect } from 'react';


/*checks if a string is a heading*/
function checkHeading(str) {
  return /^\*\*(.*)\*\*$/.test(str);
}

/*Removes the surrounding asterisks from a heading string.*/
function stripHeadingStars(str) {
  return str.replace(/^\*\*|\*\*$/g, '');
}




/*Renders a single line of the bot's response, styling headings differently.*/
const Answer = ({ ans }) => {
  const isHeading = checkHeading(ans);

  if (isHeading) {
    return (
      <span className="pt-2 text-lg font-bold block text-white">
        {stripHeadingStars(ans)}
      </span>
    );
  }

  return <span className="pl-5 text-white">{ans}</span>;
};

/*A clickable chip for suggested questions.*/
const SuggestionChip = ({ suggestion, onClick }) => (
  <button
    onClick={() => onClick(suggestion)}
    className="bg-zinc-700 text-white text-sm px-4 py-2 rounded-full hover:bg-zinc-600 transition-colors"
  >
    {suggestion}
  </button>
);


// --- Main App Component ---

function App() {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [personality, setPersonality] = useState('default');
  const [suggestions, setSuggestions] = useState([]);

  //API Key
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDaJAytH0O8bEJOEB42V_bTcsau9u8gkZo`;
  
  const personalities = {
    default: "You are a helpful and friendly assistant.",
    sarcastic: "You are a sarcastic teenager who reluctantly answers questions with wit and a bit of attitude.",
    pirate: "You are a wise old pirate who answers questions with nautical metaphors and a swashbuckling spirit.",
  };

  /*Main function to ask a question to the Gemini API.*/
  const askQuestion = async (prompt) => {
    if (!prompt.trim() || isLoading) return;

    setChatHistory(prev => [...prev, { type: 'user', text: prompt }]);
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setQuestion('');


    try {

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [{ text: personalities[personality] }]
        }
      };

      const response = await fetch(URL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      const botResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!botResponseText) {
        throw new Error("Received an invalid response from the API.");
      }

      const botMessageLines = botResponseText.split('\n').map(item => item.trim()).filter(Boolean);
      setChatHistory(prev => [...prev, { type: 'bot', lines: botMessageLines }]);
      
      fetchSuggestions(prompt, botResponseText);

    } catch (err) {
     
      console.error("Error in askQuestion:", err);
      setError("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchSuggestions = async (lastQuestion, lastAnswer) => {
    const suggestionPrompt = `Based on the last question ("${lastQuestion}") and its answer ("${lastAnswer}"), generate three short and relevant follow-up questions a user might ask.`;
    
    const payload = {
      contents: [{ parts: [{ text: suggestionPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: { type: "STRING" }
        }
      }
    };

    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) return;
      const data = await response.json();
      const suggestionsText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (suggestionsText) {
        setSuggestions(JSON.parse(suggestionsText));
      }
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    askQuestion(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      askQuestion(question);
    }
  };

  return(
    <div className='grid grid-cols-5 h-screen text-center bg-zinc-900 font-sans'>
      <div className='col-span-1 bg-zinc-800 text-white pt-5 p-4 flex flex-col gap-6'>
        <h2 className="font-bold text-lg">Recent Searches</h2>
        <div>
          <h3 className="font-bold text-md mb-2 text-left">✨ Personalities</h3>
          <select 
            value={personality} 
            onChange={(e) => setPersonality(e.target.value)}
            className="w-full p-2 bg-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Friendly Assistant</option>
            <option value="sarcastic">Sarcastic Teen</option>
            <option value="pirate">Wise Pirate</option>
          </select>
        </div>
      </div>
      
      <div className='col-span-4 flex flex-col'>
        <div className='flex-grow p-6 overflow-y-auto'>
          <div className="max-w-4xl mx-auto text-left">
            {chatHistory.map((chatItem, index) => (
              <div key={index} className="mb-4">
                {chatItem.type === 'user' ? (
                  <div className="p-4 bg-blue-900/50 rounded-lg">
                    <p className="font-bold text-blue-300">You:</p>
                    <p className="text-white">{chatItem.text}</p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <p className="font-bold text-green-400">Bot:</p>
                    {chatItem.lines.map((line, lineIndex) => (
                      <Answer key={lineIndex} ans={line} />
                    ))}
                    {index === chatHistory.length - 1 && suggestions.length > 0 && !isLoading && (
                      <div className="mt-4 pt-4 border-t border-zinc-700 flex flex-wrap gap-2">
                          <p className="w-full text-sm text-gray-400 mb-1">✨ Suggestions:</p>
                          {suggestions.map((s, i) => <SuggestionChip key={i} suggestion={s} onClick={handleSuggestionClick} />)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && chatHistory.length > 0 && <p className="text-gray-400">Bot is thinking...</p>}
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>

        <div className='p-4 bg-zinc-900'>
          <div className='bg-zinc-800 w-full max-w-4xl p-2 mx-auto rounded-full border border-zinc-700 flex items-center h-16'>
            <input 
              id='forms' 
              type='text' 
              value={question} 
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              className='w-full h-full p-3 bg-transparent text-white outline-none placeholder-gray-400' 
              placeholder='Ask me Anything'
              disabled={isLoading}
            />
            <button onClick={() => askQuestion(question)} disabled={isLoading} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 disabled:bg-gray-500">
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
