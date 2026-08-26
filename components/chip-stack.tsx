import Image from "next/image"

interface ChipStackProps {
  amount: number
  className?: string
}

const chipImages: { [key: number]: string } = {
  1: "/chips/chip-1.png",
  5: "/chips/chip-5.png",
  10: "/chips/chip-10.png",
  25: "/chips/chip-25.png",
  100: "/chips/chip-100.png",
  500: "/chips/chip-500.png",
  1000: "/chips/chip-1000.png",
}

const getChipImage = (value: number): string => {
  if (value >= 1000) return chipImages[1000]
  if (value >= 500) return chipImages[500]
  if (value >= 100) return chipImages[100]
  if (value >= 25) return chipImages[25]
  if (value >= 10) return chipImages[10]
  if (value >= 5) return chipImages[5]
  return chipImages[1]
}

const getChipValues = (amount: number): number[] => {
  const values = [1000, 500, 100, 25, 10, 5, 1]
  const result: number[] = []
  let remainingAmount = amount

  for (const value of values) {
    while (remainingAmount >= value) {
      result.push(value)
      remainingAmount -= value
    }
  }
  return result
}

export default function ChipStack({ amount, className }: ChipStackProps) {
  const chips = getChipValues(amount)

  if (chips.length === 0) {
    return null // Don't render if amount is 0
  }

  return (
    <div className={`relative flex justify-center items-end ${className}`}>
      {chips.map((chipValue, index) => (
        <div
          key={`${chipValue}-${index}`}
          className="absolute"
          style={{
            bottom: `${index * 4}px`, // Stack chips vertically
            zIndex: chips.length - index, // Ensure higher chips are on top
          }}
        >
          <Image
            src={getChipImage(chipValue) || "/placeholder.svg"}
            alt={`Chip $${chipValue}`}
            width={40}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
        </div>
      ))}
      <span className="absolute -top-6 text-sm font-bold text-white bg-black/50 px-2 py-1 rounded-full">${amount}</span>
    </div>
  )
}
