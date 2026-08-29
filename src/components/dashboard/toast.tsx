"use client";

import React from "react";
import { CheckCircleIcon } from "./icons";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  const isVisible = Boolean(message);

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-300 pointer-events-none ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-16 opacity-0"
      }`}
    >
      <div className="bg-gov-charcoal text-white px-5 py-3 rounded border border-gov-sand/30 shadow-lg text-sm flex items-center gap-3">
        <CheckCircleIcon size={16} className="text-emerald-400" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
