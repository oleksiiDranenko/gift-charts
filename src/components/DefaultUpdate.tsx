"use client";

import { Fragment, useEffect, useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setDefaultFilters } from "@/redux/slices/filterListSlice";

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
