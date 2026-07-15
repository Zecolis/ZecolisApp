
export enum View {
  ONBOARDING_1 = 'onboarding_1',
  ONBOARDING_2 = 'onboarding_2',
  ONBOARDING_3 = 'onboarding_3',
  HOME = 'accueil',
  SEARCH = 'recherche',
  PUBLISH = 'publier',
  MESSAGES = 'messages',
  PROFILE = 'profil',
  DETAIL = 'detail',
  CHAT_DETAIL = 'chat_detail',
  WALLET = 'portefeuille',
  MY_ADS = 'mes_annonces',
  VERIFY_INTRO = 'verify_intro',
  VERIFY_CHOICE = 'verify_choice',
  VERIFY_UPLOAD = 'verify_upload',
  QR_CODE = 'qr_code',
  FAVORITES = 'favoris',
  PERSONAL_INFO = 'infos_personnelles',
  PUBLIC_PROFILE = 'profil_public',
  SIGNUP = 'inscription',
  LOGIN = 'connexion',
  FORGOT_PASSWORD = 'mot_de_passe_oublie',
  NOTIFICATIONS = 'notifications'
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'like' | 'proposal' | 'system';
  read: boolean;
  relatedId?: string; // Link to ad, conversation, etc.
  timestamp: any;
}

export interface User {
  uid: string;
  email: string | null;
  name: string;
  initials: string;
  rating: number;
  phone?: string;
  photoURL?: string | null;
  createdAt?: any;
  isVerified?: boolean;
  balance?: number;
  bio?: string;
  city?: string;
}

export interface Ad {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  userRating: number;
  userPhotoURL?: string | null;
  userVerified?: boolean;
  tripsCount: number;
  origin: string;
  destination: string;
  date: string;
  type: 'voyage' | 'colis';
  price?: number;
  weight?: string;
  mediaURL?: string | null;
  description?: string;
  category?: string;
  views?: number;
  likes?: string[];
  status?: 'ACTIVE' | 'EXPIRED' | 'COMPLETED';
  createdAt?: any;
}

export interface SearchCriteria {
  origin?: string;
  destination?: string;
  date?: string;
  weight?: string;
  category?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit' | 'withdrawal' | 'deposit';
  status: 'completed' | 'pending' | 'failed';
  item: string;
  amount: number;
  currency: 'EUR' | 'XOF';
  timestamp: any;
}
export interface Conversation {
  id: string;
  participants: string[]; // UIDs
  participantDetails: {
    [uid: string]: {
      name: string;
      avatar: string;
    };
  };
  lastMessage: string;
  lastMessageTimestamp: any; // Firestore Timestamp
  lastSenderId: string;
  unreadCount: {
    [uid: string]: number;
  };
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  type: 'text' | 'proposal';
  proposalAmount?: number;
  proposalStatus?: 'pending' | 'accepted' | 'rejected';
}
