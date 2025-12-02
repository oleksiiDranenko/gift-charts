"use client";

import { Check, UsersRound } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import GaugeChart from "react-gauge-chart";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import ReactLoading from "react-loading";

export default function Vote() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hasVoted, setHasVoted] = useState<boolean | null>(null);
  const [selectedVote, setSelectedVote] = useState<
    "negative" | "neutral" | "positive" | null
  >(null);

  // Map vote selection to numerical score
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

  useEffect(() => {
    if (!isVoteStatusLoading && voteStatus) {
      if (!voteStatus.isAuthenticated) {
        // Guests cannot vote → show results immediately
        setHasVoted(true);
      } else {
        // Authenticated users: has voted only if userVote is NOT null
        setHasVoted(voteStatus.userVote !== null);
      }
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

  // Calculate vote percentages
  const getVotePercentages = () => {
    if (!voteStatus || !voteStatus.scoreCounts || voteStatus.totalVotes === 0) {
      return { negative: 0, neutral: 0, positive: 0 };
    }
    const { scoreCounts, totalVotes } = voteStatus;
    return {
      negative: Math.round(((scoreCounts["0"] || 0) / totalVotes) * 100) || 0,
      neutral: Math.round(((scoreCounts["50"] || 0) / totalVotes) * 100) || 0,
      positive: Math.round(((scoreCounts["100"] || 0) / totalVotes) * 100) || 0,
    };
  };

  const percentages = getVotePercentages();

  return (
    <div className='w-full'>
      {isVoteStatusLoading || hasVoted === null ? (
        <div className='w-full flex items-center justify-center'>
          <ReactLoading
            type='spin'
            color='#0098EA'
            height={30}
            width={30}
            className='mt-5'
          />
        </div>
      ) : !hasVoted ? (
        <>
          <h1 className='w-full flex text-start text-2xl font-bold mb-3 p-3'>
            How do you feel about the Gifts market?
          </h1>
          <div className='w-full gap-x-2 flex flex-row mb-5'>
            <button
              className={`w-full ${
                selectedVote === "negative"
                  ? "bg-red-500 text-white font-bold"
                  : " bg-secondaryTransparent"
              } rounded-3xl p-2`}
              onClick={() => setSelectedVote("negative")}>
              Negative
            </button>
            <button
              className={`w-full ${
                selectedVote === "neutral"
                  ? "bg-yellow-500 text-white font-bold"
                  : " bg-secondaryTransparent"
              } rounded-3xl p-2`}
              onClick={() => setSelectedVote("neutral")}>
              Neutral
            </button>
            <button
              className={`w-full ${
                selectedVote === "positive"
                  ? "bg-green-500 text-white font-bold"
                  : " bg-secondaryTransparent"
              } rounded-3xl p-2`}
              onClick={() => setSelectedVote("positive")}>
              Positive
            </button>
          </div>

          <button
            className='w-full flex items-center justify-center text-white gap-x-1 p-2 bg-primary disabled:opacity-50 rounded-3xl mb-5'
            onClick={handleVoteSubmit}
            disabled={selectedVote === null || voteMutation.isLoading}>
            <Check size={16} />
            {voteMutation.isLoading ? "Submitting..." : "Vote"}
          </button>

          <div className='w-full flex items-center justify-center text-secondaryText'>
            Vote to see the results
          </div>
        </>
      ) : (
        <>
          <h1 className='w-full flex lg:hidden text-start text-2xl font-bold mb-3 p-3'>
            How do users feel about the Gifts market?
          </h1>
          <div className='w-full lg:1/2 mt-3 flex flex-col lg:flex-row lg:justify-between items-center py-3 '>
            <div className='w-full relative'>
              <GaugeChart
                id='fear-greed-gauge'
                nrOfLevels={5}
                percent={voteStatus?.avgScore / 100 || 0}
                colors={
                  resolvedTheme === "dark"
                    ? ["#ff4d4d", "#ffff66", "#00e600"]
                    : ["#ff4d4d", "#d1b500", "#00e600"]
                }
                arcWidth={0.17}
                cornerRadius={5}
                hideText={true}
                needleColor={resolvedTheme === "dark" ? "#fff" : "#000"}
              />
              <span className='absolute lg:text-base text-xs top-1/3 md:top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary pointer-events-none'>
                @gift_charts
              </span>
            </div>
            <div className='w-full lg:1/2 flex flex-col lg:items-center items-center gap-y-2'>
              <h1 className='w-full hidden lg:block text-start text-2xl font-bold mb-3 p-3'>
                How do investors feel about the Gifts market?
              </h1>
              <div className='w-full h-full flex flex-col space-y-3 p-3 bg-secondaryTransparent rounded-3xl mb-3'>
                <span className='flex flex-row items-center justify-center gap-x-1 text-secondaryText'>
                  <UsersRound size={16} />
                  Total votes:{" "}
                  <span className='font-bold text-foreground'>
                    {voteStatus?.totalVotes || 0}
                  </span>
                </span>
                <span
                  className={`flex justify-center items-center p-1 px-3 ${
                    voteStatus?.avgScore < 40
                      ? "bg-red-500/10 text-red-500"
                      : voteStatus?.avgScore <= 60
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-green-500/10 text-green-500"
                  } rounded-3xl`}>
                  {parseFloat(voteStatus?.avgScore).toFixed(2) || 0}% -{" "}
                  {voteStatus?.avgScore < 20
                    ? "Very negative"
                    : voteStatus?.avgScore < 40
                    ? "Negative"
                    : voteStatus?.avgScore <= 60
                    ? "Neutral"
                    : voteStatus?.avgScore <= 80
                    ? "Positive"
                    : "Very Positive"}
                </span>
              </div>
            </div>
          </div>

          <div className='w-full p-3 bg-secondaryTransparent rounded-3xl'>
            <div className='space-y-3'>
              <div className='space-y-2'>
                <span className='flex justify-between'>
                  <span className='font-bold text-green-500'>Positive</span>
                  <span className='text-secondaryText'>
                    {percentages.positive}%
                  </span>
                </span>
                <div className='w-full bg-secondary rounded-3xl'>
                  <div
                    className='h-3 bg-green-500 rounded-3xl'
                    style={{ width: `${percentages.positive}%` }}></div>
                </div>
              </div>

              <div className='space-y-2'>
                <span className='flex justify-between'>
                  <span className='font-bold text-yellow-500'>Neutral</span>
                  <span className='text-secondaryText'>
                    {percentages.neutral}%
                  </span>
                </span>
                <div className='w-full bg-secondary rounded-3xl'>
                  <div
                    className='h-3 bg-yellow-500 rounded-3xl'
                    style={{ width: `${percentages.neutral}%` }}></div>
                </div>
              </div>

              <div className='space-y-2'>
                <span className='flex justify-between'>
                  <span className='font-bold text-red-500'>Negative</span>
                  <span className='text-secondaryText'>
                    {percentages.negative}%
                  </span>
                </span>
                <div className='w-full bg-secondary rounded-3xl'>
                  <div
                    className='h-3 bg-red-500 rounded-3xl'
                    style={{ width: `${percentages.negative}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
