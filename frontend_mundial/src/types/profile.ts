export type Profile = {
  userId: string;
  name: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  favoriteTeams: string[];  
  favoriteCities: string[]; 
  notificationsEnabled: boolean;
  updatedAt: string;
};
