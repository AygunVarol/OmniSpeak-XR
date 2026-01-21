import React from 'react';
import { CommunicationCard } from '../types';
import { Plus, MessageSquare } from 'lucide-react';

interface AACGridProps {
  cards: CommunicationCard[];
  onCardClick: (card: CommunicationCard) => void;
  isLoading?: boolean;
}

const AACGrid: React.FC<AACGridProps> = ({ cards, onCardClick, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 animate-pulse">
        <div className="w-16 h-16 bg-slate-700 rounded-full"></div>
        <p className="text-xl font-semibold text-slate-400">Processing visual context...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 pb-32 overflow-y-auto h-full">
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={() => onCardClick(card)}
          className={`
            aspect-square rounded-2xl flex flex-col items-center justify-center p-4
            transition-all transform active:scale-95 shadow-lg border-b-4
            ${card.color}
          `}
          aria-label={card.label}
        >
          <div className="text-4xl md:text-5xl mb-2">
            {/* Simple icon mapping based on type or generic */}
            {card.type === 'context' ? '✨' : 
             card.type === 'upload' ? '🖼️' :
             card.icon || '💬'}
          </div>
          <span className="text-lg md:text-xl font-bold text-center leading-tight break-words text-slate-900">
            {card.label}
          </span>
        </button>
      ))}
      
      {/* Empty state filler if needed */}
      {cards.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
          <MessageSquare size={48} className="mb-4 opacity-50" />
          <p>No cards available. Use the Camera or Upload to add context.</p>
        </div>
      )}
    </div>
  );
};

export default AACGrid;