"use client";

import { Link } from "@/i18n/navigation";
import { ComponentProps } from "react";

type NoPrefetchLinkProps = ComponentProps<typeof Link>;

export default function NoPrefetchLink(props: NoPrefetchLinkProps) {
  return <Link {...props} />;
}
