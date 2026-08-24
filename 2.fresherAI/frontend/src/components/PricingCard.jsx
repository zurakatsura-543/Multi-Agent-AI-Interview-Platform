import React from 'react'
import { FiArrowRight, FiCheck, FiCpu } from 'react-icons/fi'
import { GiTwoCoins } from 'react-icons/gi'

function PricingCard({
    title,
    price,
    coins,
    button,
    features,
    popular,
    badge,
    description,
    savings,
    disabled,
    onBuy,
}) {
    return (
        <div className={`group relative flex min-h-[390px] w-full flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-300
        ${popular
          ? "border-[#8B5CF6]/60 bg-[#071123] text-white shadow-[0_28px_80px_rgba(80,43,210,0.32)]"
          : "border-white/80 bg-white/85 text-[#071123] shadow-[0_18px_55px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:border-[#8B5CF6]/35 hover:shadow-[0_28px_70px_rgba(45,35,120,0.14)]"
        }`}>
            <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${popular ? "bg-[#8B5CF6]" : "bg-[#E9E2FF]"}`} />
            <div className={`pointer-events-none absolute inset-0 opacity-[0.45] ${popular ? "bg-[linear-gradient(135deg,rgba(139,92,246,0.18)_0%,transparent_36%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,28px_28px,28px_28px]" : "bg-[linear-gradient(135deg,rgba(109,53,255,0.08)_0%,transparent_42%)]"}`} />

            {badge && (
                <div className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[10px] font-black z-10 ${popular ? "border-white/10 bg-white/10 text-white" : "border-[#6D35FF]/10 bg-[#F1EDFF] text-[#5B21B6]"}`}>{badge}</div>
            )}

            <div className={`relative mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${popular ? "border-white/10 bg-white/10 text-purple-200" : "border-[#6D35FF]/10 bg-[#F8F7FF] text-[#6D35FF]"}`}>
                <FiCpu size={17} />
            </div>
            
            <h2 className={`relative text-xl font-black ${popular ? "text-white" : "text-[#071123]"}`}>{title}</h2>
            <p className={`relative mt-1 min-h-10 text-xs leading-5 ${popular ? "text-white/55" : "text-black/45"}`}>{description}</p>

            <div className='relative mt-4 flex items-end gap-1.5'>
                <span className={`text-4xl font-black tracking-normal ${popular ? "text-white" : "text-[#071123]"}`}>₹{price}</span>
                <span className={`pb-1 text-xs ${popular ? "text-white/40" : "text-black/35"}`}>INR</span>
            </div>

            <div className={`relative mt-4 flex items-center gap-2 rounded-xl border p-3 ${popular ? "border-white/10 bg-white/[0.08]" : "border-[#6D35FF]/12 bg-[#F8F7FF]"}`}>
            <GiTwoCoins className="text-yellow-500" size={16}/>
            <span className={`text-sm font-black ${popular ? "text-white" : "text-[#251855]"}`}>
                {coins} Interview Coins

            </span>
            </div>

            <div className='relative mt-4 space-y-2'>
                {features.map((f)=>(
                    <div key={f} className={`flex items-center gap-2 text-xs ${popular ? "text-white/68" : "text-black/55"}`}>
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${popular ? "bg-emerald-400/15 text-emerald-300" : "bg-emerald-50 text-emerald-600"}`}>
                            <FiCheck size={11} />
                        </span>
                        <span>{f}</span>
                    </div>
                ))}
            </div>

            {savings && (
                <div className={`relative mt-4 rounded-lg border px-2.5 py-2 text-[10px] font-black ${popular ? "border-[#8B5CF6]/35 bg-[#8B5CF6]/15 text-purple-100" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                    {savings}
                </div>
            )}

            <button disabled={disabled}
            onClick={onBuy}
             className={`relative mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-black transition
    ${
      disabled
        ? "cursor-not-allowed bg-gray-700 text-gray-400"
        : popular
        ? "bg-white text-[#251855] shadow-[0_12px_30px_rgba(255,255,255,0.18)] hover:bg-purple-50"
        : "bg-[#071123] text-white shadow-[0_12px_28px_rgba(7,17,35,0.16)] hover:bg-[#251855]"
    }`}>
        {button}
        {!disabled && <FiArrowRight size={15} />}
    </button>
        </div>
    )
}

export default PricingCard
