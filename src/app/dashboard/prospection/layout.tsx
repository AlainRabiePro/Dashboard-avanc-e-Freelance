import React from "react";

export default function ProspectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="p-8">
      {children}
    </section>
  );
}
