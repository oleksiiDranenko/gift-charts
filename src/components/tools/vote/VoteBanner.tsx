"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { useRef } from "react";
import useVibrate from "@/hooks/useVibrate";
import GaugeChart from "react-gauge-chart";
import { Link } from "@/i18n/navigation";
import { Gauge } from "lucide-react";
import { useTranslations } from "next-intl";

export default function VoteBanner() {
  const queryClient = useQueryClient();
  const [hasVoted, setHasVoted] = useState<boolean | null>(null);
  const [selectedVote, setSelectedVote] = useState<
    "negative" | "neutral" | "positive" | null
  >(null);
  const vibrate = useVibrate();
  const voteBoxRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const translate = useTranslations("vote");

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        voteBoxRef.current &&
        !voteBoxRef.current.contains(e.target as Node)
      ) {
        setSelectedVote(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleVoteSubmit = () => {
    vibrate();
    if (selectedVote !== null) {
      voteMutation.mutate();
    }
  };

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
    <div className='w-full lg:1/2'>
      {isVoteStatusLoading ? null : !hasVoted ? (
        <div className='w-full p-3 bg-secondaryTransparent rounded-3xl'>
          <h1 className='w-full flex justify-center text-lg mb-5 px-1'>
            {translate("howDoYouFeel")}
          </h1>
          <div className='w-full gap-x-3 flex flex-row mb-5' ref={voteBoxRef}>
            <button
              className={`w-full flex flex-col items-center justify-center py-3 gap-y-1 text-xs box-border transition-all ease-in-out duration-200 ${
                selectedVote === "negative"
                  ? "bg-red-500 text-white font-bold"
                  : "text-secondaryText bg-background"
              } rounded-3xl p-1`}
              onClick={() => {
                setSelectedVote("negative");
                vibrate();
              }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-6'>
                <path d='M15.73 5.5h1.035A7.465 7.465 0 0 1 18 9.625a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.499 4.499 0 0 0-.322 1.672v.633A.75.75 0 0 1 9 22a2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 1.5 12.25c0-2.848.992-5.464 2.649-7.521C4.537 4.247 5.136 4 5.754 4H9.77a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23ZM21.669 14.023c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.958 8.958 0 0 1-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227Z' />
              </svg>
              {translate("negative")}
            </button>
            <button
              className={`w-full flex flex-col items-center justify-center py-3 gap-y-1 text-xs box-border transition-all ease-in-out duration-200 ${
                selectedVote === "neutral"
                  ? "bg-yellow-500 text-white font-bold"
                  : "text-secondaryText bg-background"
              } rounded-3xl p-1`}
              onClick={() => {
                setSelectedVote("neutral");
                vibrate();
              }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-6'>
                <path
                  fillRule='evenodd'
                  d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm2.023 6.828a.75.75 0 1 0-1.06-1.06 3.75 3.75 0 0 1-5.304 0 .75.75 0 0 0-1.06 1.06 5.25 5.25 0 0 0 7.424 0Z'
                  clipRule='evenodd'
                />
              </svg>
              {translate("neutral")}
            </button>
            <button
              className={`w-full flex flex-col items-center justify-center py-3 gap-y-1 text-xs box-border transition-all ease-in-out duration-200 ${
                selectedVote === "positive"
                  ? "bg-green-500 text-white font-bold"
                  : "text-secondaryText bg-background"
              } rounded-3xl p-1`}
              onClick={() => {
                setSelectedVote("positive");
                vibrate();
              }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-6'>
                <path d='M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z' />
              </svg>
              {translate("positive")}
            </button>
          </div>

          <button
            className='w-full flex items-center justify-center text-white gap-x-1 p-2 bg-primary disabled:opacity-50 rounded-3xl'
            onClick={handleVoteSubmit}
            disabled={selectedVote === null || voteMutation.isLoading}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-4'>
              <path
                fillRule='evenodd'
                d='M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z'
                clipRule='evenodd'
              />
            </svg>

            {voteMutation.isLoading ? "Submitting..." : "Vote"}
          </button>
        </div>
      ) : (
        <div className='w-full flex flex-col box-border p-3 rounded-3xl bg-secondaryTransparent overflow-hidden'>
          <div className='w-full flex mb-3'>
            <Link
              href={"/tools/vote"}
              onClick={() => vibrate()}
              className='w-fit lg:w-full flex flex-row items-center text-center pl-1'>
              {translate("marketSentiment")}
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-4 ml-2'>
                <path
                  fillRule='evenodd'
                  d='M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z'
                  clipRule='evenodd'
                />
              </svg>
            </Link>

            <div className='hidden lg:flex w-full lg:flex-row justify-start items-center gap-x-2'>
              <span
                className={`flex justify-center items-center p-1 px-3 ${
                  voteStatus?.avgScore < 40
                    ? "bg-red-500/10 text-red-500"
                    : voteStatus?.avgScore <= 60
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-green-500/10 text-green-500"
                } rounded-3xl`}>
                <span className='mr-2'>
                  {parseFloat(voteStatus?.avgScore).toFixed(2) || 0}%
                </span>
                {voteStatus?.avgScore < 20
                  ? translate("veryNegative")
                  : voteStatus?.avgScore < 40
                  ? translate("negative")
                  : voteStatus?.avgScore <= 60
                  ? translate("neutral")
                  : voteStatus?.avgScore <= 80
                  ? translate("positive")
                  : translate("veryPositive")}
              </span>
              <span className='flex flex-row items-center justify-center gap-x-1 text-secondaryText'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='size-4 text-foreground'>
                  <path d='M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z' />
                </svg>

                <span className='font-bold text-foreground'>
                  {voteStatus?.totalVotes || 0}
                </span>
              </span>
            </div>
          </div>

          <div className='flex flex-col lg:flex-row'>
            <div className='w-full h-full mt-1 flex flex-row lg:flex-col items-center justify-between overflow-hidden'>
              {/* Gauge */}
              <div className='w-full h-full flex items-center justify-center overflow-hidden'>
                <div className='scale-[0.9] lg:scale-100 origin-center'>
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
                </div>
              </div>

              {/* Vote info */}
              <div className='w-full lg:hidden h-full flex flex-col justify-center items-center gap-y-2'>
                <div className='w-full flex flex-col space-y-3 items-center'>
                  <span className='flex flex-row items-center justify-center gap-x-1 text-secondaryText'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      className='size-4 text-secondaryText'>
                      <path d='M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z' />
                    </svg>
                    {translate("totalVotes")}
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
                    {parseFloat(voteStatus?.avgScore).toFixed(2) || 0}% {" - "}
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

            <div className='w-full hidden lg:block p-3 bg-secondaryTransparent rounded-3xl'>
              <div className='space-y-3'>
                <div className='space-y-1'>
                  <span className='flex justify-between'>
                    <span className='text-sm font-bold text-green-500'>
                      {translate("positive")}
                    </span>
                    <span className='text-sm text-secondaryText'>
                      {percentages.positive}%
                    </span>
                  </span>
                  <div className='w-full bg-secondary rounded-3xl'>
                    <div
                      className='h-2 bg-green-500 rounded-3xl'
                      style={{ width: `${percentages.positive}%` }}></div>
                  </div>
                </div>

                <div className='space-y-1'>
                  <span className='flex justify-between'>
                    <span className='text-sm font-bold text-yellow-500'>
                      {translate("neutral")}
                    </span>
                    <span className='text-sm text-secondaryText'>
                      {percentages.neutral}%
                    </span>
                  </span>
                  <div className='w-full bg-secondary rounded-3xl'>
                    <div
                      className='h-2 bg-yellow-500 rounded-3xl'
                      style={{ width: `${percentages.neutral}%` }}></div>
                  </div>
                </div>

                <div className='space-y-1'>
                  <span className='flex justify-between'>
                    <span className='text-sm font-bold text-red-500'>
                      {translate("negative")}
                    </span>
                    <span className='text-sm text-secondaryText'>
                      {percentages.negative}%
                    </span>
                  </span>
                  <div className='w-full bg-secondary rounded-3xl'>
                    <div
                      className='h-2 bg-red-500 rounded-3xl'
                      style={{ width: `${percentages.negative}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
