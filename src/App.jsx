import { useEffect, useState } from 'react';
import { Eye, Lock, Unlock, Lightbulb } from 'lucide-react';

// NYT standard difficulty colors
const levelColors = {
  1: "bg-yellow-300 text-yellow-900 border-yellow-400",
  2: "bg-green-300 text-green-900 border-green-400",
  3: "bg-blue-300 text-blue-900 border-blue-400",
  4: "bg-purple-400 text-purple-950 border-purple-500",
};

export default function App() {
  const [puzzle, setPuzzle] = useState(null);
  const [error, setError] = useState(null);

  // Store the reveal state for each category (0 = hidden, 1 = theme, 2 = 1 word, 3 = 2 words, 4 = all)
  const [revealState, setRevealState] = useState([]);

  useEffect(() => {
    fetch('/today.json')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setPuzzle(data);
        setRevealState(data.categories.map(() => 0));
      })
      .catch((err) => setError(err.message));
  }, []);

  const advanceReveal = (index) => {
    setRevealState(prev => {
      const newState = [...prev];
      if (newState[index] < 4) newState[index] += 1;
      return newState;
    });
  };

  const getHintText = (level) => {
    switch(level) {
      case 0: return "Reveal Theme";
      case 1: return "Reveal 1 Word";
      case 2: return "Reveal a 2nd Word";
      case 3: return "Solve Category";
      default: return "Solved";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 font-sans text-gray-900">
        <p className="text-red-700 font-semibold">Couldn&apos;t load today&apos;s puzzle: {error}</p>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 font-sans text-gray-900">
        <p className="text-gray-600">Loading today&apos;s puzzle...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-10 px-4 font-sans text-gray-900">
      <div className="max-w-2xl w-full space-y-6">

        {/* Header section */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-black">Connections Hints</h1>
          <p className="text-gray-700">Progressive hints for today&apos;s puzzle ({puzzle.date})</p>
          <p className="text-sm bg-blue-100 text-blue-800 inline-block px-3 py-1 rounded-full mt-2 shadow-sm border border-blue-200">
            No spoilers! Reveal only what you need.
          </p>
        </div>

        {/* The Hint Cards */}
        <div className="space-y-4">
          {puzzle.categories.map((category, index) => {
            const state = revealState[index];
            const isFullyRevealed = state === 4;
            const themeColorClass = isFullyRevealed ? levelColors[category.level] : "bg-white border-gray-300 text-gray-900";

            return (
              <div 
                key={category.title} 
                className={`border-2 rounded-xl p-5 shadow-sm transition-all duration-300 ${themeColorClass}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {state === 0 ? <Lock className="w-5 h-5 text-gray-400" /> : <Unlock className={`w-5 h-5 ${isFullyRevealed ? 'opacity-70' : 'text-blue-500'}`} />}
                    <h2 className={`text-lg font-bold ${isFullyRevealed ? '' : 'text-gray-900'}`}>
                      {state > 0 ? category.title : `Category ${index + 1}`}
                    </h2>
                  </div>
                  
                  {state < 4 && (
                    <button 
                      onClick={() => advanceReveal(index)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1.5 px-4 rounded-lg shadow-sm transition-colors active:scale-95"
                    >
                      {state === 0 ? <Lightbulb className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {getHintText(state)}
                    </button>
                  )}
                </div>

                {/* Progressive Hints Area */}
                <div className="min-h-[60px] flex flex-col justify-center border-t border-black/10 pt-4">
                  {state === 0 && (
                    <p className="text-gray-500 italic text-sm text-center">Hidden. Click &quot;Reveal Theme&quot; for a gentle nudge.</p>
                  )}
                  
                  {state > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {category.words.map((word, wordIdx) => {
                        // Logic for showing words based on state
                        const isRevealed = state === 4 || (state === 2 && wordIdx === 0) || (state === 3 && wordIdx <= 1);
                        
                        return (
                          <span 
                            key={word}
                            className={`px-4 py-2 rounded-md font-bold tracking-wider transition-all duration-500 ${
                              isRevealed 
                                ? (isFullyRevealed ? 'bg-black/10 text-black' : 'bg-gray-800 text-white shadow-md') 
                                : 'bg-gray-100 text-transparent select-none border border-dashed border-gray-300'
                            }`}
                          >
                            {isRevealed ? word : '???????'}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action footer */}
        {revealState.some(state => state > 0) && (
          <div className="text-center pt-8">
            <button
              onClick={() => setRevealState(puzzle.categories.map(() => 0))}
              className="text-gray-600 hover:text-gray-800 underline text-sm transition-colors"
            >
              Reset all hints
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}