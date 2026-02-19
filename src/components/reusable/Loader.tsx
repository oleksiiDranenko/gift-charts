import { LoaderCircle } from "lucide-react";
import React from "react";

export default function Loader() {
  return <LoaderCircle size={28} className='text-primary animate-spin' />;
}
