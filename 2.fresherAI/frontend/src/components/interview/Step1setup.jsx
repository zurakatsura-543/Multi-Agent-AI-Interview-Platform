import React, { useEffect, useMemo, useState } from 'react'
import { motion } from "motion/react"
import { FiArrowLeft, FiArrowRight, FiBriefcase, FiCheck, FiCheckCircle, FiCpu, FiFileText, FiMic, FiShield, FiUploadCloud, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useCoins } from '../../apis/user.api'
import api from '../../utils/axios'
import { setResume } from '../../redux/resumeSlice'
import { startInterview } from '../../apis/interview.api'
import BrandMark from '../BrandMark'

const ROLE_OPTIONS = [
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "AI/ML Engineer",
    "Data Analyst",
    "Data Scientist",
    "DevOps Engineer",
    "Product Manager",
    "Other",
];

function Step1setup({ user, setUser }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { resume } = useSelector((state) => state.resume)
    const [selectedRole, setSelectedRole] = useState(resume?.suggestedRole || "Backend Developer");
    const [customRole, setCustomRole] = useState("");
    const [type, setType] = useState("technical");
    const [useResume, setUseResume] = useState(Boolean(resume))
    const [modeTouched, setModeTouched] = useState(false)
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [starting, setStarting] = useState(false)
    const role = useMemo(() => selectedRole === "Other" ? customRole.trim() : selectedRole, [selectedRole, customRole]);
    const hasRagEvidence = Boolean(resume?.ragHybridMatches?.length || resume?.ragKeywordMatches?.length || resume?.ragVectorMatches?.length);

    useEffect(() => {
        if (resume && !modeTouched) {
            setUseResume(true)
        }
    }, [resume, modeTouched])

    const uploadResume = async () => {
        if (!file) {
            alert("Please select a PDF")
            return;
        }
        try {
            setUploading(true)
            try {
                const coinResponse = await useCoins({ coins: 10, action: "resume-scorer" })

                setUser((prev) => ({
                    ...prev, interviewCoin: coinResponse?.interviewCoin,
                }))
            } catch (error) {
                setUploading(false)
                alert(error?.response?.data?.message || "Failed to use coins.")
                return;
            }

            const formData = new FormData()
            formData.append("resume", file)

            const response = await api.post("/api/resume/upload", formData)

            dispatch(setResume(response?.data?.data))
            setUseResume(true)
            setModeTouched(true)
            setUploading(false)
            setFile(null)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.message || "Upload failed")
            setUploading(false)
        }
    }

    const start = async () => {
        if (!role) return;
        if (useResume && !resume) {
            alert("Upload or score your resume first to use resume-based interview questions.")
            return;
        }

        setStarting(true)
        try {
            const response = await startInterview({ role, type, useResume, resume: useResume ? resume : null })

            if (response) {
                try {
                    const coinResponse = await useCoins({ coins: 50, action: "start-interview" })

                    setUser((prev) => ({
                        ...prev, interviewCoin: coinResponse?.interviewCoin,
                    }))
                } catch (error) {
                    setStarting(false)
                    alert(error?.response?.data?.message || "Failed to use coins.")
                    return;
                }
            }

            navigate(`/interview/${response.interviewId}`)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.message || "Failed to start interview")
        } finally {
            setStarting(false)
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
                    <div onClick={() => navigate("/dashboard")} className='flex cursor-pointer items-center gap-1.5'>
                        <BrandMark />
                        <span className='hidden rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-black/50 sm:block'>Interview Studio</span>
                    </div>
                    <button onClick={() => navigate("/dashboard")} className='flex h-8 items-center gap-1.5 rounded-lg border border-black/10 px-2.5 text-xs font-semibold text-black/55 transition hover:border-[#6D35FF]/30 hover:text-[#251855]'>
                        <FiArrowLeft size={14} />
                        Dashboard
                    </button>
                </div>
            </motion.nav>

            <main className='relative min-h-[calc(100vh-3rem)] overflow-hidden bg-white'>
                <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-black/5' />

                <div className='relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 px-4 py-8 lg:grid-cols-[0.82fr_1.08fr] lg:py-10'>
                    <section className='text-[#071123]'>
                        <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-[#6D35FF]/15 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#6D35FF] shadow-sm backdrop-blur'>
                            <FiCpu size={13} />
                            AI Interview Agent
                        </div>
                        <h1 className='max-w-xl text-4xl font-black leading-tight sm:text-5xl'>
                            Create a sharper mock interview.
                        </h1>
                        <p className='mt-3 max-w-xl text-sm leading-6 text-[#647084]'>
                            Start with resume-personalized questions, then move into role-specific technical, coding, scenario, or HR questions with instant feedback.
                        </p>

                        <div className='mt-6 grid gap-2 sm:max-w-lg'>
                            {[
                                "Resume-first question strategy",
                                "Live speech capture and quick transcript",
                                "Technical, coding, scenario, and HR modes",
                                "Detailed feedback and performance report",
                            ].map((item) => (
                                <div key={item} className='flex items-center gap-2 rounded-xl border border-black/8 bg-white px-3 py-2.5 shadow-[0_8px_22px_rgba(15,23,42,0.04)]'>
                                    <FiCheck className='text-emerald-500' size={13} />
                                    <span className='text-xs font-medium text-[#48566A]'>{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className='mt-6 grid max-w-lg grid-cols-3 gap-2'>
                            {[
                                ["6", "questions"],
                                ["50", "coins"],
                                ["Live", "speech"],
                            ].map(([value, label]) => (
                                <div key={label} className='rounded-2xl border border-black/8 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.05)]'>
                                    <p className='text-lg font-black'>{value}</p>
                                    <p className='text-[10px] font-bold uppercase tracking-widest text-[#8A94A6]'>{label}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className='rounded-3xl border border-black/8 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.10)]'>
                        <div className='flex items-center justify-between border-b border-black/8 pb-4'>
                            <div>
                                <p className='text-[10px] font-black uppercase tracking-widest text-[#6D35FF]'>Interview Setup</p>
                                <h2 className='text-xl font-black'>Configure session</h2>
                            </div>
                            <span className='rounded-full bg-[#F1EDFF] px-2.5 py-1 text-[10px] font-black text-[#6D35FF]'>50 coins</span>
                        </div>

                        <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                            <div>
                                <label className='text-[10px] font-black uppercase tracking-widest text-black/45'>Target Role</label>
                                <div className='relative mt-1.5'>
                                    <FiBriefcase className='absolute left-3 top-1/2 -translate-y-1/2 text-black/30' size={14} />
                                    <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className='h-11 w-full rounded-xl border border-black/10 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#6D35FF] focus:ring-4 focus:ring-[#6D35FF]/10'>
                                        {ROLE_OPTIONS.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className='text-[10px] font-black uppercase tracking-widest text-black/45'>Interview Type</label>
                                <div className='mt-1.5 grid grid-cols-2 rounded-xl border border-[#DDD6FE] bg-[#F8F7FF] p-1'>
                                    {["technical", "hr"].map((item) => (
                                        <button key={item}
                                            onClick={() => setType(item)}
                                            className={`h-9 rounded-lg text-xs font-black capitalize transition-all ${type === item ? "bg-[#6D35FF] text-white shadow-[0_10px_24px_rgba(109,53,255,0.22)]" : "text-black/45 hover:text-[#251855]"}`}>
                                            {item === "hr" ? "HR" : "Technical"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedRole === "Other" && (
                                <div className='sm:col-span-2'>
                                    <label className='text-[10px] font-black uppercase tracking-widest text-black/45'>Custom Role</label>
                                    <input value={customRole} onChange={(e) => setCustomRole(e.target.value)} placeholder='Cloud Security Engineer' className='mt-1.5 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-[#6D35FF] focus:ring-4 focus:ring-[#6D35FF]/10' />
                                </div>
                            )}
                        </div>

                        <div className='mt-4 grid gap-2 rounded-2xl border border-black/8 bg-[#F9FAFB] p-2 sm:grid-cols-2'>
                            <button
                                type='button'
                                onClick={() => {
                                    if (!resume) {
                                        alert("Score or upload your resume first to enable resume-aware interview questions.")
                                        return;
                                    }
                                    setUseResume(true)
                                    setModeTouched(true)
                                }}
                                className={`rounded-xl border p-3 text-left transition ${useResume ? "border-emerald-200 bg-emerald-50 shadow-sm" : "border-transparent bg-white hover:border-[#DDD6FE]"}`}>
                                <div className='flex items-start justify-between gap-3'>
                                    <div className='flex items-start gap-3'>
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${useResume ? "bg-emerald-100 text-emerald-600" : "bg-[#F1EDFF] text-[#6D35FF]"}`}>
                                            <FiFileText />
                                        </div>
                                        <div>
                                            <p className='text-sm font-black'>Resume-aware</p>
                                            <p className='mt-0.5 text-xs leading-5 text-black/45'>
                                                {resume ? `Uses ${hasRagEvidence ? "RAG evidence" : "saved resume context"} for personalized questions.` : "Needs a scored or uploaded resume."}
                                            </p>
                                        </div>
                                    </div>
                                    {useResume && <FiCheckCircle className='mt-1 shrink-0 text-emerald-600' />}
                                </div>
                            </button>

                            <button
                                type='button'
                                onClick={() => {
                                    setUseResume(false)
                                    setModeTouched(true)
                                }}
                                className={`rounded-xl border p-3 text-left transition ${!useResume ? "border-[#DDD6FE] bg-white shadow-sm ring-4 ring-[#6D35FF]/8" : "border-transparent bg-white hover:border-[#DDD6FE]"}`}>
                                <div className='flex items-start justify-between gap-3'>
                                    <div className='flex items-start gap-3'>
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${!useResume ? "bg-[#F1EDFF] text-[#6D35FF]" : "bg-white text-black/35 ring-1 ring-black/10"}`}>
                                            <FiCpu />
                                        </div>
                                        <div>
                                            <p className='text-sm font-black'>General practice</p>
                                            <p className='mt-0.5 text-xs leading-5 text-black/45'>Role-based questions without using resume data.</p>
                                        </div>
                                    </div>
                                    {!useResume && <FiCheckCircle className='mt-1 shrink-0 text-[#6D35FF]' />}
                                </div>
                            </button>
                        </div>

                        {resume && useResume && (
                            <div className='mt-3 grid gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 sm:grid-cols-[0.75fr_1.7fr_0.55fr]'>
                                <div>
                                    <p className='text-[10px] font-black uppercase tracking-widest text-emerald-700/60'>Score</p>
                                    <p className='text-sm font-black text-emerald-800'>{resume?.matchScore || resume?.score || 0}/100</p>
                                </div>
                                <div>
                                    <p className='text-[10px] font-black uppercase tracking-widest text-emerald-700/60'>Role</p>
                                    <p className='break-words text-sm font-black leading-5 text-emerald-800'>{resume?.targetRole || resume?.suggestedRole || "Detected"}</p>
                                </div>
                                <div>
                                    <p className='text-[10px] font-black uppercase tracking-widest text-emerald-700/60'>Evidence</p>
                                    <p className='text-sm font-black text-emerald-800'>{hasRagEvidence ? "RAG" : "Resume"}</p>
                                </div>
                            </div>
                        )}

                        <div className='mt-4 rounded-2xl border-2 border-dashed border-black/10 bg-[#F9FAFB] p-4'>
                            <label className='flex cursor-pointer flex-col items-center text-center'>
                                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1EDFF] text-[#6D35FF] ring-1 ring-[#DDD6FE]'><FiUploadCloud size={20} /></div>
                                <h3 className='mt-3 text-sm font-black text-[#071123]'>Upload Resume</h3>
                                <p className='mt-1 max-w-sm text-xs leading-5 text-black/45'>
                                    {resume
                                        ? "Resume detected. Upload a new resume anytime to refresh personalized interview questions."
                                        : "Upload your resume to generate the first questions around your real projects, skills, and gaps."
                                    }
                                </p>
                                <input type="file" className='hidden' accept='.pdf' onChange={(e) => { if (e.target.files[0]) setFile(e.target.files[0]) }} />
                            </label>

                            {file && (
                                <div className='mt-4'>
                                    <div className='rounded-xl border border-black/8 bg-white p-2.5'>
                                        <p className='truncate text-xs text-black/55'>{file.name}</p>
                                    </div>

                                    <button
                                        onClick={uploadResume}
                                        disabled={uploading}
                                        className='mt-3 h-10 w-full rounded-xl bg-[#6D35FF] text-sm font-black text-white shadow-[0_12px_26px_rgba(109,53,255,0.22)] transition hover:bg-[#5B2BE0] disabled:opacity-60'>
                                        {uploading ? "Uploading resume..." : "Analyze Resume"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className='mt-4 grid gap-2 sm:grid-cols-3'>
                            {[
                                [FiMic, "Voice-ready", "Fast transcript"],
                                [FiShield, "Structured", "6 question flow"],
                                [FiZap, "Instant", "Feedback after each answer"],
                            ].map(([Icon, title, desc]) => (
                                <div key={title} className='rounded-2xl border border-black/8 bg-[#F8F7FF] p-3'>
                                    <Icon className='text-[#6D35FF]' size={16} />
                                    <p className='mt-2 text-xs font-black'>{title}</p>
                                    <p className='mt-0.5 text-[11px] text-black/40'>{desc}</p>
                                </div>
                            ))}
                        </div>

                        <motion.button
                            onClick={start}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={!role || starting || (useResume && !resume)}
                            className='mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#071123] text-sm font-black text-white shadow-[0_16px_38px_rgba(7,17,35,0.18)] transition hover:bg-[#251855] disabled:cursor-not-allowed disabled:opacity-45'>
                            {starting ? "Starting Interview..." : (
                                <>Start Interview <FiArrowRight size={15} /></>
                            )}
                        </motion.button>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default Step1setup
