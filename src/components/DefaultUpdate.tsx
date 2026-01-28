"use client";

import { Fragment, useEffect, useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import { setDefaultFilters } from "@/redux/slices/filterListSlice";
import { useQuery } from "react-query";
import axios from "axios";

export default function DefaultUpdate({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setDefaultFilters());
  }, [dispatch]);

  return <>{children}</>;
}
