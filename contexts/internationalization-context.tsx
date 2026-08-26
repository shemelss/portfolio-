"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"

// Supported languages
export type SupportedLanguage =
  | "en" // English
  | "es" // Spanish
  | "fr" // French
  | "de" // German
  | "it" // Italian
  | "pt" // Portuguese
  | "ru" // Russian
  | "zh" // Chinese
  | "ja" // Japanese
  | "ko" // Korean
  | "ar" // Arabic
  | "hi" // Hindi

// Supported currencies
export type SupportedCurrency =
  | "USD" // US Dollar
  | "EUR" // Euro
  | "GBP" // British Pound
  | "CAD" // Canadian Dollar
  | "AUD" // Australian Dollar
  | "JPY" // Japanese Yen
  | "CNY" // Chinese Yuan
  | "KRW" // Korean Won
  | "INR" // Indian Rupee
  | "BRL" // Brazilian Real
  | "MXN" // Mexican Peso
  | "RUB" // Russian Ruble

// Supported timezones
type SupportedTimezone = "UTC" | "EST" | "PST" | "GMT" | "CET"

// Regional settings
export type Region =
  | "NA" // North America
  | "EU" // Europe
  | "APAC" // Asia Pacific
  | "LATAM" // Latin America
  | "MEA" // Middle East & Africa

// Language configuration
export interface LanguageConfig {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
  rtl: boolean
  currency: SupportedCurrency
  region: Region
  dateFormat: string
  timeFormat: string
  numberFormat: {
    decimal: string
    thousands: string
    currency: {
      symbol: string
      position: "before" | "after"
    }
  }
}

// Basic translations interface (simplified for this fix)
export interface Translations {
  common: {
    welcome: string
    loading: string
    error: string
    success: string
    cancel: string
    confirm: string
    save: string
    delete: string
    edit: string
    view: string
    close: string
    back: string
    next: string
    search: string
    filter: string
    settings: string
    logout: string
    login: string
    register: string
  }
  auth: {
    login: string
    logout: string
    register: string
    forgot_password: string
    reset_password: string
    email_verification: string
    two_factor_auth: string
    security_question: string
    invalid_credentials: string
    password_requirements: string
  }
  casino: {
    blackjack: string
    poker: string
    roulette: string
    slots: string
    baccarat: string
    craps: string
    table_games: string
    card_games: string
    dice_games: string
    wheel_games: string
    progressive_jackpot: string
    bonus_games: string
    free_spins: string
    dealer: string
    player: string
    hand: string
    cards: string
    deck: string
    shuffle: string
    deal: string
    draw: string
    fold: string
    call: string
    raise: string
    check: string
    all_in: string
    pot: string
    winner: string
    loser: string
    tie: string
    payout: string
    odds: string
    house_edge: string
    return_to_player: string
    game_rules: string
    how_to_play: string
    strategy: string
    tips: string
    tutorial: string
    demo_mode: string
    practice_play: string
    real_money: string
    tournament: string
    leaderboard: string
    ranking: string
    score: string
    points: string
    level: string
    experience: string
    achievement: string
    badge: string
    reward: string
    prize: string
    jackpot: string
  }
  financial: {
    balance: string
    deposit: string
    withdrawal: string
    transaction: string
    payment: string
    transfer: string
    exchange: string
    conversion: string
    rate: string
    fee: string
    commission: string
    tax: string
    interest: string
    profit: string
    loss: string
    gain: string
    revenue: string
    income: string
    expense: string
    cost: string
    price: string
    value: string
    amount: string
    total: string
    subtotal: string
    grand_total: string
    net_amount: string
    gross_amount: string
    before_tax: string
    after_tax: string
    tax_included: string
    tax_excluded: string
    service_charge: string
    handling_fee: string
    processing_fee: string
    transaction_fee: string
    withdrawal_fee: string
    deposit_fee: string
  }
  ui: {
    dashboard: string
    menu: string
    navigation: string
    sidebar: string
    header: string
    footer: string
    toolbar: string
    statusbar: string
    breadcrumb: string
    pagination: string
    tabs: string
    accordion: string
    modal: string
    dialog: string
    popup: string
    tooltip: string
    dropdown: string
    select: string
    checkbox: string
    radio: string
    toggle: string
    switch: string
    slider: string
    progress: string
    loading: string
    spinner: string
    skeleton: string
    placeholder: string
    avatar: string
    badge: string
    chip: string
    tag: string
    label: string
    icon: string
    image: string
    video: string
    audio: string
    chart: string
    graph: string
    table: string
    list: string
    grid: string
    card: string
    panel: string
    section: string
    container: string
  }
}

