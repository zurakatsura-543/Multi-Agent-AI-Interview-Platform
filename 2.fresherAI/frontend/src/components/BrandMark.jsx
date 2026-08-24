import React from "react";
import { BRAND_LOGO, BRAND_NAME, BRAND_SHORT } from "../utils/brand";

function BrandMark({ compact = false, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#6D35FF]/15 bg-white shadow-[0_4px_14px_rgba(109,53,255,0.18)]">
        <img src={BRAND_LOGO} alt="" className="h-7 w-7 object-contain" />
      </span>
      {!compact && (
        <span className="text-sm font-extrabold tracking-tight text-[#071123] sm:text-base">
          {BRAND_NAME}
        </span>
      )}
      {compact && (
        <span className="text-sm font-extrabold tracking-tight text-[#071123]">
          {BRAND_SHORT}
        </span>
      )}
    </div>
  );
}

export default BrandMark;
