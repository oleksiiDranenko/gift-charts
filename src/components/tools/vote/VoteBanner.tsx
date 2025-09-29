"use client";

import { Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import ReactLoading from "react-loading";

export default function VoteBanner() {
  const queryClient = useQueryClient();
  const [hasVoted, setHasVoted] = useState<boolean | null>(null);
  const [selectedVote, setSelectedVote] = useState<
    "negative" | "neutral" | "positive" | null
  >(null);

  const voteToScore = {
    negative: 0,
    neutral: 50,
    positive: 100,
  };

  // Check if user has already voted
  const { data: voteStatus, isLoading: isVoteStatusLoading } = useQuery(
    ["voteStatus", "marketSentiment"],
    async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/vote/marketSentiment`
      );
      return response.data;
    },
    {
      onError: (error: any) => {
        console.error("Error checking vote status:", error);
      },
      retry: false, // Don't retry on failure
    }
  );

  // Update hasVoted based on vote status
  useEffect(() => {
    if (!isVoteStatusLoading && voteStatus) {
      setHasVoted(voteStatus.userVote !== false);
    }
  }, [isVoteStatusLoading, voteStatus]);

  // TanStack Query mutation for submitting vote
  const voteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVote) throw new Error("No vote selected");
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/vote`, {
        score: voteToScore[selectedVote],
        poll: "marketSentiment",
      });
      return response.data;
    },
    onSuccess: () => {
      setHasVoted(true);
      // Refetch vote status to update poll data
      queryClient.invalidateQueries(["voteStatus", "marketSentiment"]);
    },
    onError: (error: any) => {
      console.error("Error submitting vote:", error);
      if (error.response?.status === 401) {
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to submit vote. Please try again."
        );
      }
    },
  });

  const handleVoteSubmit = () => {
    if (selectedVote !== null) {
      voteMutation.mutate();
    }
  };

  return (
    <>
      {isVoteStatusLoading || hasVoted === null ? (
        <div className='w-full flex items-center justify-center'>
          <ReactLoading
            type='spin'
            color='#0098EA'
            height={30}
            width={30}
            className='my-5'
          />
        </div>
      ) : !hasVoted ? (
        <div className='w-full px-3 mb-4'>
          <div className='w-full p-3 bg-secondaryTransparent rounded-xl'>
            <h1 className='w-full flex text-start text-lg font-bold mb-3'>
              How do you feel about the Gifts market?
            </h1>
            <div className='w-full gap-x-2 flex flex-row mb-3'>
              <button
                className={`w-full text-sm ${
                  selectedVote === "negative"
                    ? "bg-red-500 text-white font-bold"
                    : "border border-secondary text-secondaryText"
                } rounded-xl p-1`}
                onClick={() => setSelectedVote("negative")}>
                Negative
              </button>
              <button
                className={`w-full text-sm ${
                  selectedVote === "neutral"
                    ? "bg-yellow-500 text-white font-bold"
                    : "border border-secondary text-secondaryText"
                } rounded-xl p-1`}
                onClick={() => setSelectedVote("neutral")}>
                Neutral
              </button>
              <button
                className={`w-full text-sm ${
                  selectedVote === "positive"
                    ? "bg-green-500 text-white font-bold"
                    : "border border-secondary text-secondaryText"
                } rounded-xl p-1`}
                onClick={() => setSelectedVote("positive")}>
                Positive
              </button>
            </div>

            <button
              className='w-full flex items-center justify-center text-sm text-white gap-x-1 p-2 bg-primary disabled:opacity-50 rounded-xl'
              onClick={handleVoteSubmit}
              disabled={selectedVote === null || voteMutation.isLoading}>
              <Check size={16} />
              {voteMutation.isLoading ? "Submitting..." : "Vote"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
