"use client";

import useVibrate from "@/hooks/useVibrate";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

interface VoteModalProps {
  /** Optional: external control for opening/closing modal */
  isOpen?: boolean;
  /** Optional: callback when modal closes */
  onOpenChange?: (open: boolean) => void;
}

export default function VoteModal({
  isOpen: controlledOpen,
  onOpenChange,
}: VoteModalProps) {
  // Initialize internalOpen to false to keep modal closed initially
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  // Track whether the fetch has completed
  const [isFetchComplete, setIsFetchComplete] = useState(false);

  const vibrate = useVibrate();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [hasVoted, setHasVoted] = useState<boolean | null>(null);
  const [selectedVote, setSelectedVote] = useState<
    "negative" | "neutral" | "positive" | null
  >(null);

  const voteToScore = { negative: 0, neutral: 50, positive: 100 };

  // --- Vote Status Query ---
  const { data: voteStatus, isLoading: isVoteStatusLoading } = useQuery(
    ["voteStatus", "marketSentiment"],
    async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/vote/marketSentiment`
      );
      return res.data;
    },
    {
      onError: (err: any) => console.error("Error checking vote status:", err),
      retry: false,
    }
  );

  useEffect(() => {
    if (!isVoteStatusLoading && voteStatus !== undefined) {
      const userHasVoted = voteStatus.userVote !== false;
      setHasVoted(userHasVoted);
      // Open modal only if user hasn't voted and isOpen isn't externally controlled
      if (!userHasVoted && controlledOpen === undefined) {
        setInternalOpen(true);
      }
      // Mark fetch as complete
      setIsFetchComplete(true);
    }
  }, [isVoteStatusLoading, voteStatus, controlledOpen]);

  // --- Mutation ---
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
      queryClient.invalidateQueries(["voteStatus", "marketSentiment"]);
    },
    onError: (error: any) => {
      console.error("Error submitting vote:", error);
      alert(error.response?.data?.message || "Failed to submit vote.");
    },
  });

  const handleVoteSubmit = () => {
    vibrate();
    if (selectedVote) {
      voteMutation.mutate();
      // router.push("/tools/vote");
    }
  };

  const closeModal = () => {
    if (onOpenChange) onOpenChange(false);
    else setInternalOpen(false);
  };

  // Only render the modal if fetch is complete and user hasn't voted
  if (!isFetchComplete || hasVoted) {
    return null;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-200'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'>
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm' />
        </Transition.Child>

        <div className='fixed inset-0 flex items-end justify-center'>
          <Transition.Child
            as={Fragment}
            enter='transform transition ease-out duration-300'
            enterFrom='translate-y-full opacity-0'
            enterTo='translate-y-0 opacity-100'
            leave='transform transition ease-in duration-200'
            leaveFrom='translate-y-0 opacity-100'
            leaveTo='translate-y-full opacity-0'>
            <Dialog.Panel className='w-full lg:w-11/12 h-2/3 lg:h-5/6 p-3 rounded-t-xl bg-background flex flex-col border-t border-secondaryTransparent'>
              <div className="w-full h-52 lg:h-80 rounded-3xl mb-1 bg-[url('/images/gift-banner.jpg')] bg-center bg-no-repeat bg-cover"></div>

              <div>
                <h1 className='w-full flex text-start text-2xl font-bold mb-3 p-3'>
                  How do you feel about the Gifts market?
                </h1>

                <div className='w-full gap-x-2 flex flex-row mb-5'>
                  {["negative", "neutral", "positive"].map((type) => (
                    <button
                      key={type}
                      className={`w-full ${
                        selectedVote === type
                          ? type === "negative"
                            ? "bg-red-500 font-bold text-white"
                            : type === "neutral"
                            ? "bg-yellow-500 font-bold text-white"
                            : "bg-green-500 font-bold text-white"
                          : "bg-secondaryTransparent"
                      } text-secondaryText rounded-3xl p-2`}
                      onClick={() => {
                        setSelectedVote(type as any);
                        vibrate();
                      }}>
                      {type[0].toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>

                <button
                  className='w-full flex items-center justify-center text-white gap-x-1 p-2 bg-primary disabled:opacity-50 rounded-3xl mb-5'
                  onClick={handleVoteSubmit}
                  disabled={!selectedVote || voteMutation.isLoading}>
                  <Check size={16} />
                  {voteMutation.isLoading ? "Submitting..." : "Vote"}
                </button>

                <div className='w-full flex items-center justify-center'>
                  <button
                    className='text-secondaryText border-b-2 border-secondary'
                    onClick={() => {
                      closeModal();
                      vibrate();
                    }}>
                    Skip vote
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
