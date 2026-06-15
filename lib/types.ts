export type Result = 'win' | 'draw' | 'loss'

export interface TeamRef {
  id: string
  name: string
  nameKo: string
  code: string
}

export interface Appearance {
  playerId: string
  familyName: string
  givenName: string
  nameKo: string
  shirtNumber: number
  position: string
  positionCode: string
  starter: boolean
  substitute: boolean
}

export interface Goal {
  minute: number
  playerId: string
  nameKo: string
  teamId: string
  ownGoal: boolean
  penalty: boolean
}

export interface Booking {
  minute: number
  playerId: string
  nameKo: string
  teamId: string
  card: 'yellow' | 'red' | 'second yellow'
}

export interface Substitution {
  minute: number
  onId: string
  offId: string
  teamId: string
}

export interface Match {
  id: string
  slug: string
  date: string
  time: string
  stadium: string
  city: string
  group: string
  stage: string
  groupStage: boolean
  home: TeamRef
  away: TeamRef
  homeScore: number
  awayScore: number
  result: Result
  lineups: { home: Appearance[]; away: Appearance[] }
  goals: Goal[]
  bookings: Booking[]
  subs: Substitution[]
}

export interface Standing {
  position: number
  team: TeamRef
  played: number
  wins: number
  draws: number
  losses: number
  gf: number
  ga: number
  gd: number
  points: number
  advanced: boolean
}

export interface GroupStanding {
  group: string
  rows: Standing[]
}

export interface Tournament {
  year: number
  id: string
  name: string
  host: string
}

export interface PlayerMatch {
  matchId: string
  slug: string
  group: string
  stage: string
  date: string
  teamId: string
  opponentNameKo: string
  side: 'home' | 'away'
  starter: boolean
  substitute: boolean
  position: string
  shirtNumber: number
  goals: number
}

export interface Player {
  id: string
  slug: string
  nameKo: string
  nameEn: string
  teamId: string
  teamNameKo: string
  teamSlug: string
  shirtNumber: number
  position: string
  matches: PlayerMatch[]
  starts: number
  subs: number
  goals: number
}

export interface TeamSquadEntry {
  playerId: string
  slug: string
  nameKo: string
  shirtNumber: number
  position: string
  starts: number
  subs: number
  goals: number
}

export interface TeamMatchLine {
  slug: string
  date: string
  group: string
  opponentNameKo: string
  gf: number
  ga: number
  result: Result
}

export interface TeamView {
  team: TeamRef
  slug: string
  standing?: Standing
  squad: TeamSquadEntry[]
  matches: TeamMatchLine[]
}

export interface SearchDoc {
  type: 'player' | 'team' | 'match'
  title: string
  subtitle: string
  href: string
}

export interface PlayerImage {
  url: string
  author: string
  license: string
  licenseUrl: string
  sourceUrl: string
}

export interface PlayerClub {
  name: string
  start?: string
  end?: string
}

export interface PlayerMeta {
  nameKo?: string
  nameEn?: string
  birthDate?: string
  height?: number
  birthPlace?: string
  position?: string
  clubs?: PlayerClub[]
  bio?: string
  wikiUrl?: string
  image?: PlayerImage
}

export interface PlayerCardData {
  id: string
  slug: string
  nameKo: string
  nameEn: string
  shirtNumber: number
  position: string
  teamNameKo: string
  stats: { matches: number; starts: number; subs: number; goals: number }
  meta: PlayerMeta | null
}
