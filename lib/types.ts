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
