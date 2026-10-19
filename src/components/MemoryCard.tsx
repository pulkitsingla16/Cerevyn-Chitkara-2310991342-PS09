import { memo } from 'react'

import cardBackImg from '../assets/card-back.png'
import type { MemoryCard as MemoryCardType } from '../game/types'

interface MemoryCardProps {
  card: MemoryCardType
  isSelected: boolean
  isMatched: boolean
  isDisabled: boolean
  onClick: (cardId: string) => void
}

export const MemoryCard = memo(function MemoryCard({
  card,
  isSelected,
  isMatched,
  isDisabled,
  onClick,
}: MemoryCardProps) {
  const isFaceUp = isSelected || isMatched

  return (
    <div className="memory-card-scene">
      <button
        type="button"
        className={`memory-card ${isFaceUp ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
        onClick={() => onClick(card.id)}
        disabled={isDisabled || isMatched}
        aria-label={isFaceUp ? `Revealed card: ${card.symbol}` : 'Hidden card'}
        aria-pressed={isFaceUp}
        data-card-id={card.id}
      >
        <div className="card-face card-back">
          <img src={cardBackImg} alt="Cyber eye card back" className="card-back-image" />
        </div>
        <div className={`card-face card-front ${isMatched ? 'card-matched' : ''}`}>
          <span className="card-symbol" aria-hidden="true">{card.symbol}</span>
          {isMatched && <span className="match-sparkle" aria-hidden="true">✨</span>}
        </div>
      </button>
    </div>
  )
})
