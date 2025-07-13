export interface Deed {
  id: number;
  user: string;
  action: string;
  location: string;
  karma: number;
  time: string;
}

export interface GoodDeed {
  id: number;
  user: string;
  avatar: string;
  image: string;
  description: string;
  likes: number;
  comments: number;
  timeAgo: string;
}

export interface HelpRequest {
  id: number;
  request: string;
  user: string;
  distance: string;
  karma: number;
}

export interface User {
  id: number;
  name: string;
  karmaScore: number;
  avatar?: string;
  email: string;
  joinedDate: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  requiredCount?: number;
  currentCount?: number;
  category?: string;
  earned?: boolean;
  earnedDate?: string;
}

export interface ImpactItem {
  id: string;
  type: 'deed' | 'event';
  title: string;
  description: string;
  date: string;
  points: number;
  icon: string;
  category?: string;
}

export interface KarmaLevel {
  name: string;
  emoji: string;
  minPoints: number;
  maxPoints: number;
}

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Action: undefined;
  Impact: undefined;
  Profile: undefined;
};