// Default translations (English)
const defaultTranslations: Translations = {
  common: {
    welcome: "Welcome",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    close: "Close",
    back: "Back",
    next: "Next",
    search: "Search",
    filter: "Filter",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    register: "Register",
  },
  auth: {
    login: "Login",
    logout: "Logout",
    register: "Register",
    forgot_password: "Forgot Password",
    reset_password: "Reset Password",
    email_verification: "Email Verification",
    two_factor_auth: "Two-Factor Authentication",
    security_question: "Security Question",
    invalid_credentials: "Invalid Credentials",
    password_requirements: "Password Requirements",
  },
  casino: {
    blackjack: "Blackjack",
    poker: "Poker",
    roulette: "Roulette",
    slots: "Slots",
    baccarat: "Baccarat",
    craps: "Craps",
    table_games: "Table Games",
    card_games: "Card Games",
    dice_games: "Dice Games",
    wheel_games: "Wheel Games",
    progressive_jackpot: "Progressive Jackpot",
    bonus_games: "Bonus Games",
    free_spins: "Free Spins",
    dealer: "Dealer",
    player: "Player",
    hand: "Hand",
    cards: "Cards",
    deck: "Deck",
    shuffle: "Shuffle",
    deal: "Deal",
    draw: "Draw",
    fold: "Fold",
    call: "Call",
    raise: "Raise",
    check: "Check",
    all_in: "All In",
    pot: "Pot",
    winner: "Winner",
    loser: "Loser",
    tie: "Tie",
    payout: "Payout",
    odds: "Odds",
    house_edge: "House Edge",
    return_to_player: "Return to Player",
    game_rules: "Game Rules",
    how_to_play: "How to Play",
    strategy: "Strategy",
    tips: "Tips",
    tutorial: "Tutorial",
    demo_mode: "Demo Mode",
    practice_play: "Practice Play",
    real_money: "Real Money",
    tournament: "Tournament",
    leaderboard: "Leaderboard",
    ranking: "Ranking",
    score: "Score",
    points: "Points",
    level: "Level",
    experience: "Experience",
    achievement: "Achievement",
    badge: "Badge",
    reward: "Reward",
    prize: "Prize",
    jackpot: "Jackpot",
  },
  financial: {
    balance: "Balance",
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    transaction: "Transaction",
    payment: "Payment",
    transfer: "Transfer",
    exchange: "Exchange",
    conversion: "Conversion",
    rate: "Rate",
    fee: "Fee",
    commission: "Commission",
    tax: "Tax",
    interest: "Interest",
    profit: "Profit",
    loss: "Loss",
    gain: "Gain",
    revenue: "Revenue",
    income: "Income",
    expense: "Expense",
    cost: "Cost",
    price: "Price",
    value: "Value",
    amount: "Amount",
    total: "Total",
    subtotal: "Subtotal",
    grand_total: "Grand Total",
    net_amount: "Net Amount",
    gross_amount: "Gross Amount",
    before_tax: "Before Tax",
    after_tax: "After Tax",
    tax_included: "Tax Included",
    tax_excluded: "Tax Excluded",
    service_charge: "Service Charge",
    handling_fee: "Handling Fee",
    processing_fee: "Processing Fee",
    transaction_fee: "Transaction Fee",
    withdrawal_fee: "Withdrawal Fee",
    deposit_fee: "Deposit Fee",
  },
  ui: {
    dashboard: "Dashboard",
    menu: "Menu",
    navigation: "Navigation",
    sidebar: "Sidebar",
    header: "Header",
    footer: "Footer",
    toolbar: "Toolbar",
    statusbar: "Status Bar",
    breadcrumb: "Breadcrumb",
    pagination: "Pagination",
    tabs: "Tabs",
    accordion: "Accordion",
    modal: "Modal",
    dialog: "Dialog",
    popup: "Popup",
    tooltip: "Tooltip",
    dropdown: "Dropdown",
    select: "Select",
    checkbox: "Checkbox",
    radio: "Radio",
    toggle: "Toggle",
    switch: "Switch",
    slider: "Slider",
    progress: "Progress",
    loading: "Loading",
    spinner: "Spinner",
    skeleton: "Skeleton",
    placeholder: "Placeholder",
    avatar: "Avatar",
    badge: "Badge",
    chip: "Chip",
    tag: "Tag",
    label: "Label",
    icon: "Icon",
    image: "Image",
    video: "Video",
    audio: "Audio",
    chart: "Chart",
    graph: "Graph",
    table: "Table",
    list: "List",
    grid: "Grid",
    card: "Card",
    panel: "Panel",
    section: "Section",
    container: "Container",
  },
}

