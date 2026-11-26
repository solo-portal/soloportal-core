import { Suspense } from "react";
import BookingClient from "./BookingClient";

export function generateStaticParams() {
  return [{ slug: "shaghayegh" }];
}

export default function BookingSlugPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#04222B]" />}>
      <BookingClient />
    </Suspense>
  );
}