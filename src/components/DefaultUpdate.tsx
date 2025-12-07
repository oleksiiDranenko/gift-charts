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
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    onSuccess: (data) => {
      dispatch(setGiftsList(data));
    },
  });

  useEffect(() => {
    dispatch(setDefaultFilters());
  }, [dispatch]);

  return <>{children}</>;
}
