"use client";

import { Fragment, useEffect, useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import { setDefaultFilters } from "@/redux/slices/filterListSlice";
import { useQuery } from "react-query";
import axios from "axios";

const fetchGifts = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
  return res.data;
};

export default function DefaultUpdate({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useQuery({
    queryKey: ["gifts"],
    queryFn: fetchGifts,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    onSuccess: (data) => {
      dispatch(setGiftsList(data));
    },
  });

  // useQuery(
  //   ["voteStatus", "marketSentiment"],
  //   async () => {
  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_API}/vote/marketSentiment`
  //     );
  //     return response.data;
  //   },
  //   { retry: false }
  // );

  // useQuery({
  //   queryKey: ["monthData"],
  //   queryFn: async () => {
  //     const { data } = await axios.get(
  //       `${process.env.NEXT_PUBLIC_API}/indexMonthData/68493d064b37eed02b7ae5af`
  //     );
  //     return data.slice(-336);
  //   },
  // });

  useEffect(() => {
    dispatch(setDefaultFilters());
  }, [dispatch]);

  return <>{children}</>;
}
