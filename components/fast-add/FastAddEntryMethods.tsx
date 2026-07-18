import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

import {
  profilePrimaryButtonClassName,
  profileSecondaryButtonClassName,
} from "@/components/profile/profile-styles";

export type FastAddEntryMethod = "search" | "upload" | "camera";

type FastAddEntryMethodsProps = {
  activeMethod: FastAddEntryMethod | null;
  onSelect: (method: FastAddEntryMethod) => void;
};

const methods = [
  {
    id: "search" as const,
    label: "Search card",
    description: "Keyboard-friendly finder for name, number, or set.",
    icon: "🔎",
    desktopOrder: 1,
    mobileOrder: 2,
  },
  {
    id: "upload" as const,
    label: "Upload photo",
    description: "Drag, drop, or paste a card image on desktop.",
    icon: "🖼️",
    desktopOrder: 2,
    mobileOrder: 3,
  },
  {
    id: "camera" as const,
    label: "Take photo",
    description: "Use your phone camera or photo library.",
    icon: "📷",
    desktopOrder: 3,
    mobileOrder: 1,
  },
];

export function FastAddEntryMethods({
  activeMethod,
  onSelect,
}: FastAddEntryMethodsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {methods.map((method) => {
        const isActive = activeMethod === method.id;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={`rounded-2xl border p-5 text-left transition-colors ${
              isActive
                ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            } ${method.id === "camera" ? "order-1 sm:order-3" : method.id === "search" ? "order-2 sm:order-1" : "order-3 sm:order-2"}`}
          >
            <span className="text-2xl" aria-hidden="true">
              {method.icon}
            </span>
            <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {method.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">{method.description}</p>
          </button>
        );
      })}
    </div>
  );
}

export function FastAddBackLink() {
  return (
    <Link
      href="/my-collection"
      className="inline-flex min-h-11 items-center text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
    >
      ← Back to collection
    </Link>
  );
}

export function FastAddPrimaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button type="button" className={profilePrimaryButtonClassName} {...props}>
      {children}
    </button>
  );
}

export function FastAddSecondaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button type="button" className={profileSecondaryButtonClassName} {...props}>
      {children}
    </button>
  );
}
