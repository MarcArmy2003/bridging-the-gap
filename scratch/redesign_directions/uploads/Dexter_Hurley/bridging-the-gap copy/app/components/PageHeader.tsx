"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  status?: "In progress" | "Resolved" | "New";
  backHref?: string;
};

export default function PageHeader({
  title,
  subtitle,
  status,
  backHref,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
      return;
    }
    router.back();
  };

  const statusClass =
    status ? `status-${status.toLowerCase().replace(" ", "-")}` : "";

  return (
    <header className="page-header">
      <div className="page-header-inner">
        <button
          type="button"
          onClick={handleBack}
          className="back-button"
          aria-label="Go back"
        >
          ← Back
        </button>

        <div className="header-text">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        {status ? (
          <span
            className={`status-badge ${statusClass}`}
            aria-label={`Status: ${status}`}
          >
            {status}
          </span>
        ) : null}
      </div>
    </header>
  );
}