// Default language configuration
const defaultLanguageConfig: LanguageConfig = {
  code: "en",
  name: "English",
  nativeName: "English",
  flag: "🇺🇸",
  rtl: false,
  currency: "USD",
  region: "NA",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "h:mm A",
  numberFormat: {
    decimal: ".",
    thousands: ",",
    currency: {
      symbol: "$",
      position: "before",
    },
  },
}

// Context interface
interface InternationalizationContextType {
  language: SupportedLanguage
  currency: SupportedCurrency
  timezone: SupportedTimezone
  setLanguage: (lang: SupportedLanguage) => void
  setCurrency: (curr: SupportedCurrency) => void
  setTimezone: (tz: SupportedTimezone) => void
  translations: Translations
  languageConfig: LanguageConfig
  t: (key: string) => string
  formatNumber: (num: number) => string
  formatCurrency: (amount: number) => string
  formatDate: (date: Date) => string
  formatTime: (date: Date) => string
}

// Create context
const InternationalizationContext = createContext<InternationalizationContextType | undefined>(undefined)

// Provider props
interface InternationalizationProviderProps {
  children: ReactNode
  initialLanguage?: SupportedLanguage
  initialCurrency?: SupportedCurrency
  initialTimezone?: SupportedTimezone
}

// Provider component
export const InternationalizationProvider: React.FC<InternationalizationProviderProps> = ({
  children,
  initialLanguage = "en",
  initialCurrency = "USD",
  initialTimezone = "UTC",
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage)
  const [currency, setCurrency] = useState<SupportedCurrency>(initialCurrency)
  const [timezone, setTimezone] = useState<SupportedTimezone>(initialTimezone)
  const [translations, setTranslations] = useState<Translations>(defaultTranslations)
  const [languageConfig, setLanguageConfig] = useState<LanguageConfig>(defaultLanguageConfig)

  // Load language configuration and translations
  useEffect(() => {
    // In a real app, this would fetch translations from a server or local files
    // For now, we'll just use the default English translations
    setTranslations(defaultTranslations)
    setLanguageConfig(defaultLanguageConfig)
  }, [language])

  // Translation helper function
  const t = (key: string): string => {
    const keys = key.split(".")
    let result: any = translations

    for (const k of keys) {
      if (result && result[k]) {
        result = result[k]
      } else {
        return key // Return the key if translation not found
      }
    }

    return typeof result === "string" ? result : key
  }

  // Format number according to locale
  const formatNumber = (num: number): string => {
    return num.toLocaleString(language, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }

  // Format currency according to locale and currency
  const formatCurrencyIntl = useCallback(
    (amount: number) => {
      return new Intl.NumberFormat(language, {
        style: "currency",
        currency: currency,
      }).format(amount)
    },
    [language, currency],
  )

  // Format date according to locale
  const formatDateIntl = useCallback(
    (date: Date) => {
      return new Intl.DateTimeFormat(language, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: timezone,
      }).format(date)
    },
    [language, timezone],
  )

  // Format time according to locale
  const formatTimeIntl = useCallback(
    (date: Date) => {
      return new Intl.DateTimeFormat(language, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: timezone,
      }).format(date)
    },
    [language, timezone],
  )

  const value = {
    language,
    currency,
    timezone,
    setLanguage,
    setCurrency,
    setTimezone,
    translations,
    languageConfig,
    t,
    formatNumber,
    formatCurrency: formatCurrencyIntl,
    formatDate: formatDateIntl,
    formatTime: formatTimeIntl,
  }

  return <InternationalizationContext.Provider value={value}>{children}</InternationalizationContext.Provider>
}

// Custom hook to use the internationalization context
export const useInternationalization = () => {
  const context = useContext(InternationalizationContext)
  if (context === undefined) {
    throw new Error("useInternationalization must be used within an InternationalizationProvider")
  }
  return context
}
