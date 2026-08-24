import React from 'react'
import { motion } from "motion/react"
import { useState } from 'react'
import { FiArrowLeft, FiCpu, FiMenu, FiShield, FiX, FiZap } from 'react-icons/fi'
import { GiTwoCoins } from 'react-icons/gi'
import PricingCard from '../components/PricingCard'
import api from '../utils/axios'
import { useNavigate } from 'react-router-dom'
import { BRAND_NAME } from '../utils/brand'
import BrandMark from '../components/BrandMark'

const plan = [
    {
        id: "launch",
        title: "Launch",
        price: "99",
        coins: 200,
        button: "Buy 200 Coins",
        badge: "Starter",
        description: "A compact credit pack for one focused prep cycle.",
        popular: false,
        disabled: false,
        features: [
            "4 AI interviews",
            "20 resume scans",
            "10 roadmap generations",
            "Instant coin credit",
        ],
    },
    {
        id: "growth",
        title: "Growth",
        price: "199",
        coins: 500,
        button: "Buy 500 Coins",
        badge: "Popular",
        description: "A higher-velocity pack for active role targeting.",
        popular: true,
        disabled: false,
        savings: "More than 2x coins vs Launch",
        features: [
            "10 AI interviews",
            "50 resume scans",
            "25 roadmap generations",
            "Best value for students",
        ],
    },
    {
        id: "pro",
        title: "Pro",
        price: "349",
        coins: 1000,
        button: "Buy 1000 Coins",
        badge: "Serious Prep",
        description: "For multiple roles, resume iterations, and practice rounds.",
        popular: false,
        disabled: false,
        savings: "Save more for longer prep",
        features: [
            "20 AI interviews",
            "100 resume scans",
            "50 roadmap generations",
            "Role-specific preparation",
        ],
    },
    {
        id: "scale",
        title: "Scale",
        price: "599",
        coins: 2000,
        button: "Buy 2000 Coins",
        badge: "Max Value",
        description: "Large credit reserve for heavy testing and demos.",
        popular: false,
        disabled: false,
        savings: "Lowest cost per coin",
        features: [
            "40 AI interviews",
            "200 resume scans",
            "100 roadmap generations",
            "Great for product demos",
        ],
    },
];
function Billing({ user, setUser }) {
    const [showMenu, setShowMenu] = useState(false)
    const [loadingPlan, setLoadingPlan] = useState("")

    const navigate = useNavigate()
    const handlePayment = async (plan) => {
        if (plan.disabled) return;
        try {
            if (!window.Razorpay) {
                alert("Razorpay checkout failed to load. Check your internet connection and refresh.")
                return;
            }

            if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
                alert("Frontend Razorpay key is missing in frontend/.env")
                return;
            }

            setLoadingPlan(plan.id)
            const result = await api.post("/api/billing/create",
                { planId: plan.id })

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: result.data.order.amount,
                currency: result.data.order.currency,
                name: BRAND_NAME,
                description: `${plan.title} - ${plan.coins} Interview Coins`,
                order_id: result.data.order.id,

                handler: async function (response) {
                    try {
                        const verifyRes = await api.post("/api/billing/verify", response)

                        setUser((prev) => ({
                            ...prev, interviewCoin: verifyRes.data.interviewCoin
                        }))

                        alert(`${verifyRes.data.coinsAdded || plan.coins} coins added successfully`)
                        navigate("/dashboard")

                    } catch (error) {
                        console.log(error);

                        alert(
                            error?.response?.data?.message ||
                            "Payment verification failed"
                        );
                    }

                },


                theme: {
                color: "#6D35FF",
                },

            }


            const razorpay = new window.Razorpay(options);
            razorpay.on("payment.failed", function (response) {
                alert(response?.error?.description || "Payment failed")
            });
            razorpay.open()


        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.message || "Unable to start payment. Please try again.")
        } finally {
            setLoadingPlan("")
        }
    }
    return (
        <div className='min-h-screen bg-[#F4F6FB] text-[#071123]'>
            <motion.nav
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className='sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.04)]'>
                <div className='mx-auto flex h-12 max-w-7xl items-center justify-between px-3 sm:px-5'>
                    <div onClick={() => navigate("/dashboard")}
                        className='flex cursor-pointer items-center gap-1.5'>
                        <BrandMark />
                        <span className='hidden rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-black/50 sm:block'>Interview Coins</span>
                    </div>

                    <div className='flex items-center gap-2'>
                        <button onClick={() => navigate("/dashboard")} className='hidden h-8 items-center gap-1.5 rounded-lg border border-black/10 px-2.5 text-xs font-semibold text-black/55 transition hover:border-[#6D35FF]/30 hover:text-[#251855] sm:flex'>
                            <FiArrowLeft size={14} />
                            Dashboard
                        </button>
                        <button onClick={() => setShowMenu(!showMenu)} className='flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 text-black/60 transition hover:border-black/35 hover:text-[#0A0A0A]'>
                            {showMenu ? <FiX size={16} /> : <FiMenu size={16} />}
                        </button>
                    </div>

                    {showMenu && (
                        <>
                            <div onClick={() => setShowMenu(false)} className='fixed inset-0 z-30 bg-black/20 lg:hidden' />

                            <div className='absolute right-1 top-11 z-40 w-[240px] max-w-[calc(100vw-24px)] rounded-xl overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]'>
                                <div className='absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none' />

                                <div className='relative flex items-center gap-2 border-b border-white/10 pb-3'>

                                    <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/15 border border-yellow-400/20'>
                                        <GiTwoCoins className='text-yellow-400 text-sm' />
                                    </div>

                                    <div>
                                        <p className="text-[10px] text-white/40">
                                            Available Coins
                                        </p>
                                        <h3 className='text-lg font-bold text-white'>{user?.interviewCoin}</h3>
                                    </div>

                                </div>

                                <div className='relative mt-3.5 space-y-1.5'>
                                    {[
                                        { title: "Resume Builder", coin: "-10" },
                                        { title: "Resume Scorer", coin: "-10" },
                                        { title: "Roadmap Generator", coin: "-20" },
                                        { title: "AI Interview", coin: "-50" },
                                    ].map((item) => (
                                        <div key={item.title} className='flex items-center justify-between rounded-lg bg-white/5 border border-white/8 px-2.5 py-1.5'>
                                            <span className="text-xs text-white/70">
                                                {item.title}
                                            </span>
                                            <span className="text-xs font-bold text-red-400">
                                                {item.coin}
                                            </span>

                                        </div>
                                    ))}

                                </div>

                                <div className='relative mt-3.5 rounded-lg border border-violet-400/20 bg-violet-500/10 p-2.5'>
                                    <p className="text-[10px] leading-4 text-violet-300">
                                        Every AI feature uses Interview Coins.
                                        Buy more coins anytime to continue using
                                        Resume Builder, Resume Scorer,
                                        AI Interview and Roadmap Generator.
                                    </p>

                                </div>
                            </div>

                        </>
                    )}

                </div>

            </motion.nav>

            <div className='relative overflow-hidden'>
                <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(109,53,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(109,53,255,0.045)_1px,transparent_1px)] bg-[size:42px_42px]' />
                <div className='pointer-events-none absolute inset-x-0 top-0 h-[430px] bg-[#071123]' />
                <div className='pointer-events-none absolute inset-x-0 top-0 h-[430px] bg-[linear-gradient(120deg,rgba(109,53,255,0.22),transparent_42%),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:auto,36px_36px,36px_36px]' />

            <div className='relative mx-auto max-w-7xl px-4 py-8'>

                <div className='grid gap-5 pt-5 lg:grid-cols-[0.86fr_1.14fr] lg:items-end'>
                    <div>
                        <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-purple-100'>
                            <FiCpu size={12} />
                            AI Credit Engine
                        </div>
                        <h1 className="max-w-2xl text-3xl font-black leading-tight text-white sm:text-5xl">
                            Upgrade your interview prep capacity.
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                            Premium credits for scoring resumes, generating roadmaps, building ATS resumes, and running AI interviews across role-specific prep sessions.
                        </p>
                    </div>

                    <div className='grid gap-3 rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:grid-cols-3'>
                        <div className='rounded-2xl border border-white/10 bg-white/[0.08] p-3'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-purple-200'>
                                <GiTwoCoins />
                            </div>
                            <p className='mt-3 text-[10px] uppercase tracking-widest text-white/35'>Available</p>
                            <p className='text-2xl font-black'>{user?.interviewCoin ?? 0}</p>
                        </div>
                        <div className='rounded-2xl border border-white/10 bg-white/[0.08] p-3'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300'>
                                <FiShield />
                            </div>
                            <p className='mt-3 text-[10px] uppercase tracking-widest text-white/35'>Verified</p>
                            <p className='text-sm font-black'>Secure crediting</p>
                        </div>
                        <div className='rounded-2xl border border-white/10 bg-white/[0.08] p-3'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300'>
                                <FiZap />
                            </div>
                            <p className='mt-3 text-[10px] uppercase tracking-widest text-white/35'>Usage</p>
                            <p className='text-sm font-black'>10-50 coins</p>
                        </div>
                    </div>
                </div>

                <div className='mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
                    {plan.map((plan) => (
                        <PricingCard key={plan.title}
                            {...plan}
                            button={loadingPlan === plan.id ? "Starting payment..." : plan.button}
                            disabled={plan.disabled || Boolean(loadingPlan)}
                            onBuy={() => handlePayment(plan)} />
                    ))
                    }

                </div>

                <div className='mt-5 grid gap-3 rounded-3xl border border-white/80 bg-white/90 p-4 text-xs text-black/55 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl md:grid-cols-4'>
                    {[
                        ["Resume Builder", "10 coins"],
                        ["Resume Scorer", "10 coins"],
                        ["Roadmap Generator", "20 coins"],
                        ["AI Interview", "50 coins"],
                    ].map(([label, value]) => (
                        <div key={label} className='flex items-center justify-between rounded-2xl border border-[#6D35FF]/10 bg-[#F8F7FF] px-3 py-2.5'>
                            <span>{label}</span>
                            <span className='font-black text-[#6D35FF]'>{value}</span>
                        </div>
                    ))}
                </div>
            </div>
            </div>

        </div>
    )
}

export default Billing
