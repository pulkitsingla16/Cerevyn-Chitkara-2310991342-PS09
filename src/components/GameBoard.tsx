import { memo, useMemo } from 'react'

import { DIFFICULTY_CONFIG } from '../game/config'
import type { Difficulty, MemoryCard } from '../game/types'
import { MemoryCard as CardButton } from './MemoryCard'

interface GameBoardProps {
  cards: MemoryCard[]
  difficulty: Difficulty
  selectedIds: string[]
  matchedIds: string[]
  lockBoard: boolean
  isPreviewing?: boolean
  onClick: (cardId: string) => void
}

export const GameBoard = memo(function GameBoard({
  cards,
  difficulty,
  selectedIds,
  matchedIds,
  lockBoard,
  isPreviewing = false,
  onClick,
}: GameBoardProps) {
  const config = DIFFICULTY_CONFIG[difficulty]
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const matchedSet = useMemo(() => new Set(matchedIds), [matchedIds])

  return (
    <section className="panel game-board-panel">
      <div className="section-heading">
        <h2>{config.label} board</h2>
        <span>
          {config.rows} × {config.cols}
        </span>
      </div>

      <div
        className="memory-grid"
        style={{ gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` }}
      >
        {cards.map((card) => {
          const isSelected = selectedSet.has(card.id) || isPreviewing
          const isMatched = matchedSet.has(card.id)
          return (
            <CardButton
              key={card.id}
              card={card}
              isSelected={isSelected}
              isMatched={isMatched}
              isDisabled={lockBoard || isMatched}
              onClick={onClick}
            />
          )
        })}
      </div>
    </section>
  )
})

