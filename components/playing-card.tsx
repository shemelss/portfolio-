interface PlayingCardProps {
  suit?: "hearts" | "diamonds" | "clubs" | "spades"
  rank?: string
  faceUp?: boolean
  card?: { suit: "hearts" | "diamonds" | "clubs" | "spades"; value: string }
  hidden?: boolean
  className?: string
}

const suitSymbols = { hearts: "♥", diamonds: "♦", clubs: "♣", spades: "♠" } as const
const suitLabels = { hearts: "hearts", diamonds: "diamonds", clubs: "clubs", spades: "spades" } as const

export default function PlayingCard({ suit, rank, faceUp, card, hidden, className }: PlayingCardProps) {
  const resolvedSuit = card?.suit ?? suit ?? "spades"
  const resolvedRank = card?.value ?? rank ?? "A"
  const resolvedFaceUp = hidden ? false : (faceUp ?? true)
  const isRed = resolvedSuit === "hearts" || resolvedSuit === "diamonds"

  return (
    <div
      role="img"
      aria-label={resolvedFaceUp ? `${resolvedRank} of ${suitLabels[resolvedSuit]}` : "Card back"}
      className={`relative flex h-[112px] w-[82px] shrink-0 flex-col justify-between overflow-hidden rounded-xl border-2 border-white/70 bg-white p-2 text-slate-950 shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-transform duration-300 sm:h-[128px] sm:w-[92px] md:h-[136px] md:w-[98px] ${className ?? ""}`}
    >
      {resolvedFaceUp ? (
        <>
          <div className={`text-left text-xl font-black leading-none ${isRed ? "text-red-600" : "text-slate-950"}`}>
            <span>{resolvedRank}</span>
            <span className="ml-1">{suitSymbols[resolvedSuit]}</span>
          </div>
          <div className={`self-center text-5xl leading-none ${isRed ? "text-red-600" : "text-slate-950"}`} aria-hidden="true">
            {suitSymbols[resolvedSuit]}
          </div>
          <div className={`rotate-180 text-right text-xl font-black leading-none ${isRed ? "text-red-600" : "text-slate-950"}`} aria-hidden="true">
            {resolvedRank}{suitSymbols[resolvedSuit]}
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center rounded-lg border-4 border-red-700 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-950 text-3xl text-white shadow-inner" aria-hidden="true">
          <span className="rounded-md border border-white/50 px-3 py-5">RC</span>
        </div>
      )}
    </div>
  )
}
