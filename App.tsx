import React, { useState, useCallback } from 'react';
import { AppMode, CommunicationCard } from './types';
import AACGrid from './components/AACGrid';
import CameraView from './components/CameraView';
import SentenceStrip from './components/SentenceStrip';
import { Camera, Upload, LayoutGrid } from 'lucide-react';
import { analyzeImageForAAC, speakText, playAudioBuffer } from './services/geminiService';

// Default Core Vocabulary
const CORE_CARDS: CommunicationCard[] = [
  { id: 'c1', label: 'Yes', color: 'bg-green-200 border-green-400', type: 'core', icon: '👍' },
  { id: 'c2', label: 'No', color: 'bg-red-200 border-red-400', type: 'core', icon: '👎' },
  { id: 'c3', label: 'I want', color: 'bg-blue-200 border-blue-400', type: 'core', icon: '🤲' },
  { id: 'c4', label: 'Stop', color: 'bg-red-400 border-red-600 text-white', type: 'core', icon: '🛑' },
  { id: 'c5', label: 'Help', color: 'bg-yellow-200 border-yellow-400', type: 'core', icon: '🆘' },
  { id: 'c6', label: 'More', color: 'bg-purple-200 border-purple-400', type: 'core', icon: '➕' },
  { id: 'c7', label: 'Thank you', color: 'bg-pink-200 border-pink-400', type: 'core', icon: '🙏' },
  { id: 'c8', label: 'Bathroom', color: 'bg-cyan-200 border-cyan-400', type: 'core', icon: '🚽' },
];

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.GRID);
  const [contextCards, setContextCards] = useState<CommunicationCard[]>([]);
  const [sentence, setSentence] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Combine Core and Context cards
  const activeCards = [...contextCards, ...CORE_CARDS];

  const handleCardClick = (card: CommunicationCard) => {
    setSentence(prev => [...prev, card.label]);
  };

  const handleRemoveWord = (index: number) => {
    setSentence(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearSentence = () => {
    setSentence([]);
  };

  const handleSpeak = async () => {
    if (sentence.length === 0) return;
    
    setIsSpeaking(true);
    const textToSpeak = sentence.join(' ');
    
    try {
      // 1. Try Gemini TTS for high quality
      const audioBuffer = await speakText(textToSpeak);
      playAudioBuffer(audioBuffer);
      
      // Wait roughly for audio to finish (estimated calculation or just a timeout reset)
      // Since playAudioBuffer is fire-and-forget in this simple implementation, we assume duration.
      // A more robust way handles 'ended' event, but for this demo, we use a timeout based on length.
      setTimeout(() => setIsSpeaking(false), Math.min(textToSpeak.length * 100 + 1000, 5000));
      
    } catch (err) {
      console.warn("Gemini TTS failed, falling back to browser TTS", err);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleImageAnalysis = async (base64Image: string) => {
    setMode(AppMode.GRID); // Return to grid
    setIsProcessing(true);
    setContextCards([]); // Clear old context

    try {
      const suggestions = await analyzeImageForAAC(base64Image);
      
      const newCards: CommunicationCard[] = suggestions.map((text, idx) => ({
        id: `ctx-${Date.now()}-${idx}`,
        label: text,
        color: 'bg-amber-100 border-amber-300',
        type: 'context'
      }));

      setContextCards(newCards);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Could not analyze image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      handleImageAnalysis(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-900">
      
      {/* Header */}
      <header className="flex-none p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shadow-md z-10">
        <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          OmniSpeak XR
        </h1>
        <div className="flex gap-2">
          {/* File Upload Hidden Input Trigger */}
          <label className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 cursor-pointer text-white">
            <Upload size={24} />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>

          <button 
            onClick={() => setMode(AppMode.CAMERA)}
            className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 text-white font-bold flex gap-2 items-center"
          >
            <Camera size={24} />
            <span className="hidden md:inline">Scan</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative bg-slate-50">
        {mode === AppMode.CAMERA ? (
          <CameraView 
            onCapture={handleImageAnalysis} 
            onClose={() => setMode(AppMode.GRID)} 
          />
        ) : (
          <>
            {/* Context Awareness Banner */}
            {contextCards.length > 0 && (
              <div className="bg-amber-50 px-4 py-2 flex justify-between items-center border-b border-amber-200">
                <span className="text-amber-800 font-medium text-sm">
                  Found in your environment:
                </span>
                <button 
                  onClick={() => setContextCards([])}
                  className="text-amber-600 hover:text-amber-800 text-xs font-bold"
                >
                  Clear Context
                </button>
              </div>
            )}
            
            <AACGrid 
              cards={activeCards} 
              onCardClick={handleCardClick}
              isLoading={isProcessing}
            />
          </>
        )}
      </main>

      {/* Persistent Footer */}
      {mode !== AppMode.CAMERA && (
        <SentenceStrip
          sentence={sentence}
          onRemoveWord={handleRemoveWord}
          onClear={handleClearSentence}
          onSpeak={handleSpeak}
          isSpeaking={isSpeaking}
        />
      )}
    </div>
  );
};

export default App;