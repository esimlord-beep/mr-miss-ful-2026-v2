export type Contestant = {
  id: string;
  contestant_number: string;
  name: string;
  category: string;
  department: string;
  faculty: string;
  bio: string;
  photo_url: string;
  votes: number;
};

export type PaymentInitResponse = {
  authorization_url: string;
  reference: string;
};

export type VotingStatus = "open" | "closed";
