export interface Deed {
  id: number;
  user: string;
  action: string;
  location: string;
  karma: number;
  time: string;
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
}

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Action: undefined;
  Impact: undefined;
  Profile: undefined;
};
