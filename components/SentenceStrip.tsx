import React from 'react';
import { Delete, Play, Volume2 } from 'lucide-react';

interface SentenceStripProps {
  sentence: string[];
  onRemoveWord: (index: number) => void;
  onClear: () => void;
  onSpeak: () => void;
  isSpeaking: boolean;
}

const SentenceStrip: React.FC<SentenceStripProps> = ({ 
  sentence, 
  onRemoveWord, 
  onClear, 
  onSpeak, 
  isSpeaking 
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4 shadow-xl z-40">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        
        {/* Sentence Display */}
        <div className="bg-slate-100 rounded-xl min-h-[4rem] flex items-center p-2 overflow-x-auto gap-2 shadow-inner">
          {sentence.length === 0 ? (
            <span className="text-slate-400 italic px-2">Select cards to build sentence...</span>
          ) : (
            sentence.map((word, idx) => (
              <button
                key={`${word}-${idx}`}
                onClick={() => onRemoveWord(idx)}
                className="bg-blue-100 text-blue-900 px-3 py-2 rounded-lg font-bold whitespace-nowrap border border-blue-200 hover:bg-red-100 hover:text-red-900 transition-colors flex-shrink-0"
              >
                {word}
              </button>
            ))
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4 h-14">
          <button
            onClick={onClear}
            disabled={sentence.length === 0}
            className="bg-slate-600 text-white px-6 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500 transition-colors"
          >
            Clear
          </button>
          
          <button
            onClick={onSpeak}
            disabled={sentence.length === 0 || isSpeaking}
            className={`
              flex-1 rounded-xl font-bold text-xl flex items-center justify-center gap-2 shadow-md
              transition-all transform active:scale-[0.98]
              ${isSpeaking 
                ? 'bg-green-600 text-white animate-pulse' 
                : 'bg-green-500 text-white hover:bg-green-400'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isSpeaking ? (
              <>
                <Volume2 className="animate-bounce" /> Speaking...
              </>
            ) : (
              <>
                <Play fill="currentColor" /> Speak
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SentenceStrip;