import type { VotingStatus } from "@/types";

export const votePrice = 200;

export const votingStatus = (process.env.NEXT_PUBLIC_VOTING_STATUS === "closed" ? "closed" : "open") satisfies VotingStatus;

export const isVotingOpen = votingStatus === "open";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
