import Image from "next/image"

interface PlayingCardProps {
  suit?: "hearts" | "diamonds" | "clubs" | "spades"
  rank?: string
  faceUp?: boolean
  card?: { suit: "hearts" | "diamonds" | "clubs" | "spades"; value: string }
  hidden?: boolean
  className?: string
}

const cardImages: Record<string, string> = {
  "2_clubs": "/cards/2_of_clubs.png",
  "2_diamonds": "/cards/2_of_diamonds.png",
  "2_hearts": "/cards/2_of_hearts.png",
  "2_spades": "/cards/2_of_spades.png",
  "3_clubs": "/cards/3_of_clubs.png",
  "3_diamonds": "/cards/3_of_diamonds.png",
  "3_hearts": "/cards/3_of_hearts.png",
  "3_spades": "/cards/3_of_spades.png",
  "4_clubs": "/cards/4_of_clubs.png",
  "4_diamonds": "/cards/4_of_diamonds.png",
  "4_hearts": "/cards/4_of_hearts.png",
  "4_spades": "/cards/4_of_spades.png",
  "5_clubs": "/cards/5_of_clubs.png",
  "5_diamonds": "/cards/5_of_diamonds.png",
  "5_hearts": "/cards/5_of_hearts.png",
  "5_spades": "/cards/5_of_spades.png",
  "6_clubs": "/cards/6_of_clubs.png",
  "6_diamonds": "/cards/6_of_diamonds.png",
  "6_hearts": "/cards/6_of_hearts.png",
  "6_spades": "/cards/6_of_spades.png",
  "7_clubs": "/cards/7_of_clubs.png",
  "7_diamonds": "/cards/7_of_diamonds.png",
  "7_hearts": "/cards/7_of_hearts.png",
  "7_spades": "/cards/7_of_spades.png",
  "8_clubs": "/cards/8_of_clubs.png",
  "8_diamonds": "/cards/8_of_diamonds.png",
  "8_hearts": "/cards/8_of_hearts.png",
  "8_spades": "/cards/8_of_spades.png",
  "9_clubs": "/cards/9_of_clubs.png",
  "9_diamonds": "/cards/9_of_diamonds.png",
  "9_hearts": "/cards/9_of_hearts.png",
  "9_spades": "/cards/9_of_spades.png",
  "10_clubs": "/cards/10_of_clubs.png",
  "10_diamonds": "/cards/10_of_diamonds.png",
  "10_hearts": "/cards/10_of_hearts.png",
  "10_spades": "/cards/10_of_spades.png",
  jack_clubs: "/cards/jack_of_clubs.png",
  jack_diamonds: "/cards/jack_of_diamonds.png",
  jack_hearts: "/cards/jack_of_hearts.png",
  jack_spades: "/cards/jack_of_spades.png",
  queen_clubs: "/cards/queen_of_clubs.png",
  queen_diamonds: "/cards/queen_of_diamonds.png",
  queen_hearts: "/cards/queen_of_hearts.png",
  queen_spades: "/cards/queen_of_spades.png",
  king_clubs: "/cards/king_of_clubs.png",
  king_diamonds: "/cards/king_of_diamonds.png",
  king_hearts: "/cards/king_of_hearts.png",
  king_spades: "/cards/king_of_spades.png",
  ace_clubs: "/cards/ace_of_clubs.png",
  ace_diamonds: "/cards/ace_of_diamonds.png",
  ace_hearts: "/cards/ace_of_hearts.png",
  ace_spades: "/cards/ace_of_spades.png",
  card_back: "/cards/card_back.png",
}

const getCardImagePath = (rank: string, suit: string): string => {
  const normalizedRank = rank.toLowerCase().replace("10", "10") // Ensure "10" is just "10"
  const normalizedSuit = suit.toLowerCase()
  const key = `${normalizedRank}_${normalizedSuit}`
  return cardImages[key] || "/placeholder.svg?text=Card" // Fallback
}

export default function PlayingCard({ suit, rank, faceUp, card, hidden, className }: PlayingCardProps) {
  const resolvedSuit = card?.suit ?? suit ?? "spades"
  const resolvedRank = card?.value ?? rank ?? "A"
  const resolvedFaceUp = hidden ? false : (faceUp ?? true)
  const cardSrc = resolvedFaceUp ? getCardImagePath(resolvedRank, resolvedSuit) : cardImages.card_back

  return (
    <div
      className={`relative h-[148px] w-[106px] overflow-hidden rounded-xl border-2 border-white/20 shadow-xl transition-transform duration-300 ease-in-out transform-gpu sm:h-[180px] sm:w-[128px] md:h-[220px] md:w-[156px] ${
        resolvedFaceUp ? "rotate-y-0" : "rotate-y-180"
      } ${className}`}
      style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
    >
      <Image
        src={cardSrc || "/placeholder.svg"}
        alt={resolvedFaceUp ? `${resolvedRank} of ${resolvedSuit}` : "Card back"}
        layout="fill"
        objectFit="contain"
        quality={100}
        className="absolute inset-0"
      />
    </div>
  )
}
