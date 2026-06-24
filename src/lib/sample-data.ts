import { Contestant } from "@/types";

export const fallbackContestants: Contestant[] = [
  {
    id: "contestant-1",
    name: "Contestant One",
    contestant_number: "001",
    category: "Mr",
    votes: 0,
    photo_url: "https://example.com/your-image-1.jpg",
    department: "Computer Science",
    faculty: "Science",
    bio: "Welcome to my profile! Vote for me to become the next representative."
  },
  {
    id: "contestant-2",
    name: "Contestant Two",
    contestant_number: "002",
    category: "Miss",
    votes: 0,
    photo_url: "https://example.com/your-image-2.jpg",
    department: "Microbiology",
    faculty: "Science",
    bio: "Thank you for your support. Let us make history together!"
  },
  {
    id: "contestant-3",
    name: "Contestant Three",
    contestant_number: "003",
    category: "Mr",
    votes: 0,
    photo_url: "https://example.com/your-image-3.jpg",
    department: "Economics",
    faculty: "Social Sciences",
    bio: "Your vote is my motivation. Let's win this crown!"
  }
];

export const SAMPLE_SITE_SETTINGS = {
  title: "Mr & Miss FUL 2026",
  description: "Federal University Lokoja SUG Voting Portal",
  footer_text: "Copyright ©️ 2026 Mr & Miss FUL 2026 — Federal University Lokoja SUG. All Rights Reserved."
};
