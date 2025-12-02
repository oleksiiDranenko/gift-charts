"use client";

import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import useVibrate from "@/hooks/useVibrate";
import GaugeChart from "react-gauge-chart";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function VoteBanner() {
  const queryClient = useQueryClient();
  const { resolvedTheme } = useTheme();
  const vibrate = useVibrate();
  const t = useTranslations("vote");

  const voteBoxRef = useRef<HTMLDivElement | null>(null);

  const [selectedVote, setSelectedVote] = useState<
    "negative" | "neutral" | "positive" | null
  >(null);

  const VOTE_SCORE = { negative: 0, neutral: 50, positive: 100 };

  // Fetch poll status
  const { data: voteStatus, isLoading } = useQuery(
    ["voteStatus", "marketSentiment"],
    async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/vote/marketSentiment`
      );
      return res.data;
    },
    { retry: false }
  );

  const isAuthenticated = voteStatus?.isAuthenticated ?? false;
  const hasUserVoted = voteStatus?.userVote != null;

  // Submit vote
  const voteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVote) throw new Error("No vote selected");
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API}/vote`, {
        score: VOTE_SCORE[selectedVote],
        poll: "marketSentiment",
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["voteStatus", "marketSentiment"]);
    },
    onError: (err: any) => {
      console.error("Vote error:", err);
      alert(
        err.response?.data?.message ??
          "Failed to submit vote. Please try again."
      );
    },
  });

  // Close vote box if clicked outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        voteBoxRef.current &&
        !voteBoxRef.current.contains(e.target as Node)
      ) {
        setSelectedVote(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Percentages
  const percentages = (() => {
    const scores = voteStatus?.scoreCounts || {};
    const total = voteStatus?.totalVotes || 0;

    if (!total) return { negative: 0, neutral: 0, positive: 0 };

    return {
      negative: Math.round(((scores["0"] || 0) / total) * 100),
      neutral: Math.round(((scores["50"] || 0) / total) * 100),
      positive: Math.round(((scores["100"] || 0) / total) * 100),
    };
  })();

  const avg = voteStatus?.avgScore ?? 0;

  const getSentimentLabel = (v: number) =>
    v < 20
      ? t("veryNegative")
      : v < 40
      ? t("negative")
      : v <= 60
      ? t("neutral")
      : v <= 80
      ? t("positive")
      : t("veryPositive");

  const gaugeColors =
    resolvedTheme === "dark"
      ? ["#ff4d4d", "#ffff66", "#00e600"]
      : ["#ff4d4d", "#d1b500", "#00e600"];

  if (isLoading) return null;

  // -------------------------------------------------------------------------
  //  VIEW: Already voted or not authenticated
  // -------------------------------------------------------------------------
  if (hasUserVoted || !isAuthenticated) {
    return (
      <div className='w-full p-3 bg-secondaryTransparent rounded-3xl'>
        <div className='flex mb-3'>
          <Link
            href='/tools/vote'
            onClick={() => vibrate()}
            className='flex items-center pl-1'>
            {t("marketSentiment")}
            <svg
              className='size-4 ml-2'
              fill='currentColor'
              viewBox='0 0 24 24'>
              <path d='M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z' />
            </svg>
          </Link>

          <div className='hidden lg:flex flex-1 items-center gap-2'>
            <span
              className={`flex items-center p-1 px-3 rounded-3xl ${
                avg < 40
                  ? "bg-red-500/10 text-red-500"
                  : avg <= 60
                  ? "bg-yellow-500/10 text-yellow-500"
                  : "bg-green-500/10 text-green-500"
              }`}>
              {avg.toFixed(2)}% {getSentimentLabel(avg)}
            </span>

            <span className='flex items-center gap-1 text-secondaryText'>
              <svg
                className='size-4 text-foreground'
                fill='currentColor'
                viewBox='0 0 24 24'>
                <path d='M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z' />
              </svg>
              <span className='font-bold text-foreground'>
                {voteStatus?.totalVotes ?? 0}
              </span>
            </span>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row'>
          <div className='flex flex-1 items-center justify-center'>
            <GaugeChart
              id='sentiment-gauge'
              nrOfLevels={5}
              percent={avg / 100}
              colors={gaugeColors}
              arcWidth={0.17}
              cornerRadius={5}
              hideText
              needleColor={resolvedTheme === "dark" ? "#fff" : "#000"}
            />
          </div>

          <div className='hidden lg:block w-full p-3 bg-secondaryTransparent rounded-3xl'>
            {["positive", "neutral", "negative"].map((type) => (
              <div key={type} className='space-y-1 mb-3'>
                <span className='flex justify-between'>
                  <span
                    className={`text-sm font-bold ${
                      type === "positive"
                        ? "text-green-500"
                        : type === "neutral"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}>
                    {t(type)}
                  </span>
                  <span className='text-sm text-secondaryText'>
                    {percentages[type as keyof typeof percentages]}%
                  </span>
                </span>

                <div className='w-full bg-secondary rounded-3xl'>
                  <div
                    className={`h-2 rounded-3xl ${
                      type === "positive"
                        ? "bg-green-500"
                        : type === "neutral"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${
                        percentages[type as keyof typeof percentages]
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  //  VIEW: User voting
  // -------------------------------------------------------------------------
  return (
    <div className='w-full p-3 bg-secondaryTransparent rounded-3xl'>
      <h1 className='text-lg text-center mb-5'>{t("howDoYouFeel")}</h1>

      <div ref={voteBoxRef} className='w-full flex gap-3 mb-5'>
        {["negative", "neutral", "positive"].map((type) => (
          <button
            key={type}
            className={`w-full flex flex-col items-center py-3 rounded-3xl transition ${
              selectedVote === type
                ? type === "positive"
                  ? "bg-green-500 text-white font-bold"
                  : type === "neutral"
                  ? "bg-yellow-500 text-white font-bold"
                  : "bg-red-500 text-white font-bold"
                : "bg-background text-secondaryText"
            }`}
            onClick={() => {
              vibrate();
              setSelectedVote(type as any);
            }}>
            {t(type)}
          </button>
        ))}
      </div>

      <button
        className='w-full flex items-center justify-center gap-1 p-2 text-white bg-primary rounded-3xl disabled:opacity-50'
        disabled={!selectedVote || voteMutation.isLoading}
        onClick={() => {
          vibrate();
          voteMutation.mutate();
        }}>
        {voteMutation.isLoading ? "Submitting..." : "Vote"}
      </button>
    </div>
  );
}
