import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react"
import { useEffect, useState } from 'react'
import { FiAlertCircle, FiBriefcase, FiCheckCircle, FiClock, FiFileText, FiSearch, FiTarget, FiTrendingUp, FiUploadCloud, FiUser, FiZap } from 'react-icons/fi'
import api from '../utils/axios'
import { useDispatch, useSelector } from 'react-redux'
import { setResume } from '../redux/resumeSlice'
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"
import { useCoins } from '../apis/user.api'
import BrandMark from '../components/BrandMark'
import { getResumeEvaluations } from '../apis/resume.api'

const ROLE_OPTIONS = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "AI/ML Engineer",
    "Data Scientist",
    "UI/UX Designer",
    "DevOps Engineer",
    "Other",
]

const EXPERIENCE_OPTIONS = [
    "Fresher / 0 years",
    "1+ years",
    "2+ years",
    "3+ years",
    "4+ years",
    "5+ years",
    "7+ years",
    "10+ years",
]

const ScoreRing = ({ score }) => {
    const color = score >= 75 ? "#7c3aed" : score >= 50 ? "#f59e0b" : "#ef4444";
    return (
        <div className='relative flex items-center justify-center'>
            <RadialBarChart
                width={110}
                height={110}
                cx={55}
                cy={55}
                innerRadius={40}
                outerRadius={53}
                startAngle={90}
                endAngle={-270}
                data={[{ value: score, fill: color }]}
                barSize={8}
            >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: "#e5e7eb" }} dataKey="value" cornerRadius={8} />

            </RadialBarChart>

            <div className='absolute flex  items-center'>
                <span className='text-lg font-bold text-white leading-none'>{score}</span>
                <span className='text-[9px] text-gray-200 mt-0.5'>/100</span>
            </div>

        </div>
    )
}

const Tag = ({ text, color }) => {
    const styles = {
        purple: "bg-purple-50 text-purple-700 border-purple-200",
        red: "bg-red-50    text-red-700    border-red-200",
        green: "bg-green-50  text-green-700  border-green-200",
        yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
        blue: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return (
        <div className={`text-[10px] px-1.5 py-1 rounded-md border font-medium ${styles[color]}`}>
            {text}

        </div>
    )
}

const EvidenceCard = ({ match, index }) => (
    <motion.div
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.05 + index * 0.04 }}
        className='rounded-2xl border border-black/8 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
                <span className='flex h-8 w-8 items-center justify-center rounded-xl bg-[#F1EDFF] text-[#6D35FF]'>
                    <FiSearch size={14} />
                </span>
                <div>
                    <p className='text-xs font-black text-[#071123]'>Evidence Match #{index + 1}</p>
                    <p className='text-[10px] text-black/40'>BM25 keyword retrieval</p>
                </div>
            </div>
            <span className='rounded-full border border-[#DDD6FE] bg-[#F8F7FF] px-2.5 py-1 text-[10px] font-black text-[#6D35FF]'>
                score {match.score}
            </span>
        </div>

        <div className='grid gap-3 lg:grid-cols-2'>
            <div className='rounded-xl border border-black/8 bg-[#F8F9FA] p-3'>
                <div className='mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black/45'>
                    <FiTarget size={11} /> JD Evidence · {match.querySection}
                </div>
                <p className='text-xs leading-5 text-[#48566A]'>{match.queryText}</p>
            </div>
            <div className='rounded-xl border border-emerald-200 bg-emerald-50 p-3'>
                <div className='mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700/60'>
                    <FiFileText size={11} /> Resume Evidence · {match.resumeSection}
                </div>
                <p className='text-xs leading-5 text-emerald-950/75'>{match.resumeText}</p>
            </div>
        </div>

        {!!match.matchedTerms?.length && (
            <div className='mt-3 flex flex-wrap gap-1.5'>
                {match.matchedTerms.map((term) => (
                    <Tag key={`${match.resumeChunkId}-${term}`} text={term} color="blue" />
                ))}
            </div>
        )}
    </motion.div>
)

const VectorEvidenceCard = ({ match, index }) => (
    <motion.div
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.05 + index * 0.04 }}
        className='rounded-2xl border border-[#C4B5FD] bg-white p-4 shadow-[0_10px_30px_rgba(109,53,255,0.06)]'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
                <span className='flex h-8 w-8 items-center justify-center rounded-xl bg-[#F1EDFF] text-[#6D35FF]'>
                    <FiZap size={14} />
                </span>
                <div>
                    <p className='text-xs font-black text-[#071123]'>Semantic Match #{index + 1}</p>
                    <p className='text-[10px] text-black/40'>{match.embeddingProvider || "vector"} · {match.embeddingModel || "embedding"}</p>
                </div>
            </div>
            <span className='rounded-full border border-[#DDD6FE] bg-[#F8F7FF] px-2.5 py-1 text-[10px] font-black text-[#6D35FF]'>
                similarity {match.similarity}
            </span>
        </div>

        <div className='grid gap-3 lg:grid-cols-2'>
            <div className='rounded-xl border border-black/8 bg-[#F8F9FA] p-3'>
                <div className='mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black/45'>
                    <FiTarget size={11} /> JD Meaning · {match.querySection}
                </div>
                <p className='text-xs leading-5 text-[#48566A]'>{match.queryText}</p>
            </div>
            <div className='rounded-xl border border-[#DDD6FE] bg-[#FBFAFF] p-3'>
                <div className='mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#6D35FF]/65'>
                    <FiFileText size={11} /> Resume Meaning · {match.resumeSection}
                </div>
                <p className='text-xs leading-5 text-[#251855]/75'>{match.resumeText}</p>
            </div>
        </div>
    </motion.div>
)

const HybridEvidenceCard = ({ match, index }) => (
    <motion.div
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.05 + index * 0.04 }}
        className='rounded-2xl border border-[#DDD6FE] bg-[#FBFAFF] p-4 shadow-[0_12px_34px_rgba(109,53,255,0.08)]'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
                <span className='flex h-8 w-8 items-center justify-center rounded-xl bg-[#6D35FF] text-white shadow-[0_8px_18px_rgba(109,53,255,0.24)]'>
                    <FiTrendingUp size={14} />
                </span>
                <div>
                    <p className='text-xs font-black text-[#071123]'>Hybrid Evidence #{index + 1}</p>
                    <p className='text-[10px] text-black/40'>BM25 keywords + vector semantic ranking</p>
                </div>
            </div>
            <div className='flex flex-wrap items-center gap-1.5'>
                {(match.retrievalSignals || []).map((signal) => (
                    <span key={signal} className='rounded-full border border-[#DDD6FE] bg-white px-2 py-1 text-[10px] font-black capitalize text-[#6D35FF]'>
                        {signal}
                    </span>
                ))}
                <span className='rounded-full bg-[#071123] px-2.5 py-1 text-[10px] font-black text-white'>
                    hybrid {match.hybridScore}
                </span>
            </div>
        </div>

        <div className='mb-3 grid grid-cols-3 gap-2 text-center'>
            <div className='rounded-xl border border-black/8 bg-white px-3 py-2'>
                <p className='text-[10px] text-black/35'>BM25</p>
                <p className='text-xs font-black text-[#251855]'>{match.keywordScore || 0}</p>
            </div>
            <div className='rounded-xl border border-black/8 bg-white px-3 py-2'>
                <p className='text-[10px] text-black/35'>Semantic</p>
                <p className='text-xs font-black text-[#251855]'>{match.vectorSimilarity || 0}</p>
            </div>
            <div className='rounded-xl border border-black/8 bg-white px-3 py-2'>
                <p className='text-[10px] text-black/35'>Keyword Norm</p>
                <p className='text-xs font-black text-[#251855]'>{match.normalizedKeywordScore || 0}</p>
            </div>
        </div>

        <div className='grid gap-3 lg:grid-cols-2'>
            <div className='rounded-xl border border-black/8 bg-white p-3'>
                <div className='mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black/45'>
                    <FiTarget size={11} /> JD Evidence · {match.querySection}
                </div>
                <p className='text-xs leading-5 text-[#48566A]'>{match.queryText}</p>
            </div>
            <div className='rounded-xl border border-[#DDD6FE] bg-white p-3'>
                <div className='mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#6D35FF]/65'>
                    <FiFileText size={11} /> Resume Evidence · {match.resumeSection}
                </div>
                <p className='text-xs leading-5 text-[#251855]/75'>{match.resumeText}</p>
            </div>
        </div>

        {!!match.matchedTerms?.length && (
            <div className='mt-3 flex flex-wrap gap-1.5'>
                {match.matchedTerms.map((term) => (
                    <Tag key={`${match.resumeChunkId}-${term}`} text={term} color="blue" />
                ))}
            </div>
        )}
    </motion.div>
)

const Navbar = ({ label }) => {
    const navigate = useNavigate()
    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className='fixed inset-x-0 top-0 z-20 border-b border-black/8 bg-white/80 backdrop-blur-xl'>
            <div className='mx-auto flex h-12 max-w-7xl items-center justify-start px-3 sm:px-5'>
                <div onClick={() => navigate("/dashboard")}
                    className='flex cursor-pointer items-center gap-1.5'>
                    <BrandMark />
                    <span className='hidden rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-black/50 sm:block'>{label}</span>
                </div>

            </div>

        </motion.nav>

    )
}

function Scorer({ user, setUser }) {
    const [file, setFile] = useState(null)
    const [selectedRole, setSelectedRole] = useState("Frontend Developer")
    const [customRole, setCustomRole] = useState("")
    const [requiredExperience, setRequiredExperience] = useState("Fresher / 0 years")
    const [jobDescription, setJobDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [restoringResume, setRestoringResume] = useState(true)
    const [savedEvaluations, setSavedEvaluations] = useState([])
    const dispatch = useDispatch()
    const { resume } = useSelector((state) => state.resume)
    const targetJobTitle = selectedRole === "Other" ? customRole.trim() : selectedRole

    useEffect(() => {
        let isMounted = true

        const restoreSavedResume = async () => {
            const response = await getResumeEvaluations()

            if (!isMounted) return

            if (response?.success && Array.isArray(response?.data)) {
                setSavedEvaluations(response.data)
            }

            setRestoringResume(false)
        }

        restoreSavedResume()

        return () => {
            isMounted = false
        }
    }, [dispatch])

    const uploadResume = async () => {
        if (!file) {
            alert("Please select a PDF")
            return;
        }
        if (!targetJobTitle) {
            alert("Please select or enter target job title")
            return;
        }
        if (!jobDescription.trim()) {
            alert("Please paste the job description")
            return;
        }
        try {
            setLoading(true)

            try {
                const coinResponse = await useCoins({ coins: 10, action: "resume-scorer" })
                setUser((prev) => ({
                    ...prev, interviewCoin: coinResponse?.interviewCoin,
                }))
            } catch (error) {
                setLoading(false)
                alert("Failed to use coins.")
                return;
            }

            const formData = new FormData()
            formData.append("resume", file)
            formData.append("jobTitle", targetJobTitle)
            formData.append("jobDescription", jobDescription.trim())
            formData.append("requiredExperience", requiredExperience)

            const response = await api.post("/api/resume/upload", formData)

            dispatch(setResume(response?.data?.data))
            setSavedEvaluations((prev) => [response?.data?.data, ...prev.filter((item) => item?._id !== response?.data?.data?._id)])
            setLoading(false)



        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.message || "Upload failed")
            setLoading(false)
        }
    }
    // scorer section
    const displayScore = resume?.matchScore || resume?.score || 0
    const targetRole = resume?.targetRole || resume?.jobTitle || resume?.suggestedRole
    const ragMatches = resume?.ragKeywordMatches || []
    const ragStats = resume?.ragRetrievalStats || {}
    const vectorMatches = resume?.ragVectorMatches || []
    const vectorStats = resume?.ragVectorStats || {}
    const hybridMatches = resume?.ragHybridMatches || []
    const hybridStats = resume?.ragHybridStats || {}

    const openEvaluation = (evaluation) => {
        dispatch(setResume(evaluation))
        setSelectedRole(evaluation.jobTitle || evaluation.targetRole || evaluation.suggestedRole || "Frontend Developer")
        setRequiredExperience(evaluation.requiredExperience || "Fresher / 0 years")
        setJobDescription(evaluation.jobDescription || "")
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const backToUpload = () => {
        dispatch(setResume(null))
        setFile(null)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    if (restoringResume) return (
        <div className='min-h-screen bg-[#F6F7FB] text-[#071123]'>
            <Navbar label="Resume Scorer" />
            <section className='flex min-h-screen items-center justify-center px-3 pt-18 pb-6'>
                <div className='rounded-3xl border border-[#6D35FF]/15 bg-white px-8 py-7 text-center shadow-[0_18px_60px_rgba(37,24,85,0.12)]'>
                    <div className='mx-auto mb-4 h-10 w-10 animate-pulse rounded-2xl bg-[#F1EDFF]' />
                    <p className='text-sm font-black text-[#071123]'>Loading saved resume evaluation</p>
                    <p className='mt-1 text-xs text-black/45'>Checking your latest RAG-backed scorer result...</p>
                </div>
            </section>
        </div>
    )

    if (resume) return (
        <div className='min-h-screen bg-[#F6F7FB] text-[#071123]'>
            <Navbar label="Resume Scorer" />

            <section className='max-w-6xl mx-auto px-3 pt-18 sm:pt-20 pb-8 space-y-3.5'>
                {/* header */}
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                        <p className='text-[10px] text-black/40 tracking-widest uppercase mb-0.5'>Targeted Resume Analysis</p>
                        <h2 className='text-lg font-bold'>{resume?.name}</h2>
                        <p className='mt-1 text-xs text-black/45'>Matched against: <span className='font-semibold text-[#251855]'>{targetRole}</span></p>

                    </div>
                    <button onClick={backToUpload}
                        className='text-[10px] sm:text-xs text-black/50 hover:text-[#0A0A0A] border border-black/15 hover:border-black/35 px-2.5 py-1 rounded-lg transition-colors'>Back to Upload</button>
                </div>

                {/* Score */}

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className='relative overflow-hidden bg-[#071123] backdrop-blur-2xl border border-[#6D35FF]/20 rounded-2xl p-4 flex flex-col items-center gap-4 sm:flex-row shadow-[0_18px_48px_rgba(37,24,85,0.22)]'>
                    <div className='absolute inset-x-0 top-0 h-px bg-[#8B5CF6]/70 pointer-events-none' />

                    <div className='relative'>
                        <ScoreRing score={displayScore} />

                    </div>
                    <div className='relative flex-1'>
                        <p className='text-white/50 text-xs mb-0.5'>Job Match Score</p>
                        <p className='text-lg sm:text-xl font-bold mb-1.5 text-white'>
                            {displayScore >= 75 ? "Strong Fit" : displayScore >= 50 ? "Partial Fit" : "Needs Targeting"}
                        </p>
                        <div className='flex items-center gap-1.5'>
                            <FiUser className='text-purple-400 text-xs' />
                            <span className='text-xs text-purple-300'>{targetRole}</span>
                        </div>
                        {resume?.ragScoringMode && (
                            <div className='mt-2 flex flex-wrap items-center gap-1.5'>
                                <span className='rounded-full border border-purple-400/30 bg-purple-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-purple-100'>
                                    Hybrid RAG grounded
                                </span>
                                <span className='text-[10px] text-white/40'>
                                    {resume?.ragScoringEvidenceCount || 0} evidence pairs used for scoring
                                </span>
                            </div>
                        )}
                        {resume?.roleFitSummary && (
                            <p className='mt-3 max-w-3xl text-xs leading-5 text-white/55'>{resume.roleFitSummary}</p>
                        )}
                        {resume?.experienceFitSummary && (
                            <p className='mt-2 max-w-3xl text-xs leading-5 text-purple-100/70'>{resume.experienceFitSummary}</p>
                        )}

                    </div>

                </motion.div >

                <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.06 }}
                        className='rounded-2xl border border-black/8 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'>
                        <div className='flex items-center gap-2'>
                            <FiTarget className='text-[#6D35FF]' size={15} />
                            <p className='text-xs font-bold text-[#071123]'>Target Role</p>
                        </div>
                        <p className='mt-2 text-sm font-black text-[#251855]'>{targetRole || "Not specified"}</p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.08 }}
                        className='rounded-2xl border border-black/8 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'>
                        <div className='flex items-center gap-2'>
                            <FiBriefcase className='text-[#6D35FF]' size={15} />
                            <p className='text-xs font-bold text-[#071123]'>Suggested Role</p>
                        </div>
                        <p className='mt-2 text-sm font-black text-[#251855]'>{resume?.suggestedRole || "General candidate"}</p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.09 }}
                        className='rounded-2xl border border-black/8 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'>
                        <div className='flex items-center gap-2'>
                            <FiClock className='text-[#6D35FF]' size={15} />
                            <p className='text-xs font-bold text-[#071123]'>Experience Fit</p>
                        </div>
                        <p className='mt-2 text-sm font-black text-[#251855]'>{resume?.candidateExperience || "Not detected"}</p>
                        <p className='mt-1 text-[10px] text-black/40'>Required: {resume?.requiredExperience || "Not specified"}</p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className='rounded-2xl border border-black/8 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'>
                        <div className='flex items-center gap-2'>
                            <FiCheckCircle className='text-[#6D35FF]' size={15} />
                            <p className='text-xs font-bold text-[#071123]'>ATS Score</p>
                        </div>
                        <p className='mt-2 text-sm font-black text-[#251855]'>{resume?.score || 0}/100</p>
                    </motion.div>
                </div>

                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.11 }}
                        className='rounded-2xl border border-black/8 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'>
                        <div className='flex items-center gap-1.5 mb-2.5'>
                            <FiCheckCircle className='text-green-500' size={14} />
                            <span className='text-xs font-semibold text-[#071123]'>JD Keyword Matches</span>
                        </div>
                        <div className='flex flex-wrap gap-1.5'>
                            {(resume?.keywordMatches?.length ? resume.keywordMatches : ["No strong matches found"]).map(s => <Tag key={s} text={s} color="green" />)}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.12 }}
                        className='rounded-2xl border border-black/8 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'>
                        <div className='flex items-center gap-1.5 mb-2.5'>
                            <FiZap className='text-red-500' size={14} />
                            <span className='text-xs font-semibold text-[#071123]'>JD Keyword Gaps</span>
                        </div>
                        <div className='flex flex-wrap gap-1.5'>
                            {(resume?.keywordGaps?.length ? resume.keywordGaps : resume?.missingSkills || []).map(s => <Tag key={s} text={s} color="red" />)}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.125 }}
                    className='rounded-2xl border border-[#DDD6FE] bg-white p-4 shadow-[0_12px_34px_rgba(109,53,255,0.08)]'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                        <div>
                            <div className='flex items-center gap-2'>
                                <FiTrendingUp className='text-[#6D35FF]' size={15} />
                                <h3 className='text-sm font-black text-[#071123]'>Hybrid Evidence Ranking</h3>
                            </div>
                            <p className='mt-1 max-w-2xl text-xs leading-5 text-black/45'>
                                Final retrieval ranking combines semantic similarity with BM25 keyword evidence, so exact skills and related meaning both influence the match.
                            </p>
                        </div>
                        <div className='grid grid-cols-4 gap-2 text-center'>
                            <div className='rounded-xl border border-black/8 bg-[#F8F9FA] px-3 py-2'>
                                <p className='text-[10px] text-black/35'>Keyword</p>
                                <p className='text-xs font-black text-[#251855]'>{Math.round((hybridStats.keywordWeight || 0) * 100)}%</p>
                            </div>
                            <div className='rounded-xl border border-black/8 bg-[#F8F9FA] px-3 py-2'>
                                <p className='text-[10px] text-black/35'>Vector</p>
                                <p className='text-xs font-black text-[#251855]'>{Math.round((hybridStats.vectorWeight || 0) * 100)}%</p>
                            </div>
                            <div className='rounded-xl border border-black/8 bg-[#F8F9FA] px-3 py-2'>
                                <p className='text-[10px] text-black/35'>Latency</p>
                                <p className='text-xs font-black text-[#251855]'>{hybridStats.latencyMs ?? 0}ms</p>
                            </div>
                            <div className='rounded-xl border border-black/8 bg-[#F8F9FA] px-3 py-2'>
                                <p className='text-[10px] text-black/35'>Matches</p>
                                <p className='text-xs font-black text-[#251855]'>{hybridStats.returned ?? hybridMatches.length}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {hybridMatches.length > 0 ? (
                    <div className='grid grid-cols-1 gap-3'>
                        {hybridMatches.slice(0, 5).map((match, index) => (
                            <HybridEvidenceCard key={`${match.queryChunkId}-${match.resumeChunkId}-${index}`} match={match} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className='rounded-2xl border border-black/8 bg-white p-4 text-xs text-black/45 shadow-[0_10px_30px_rgba(15,23,42,0.05)]'>
                        No hybrid evidence stored yet. Re-upload a resume with a job description to generate combined keyword + semantic rankings.
                    </div>
                )}

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.13 }}
                    className='rounded-2xl border border-[#DDD6FE] bg-[#FBFAFF] p-4 shadow-[0_10px_30px_rgba(109,53,255,0.06)]'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                        <div>
                            <div className='flex items-center gap-2'>
                                <FiSearch className='text-[#6D35FF]' size={15} />
                                <h3 className='text-sm font-black text-[#071123]'>RAG Keyword Evidence</h3>
                            </div>
                            <p className='mt-1 max-w-2xl text-xs leading-5 text-black/45'>
                                BM25 retrieval compares job-description chunks against resume chunks and surfaces the strongest grounded evidence behind the match.
                            </p>
                        </div>
                        <div className='grid grid-cols-3 gap-2 text-center'>
                            <div className='rounded-xl border border-black/8 bg-white px-3 py-2'>
                                <p className='text-[10px] text-black/35'>Resume</p>
                                <p className='text-sm font-black text-[#251855]'>{ragStats.corpusChunks ?? resume?.ragStats?.resumeChunks ?? 0}</p>
                            </div>
                            <div className='rounded-xl border border-black/8 bg-white px-3 py-2'>
                                <p className='text-[10px] text-black/35'>JD</p>
                                <p className='text-sm font-black text-[#251855]'>{ragStats.queryChunks ?? resume?.ragStats?.jdChunks ?? 0}</p>
                            </div>
                            <div className='rounded-xl border border-black/8 bg-white px-3 py-2'>
                                <p className='text-[10px] text-black/35'>Matches</p>
                                <p className='text-sm font-black text-[#251855]'>{ragStats.returned ?? ragMatches.length}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {ragMatches.length > 0 ? (
                    <div className='grid grid-cols-1 gap-3'>
                        {ragMatches.slice(0, 5).map((match, index) => (
                            <EvidenceCard key={`${match.queryChunkId}-${match.resumeChunkId}-${index}`} match={match} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className='rounded-2xl border border-black/8 bg-white p-4 text-xs text-black/45 shadow-[0_10px_30px_rgba(15,23,42,0.05)]'>
                        No keyword evidence stored yet. Re-upload a resume with a job description to generate RAG chunks and BM25 matches.
                    </div>
                )}

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className='rounded-2xl border border-[#DDD6FE] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                        <div>
                            <div className='flex items-center gap-2'>
                                <FiZap className='text-[#6D35FF]' size={15} />
                                <h3 className='text-sm font-black text-[#071123]'>Vector Semantic Evidence</h3>
                            </div>
                            <p className='mt-1 max-w-2xl text-xs leading-5 text-black/45'>
                                Embeddings compare the meaning of JD chunks and resume chunks, catching relevant matches even when the wording is different.
                            </p>
                        </div>
                        <div className='grid grid-cols-3 gap-2 text-center'>
                            <div className='rounded-xl border border-black/8 bg-[#F8F9FA] px-3 py-2'>
                                <p className='text-[10px] text-black/35'>Provider</p>
                                <p className='text-xs font-black text-[#251855]'>{vectorStats.provider || "none"}</p>
                            </div>
                            <div className='rounded-xl border border-black/8 bg-[#F8F9FA] px-3 py-2'>
                                <p className='text-[10px] text-black/35'>Latency</p>
                                <p className='text-xs font-black text-[#251855]'>{vectorStats.latencyMs ?? 0}ms</p>
                            </div>
                            <div className='rounded-xl border border-black/8 bg-[#F8F9FA] px-3 py-2'>
                                <p className='text-[10px] text-black/35'>Matches</p>
                                <p className='text-xs font-black text-[#251855]'>{vectorStats.returned ?? vectorMatches.length}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {vectorMatches.length > 0 ? (
                    <div className='grid grid-cols-1 gap-3'>
                        {vectorMatches.slice(0, 5).map((match, index) => (
                            <VectorEvidenceCard key={`${match.queryChunkId}-${match.resumeChunkId}-${index}`} match={match} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className='rounded-2xl border border-black/8 bg-white p-4 text-xs text-black/45 shadow-[0_10px_30px_rgba(15,23,42,0.05)]'>
                        No vector evidence stored yet. Re-upload a resume with a job description to generate embedding-based semantic matches.
                    </div>
                )}

                {/* Weaknesses & Strengths */}
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>


                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.07 }}
                        className='relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4  sm:flex-row shadow-[0_8px_32px_rgba(0,0,0,0.2)]'>
                        <div className='absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none' />
                        <div className='relative flex items-center gap-1.5 mb-2.5'>
                            <FiAlertCircle className='text-green-400' size={14} />
                            <span className='text-xs font-semibold text-white'>Strengths</span>
                        </div>



                        <div className='relative flex flex-wrap gap-1.5'>

                            {resume?.strengths?.map(s => <Tag key={s} text={s} color="green" />)}

                        </div>

                    </motion.div>


                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.07 }}
                        className='relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4  sm:flex-row shadow-[0_8px_32px_rgba(0,0,0,0.2)]'>
                        <div className='absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none' />
                        <div className='relative flex items-center gap-1.5 mb-2.5'>
                            <FiAlertCircle className='text-yellow-400' size={14} />
                            <span className='text-xs font-semibold text-white'>Weaknesses</span>
                        </div>

                        <div className='relative flex flex-wrap gap-1.5'>

                            {resume?.weaknesses?.map(s => <Tag key={s} text={s} color="yellow" />)}

                        </div>

                    </motion.div>

                </div>

                {/* Missing Skills */}

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.09 }}
                    className='relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4  sm:flex-row shadow-[0_8px_32px_rgba(0,0,0,0.2)]'>
                    <div className='absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none' />
                    <div className='relative flex items-center gap-1.5 mb-2.5'>
                        <FiZap className='text-red-400' size={14} />
                        <span className='text-xs font-semibold text-white'>Missing Skills</span>
                    </div>

                    <div className='relative flex flex-wrap gap-1.5'>

                        {resume?.missingSkills?.map(s => <Tag key={s} text={s} color="red" />)}

                    </div>

                </motion.div>
                {/* Recommendations */}

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.12 }}
                    className='relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4  sm:flex-row shadow-[0_8px_32px_rgba(0,0,0,0.2)]'>
                    <div className='absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none' />
                    <div className='relative flex items-center gap-1.5 mb-2.5'>
                        <FiTrendingUp className='text-purple-400' size={14} />
                        <span className='text-xs font-semibold text-white'>Recommendations</span>
                    </div>

                    <div className='relative flex flex-wrap gap-1.5'>

                        {resume?.recommendations?.map(s => <Tag key={s} text={s} color="purple" />)}

                    </div>

                </motion.div>



            </section>

        </div>
    )
    //upload section
    return (
        <div className='min-h-screen bg-[#F6F7FB] text-[#071123]'>
            <Navbar label="Resume Scorer" />


            <section className='flex min-h-screen items-center justify-center px-3 pt-18 pb-6'>

                <motion.div
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className='relative w-full max-w-5xl overflow-hidden rounded-3xl border border-[#6D35FF]/20 bg-white shadow-[0_18px_60px_rgba(37,24,85,0.12)]'>
                    <div className='grid lg:grid-cols-[0.9fr_1.1fr]'>
                        <div className='relative overflow-hidden bg-[#071123] p-5 text-white sm:p-7'>
                            <div className='absolute inset-x-0 top-0 h-px bg-[#8B5CF6]/70' />
                            <p className='text-[10px] text-white/40 tracking-widest uppercase mb-2'>Targeted ATS Match</p>

                            <h2 className='text-2xl font-black leading-tight'>
                                Score your resume against a real job.
                            </h2>
                            <p className='mt-3 text-xs leading-6 text-white/55'>
                                Add the job title and paste the job description. HireGen-AI will compare your resume against role requirements, extract keyword gaps, and generate targeted improvement actions.
                            </p>

                            <div className='mt-6 grid gap-2'>
                                {[
                                    "Job-specific match score",
                                    "JD keyword matches and gaps",
                                    "Experience gap analysis",
                                    "ATS score and role-fit summary",
                                    "Actionable resume improvements",
                                ].map((item) => (
                                    <div key={item} className='flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2'>
                                        <FiCheckCircle className='text-[#8B5CF6]' size={14} />
                                        <span className='text-xs text-white/70'>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='p-5 sm:p-7'>
                            <div className='mb-5'>
                                <div className='flex items-center justify-between mb-1.5'>
                                    <p className='text-[10px] text-black/40 font-bold uppercase tracking-widest'>Step 1 of 2</p>
                                    <p className='text-[10px] text-black/35'>10 coins</p>
                                </div>
                                <div className='h-1.5 overflow-hidden rounded-full bg-black/8'>
                                    <div className={`h-full rounded-full bg-[#6D35FF] transition-all ${file && targetJobTitle && jobDescription ? "w-full" : "w-1/2"}`} />
                                </div>
                            </div>

                            <div className='space-y-3'>
                                <div>
                                    <label className='text-[10px] font-bold uppercase tracking-widest text-black/55'>Target Role</label>
                                    <div className='relative mt-1.5'>
                                        <FiBriefcase className='absolute left-3 top-1/2 -translate-y-1/2 text-black/30' size={14} />
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className='h-11 w-full appearance-none rounded-xl border border-black/12 bg-white pl-9 pr-9 text-sm outline-none transition-all focus:border-[#6D35FF] focus:ring-4 focus:ring-[#6D35FF]/10'>
                                            {ROLE_OPTIONS.map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {selectedRole === "Other" && (
                                        <input
                                            value={customRole}
                                            onChange={(e) => setCustomRole(e.target.value)}
                                            placeholder='Type your target role'
                                            className='mt-2 h-11 w-full rounded-xl border border-black/12 bg-white px-3 text-sm outline-none transition-all focus:border-[#6D35FF] focus:ring-4 focus:ring-[#6D35FF]/10'
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className='text-[10px] font-bold uppercase tracking-widest text-black/55'>Required Experience From JD</label>
                                    <div className='relative mt-1.5'>
                                        <FiClock className='absolute left-3 top-1/2 -translate-y-1/2 text-black/30' size={14} />
                                        <select
                                            value={requiredExperience}
                                            onChange={(e) => setRequiredExperience(e.target.value)}
                                            className='h-11 w-full appearance-none rounded-xl border border-black/12 bg-white pl-9 pr-9 text-sm outline-none transition-all focus:border-[#6D35FF] focus:ring-4 focus:ring-[#6D35FF]/10'>
                                            {EXPERIENCE_OPTIONS.map((experience) => (
                                                <option key={experience} value={experience}>{experience}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className='text-[10px] font-bold uppercase tracking-widest text-black/55'>Job Description</label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder='Paste responsibilities, required skills, qualifications, tools, and experience from the job post...'
                                        rows={6}
                                        className='mt-1.5 w-full resize-none rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-[#6D35FF] focus:ring-4 focus:ring-[#6D35FF]/10'
                                    />
                                </div>

                                <label className={`relative flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed cursor-pointer transition-colors
                                    ${file
                                        ? "border-[#6D35FF]/60 bg-[#F8F7FF]"
                                        : "border-black/12 bg-[#F8F9FA] hover:border-[#6D35FF]/45"
                                    }`}>
                                    <FiUploadCloud className={`text-4xl mb-2.5 ${file ? "text-[#6D35FF]" : "text-black/25"}`} />
                                    <p className="text-xs font-semibold text-[#071123]/75">
                                        {file ? file.name : "Upload resume PDF"}
                                    </p>
                                    <p className="text-[10px] text-black/35 mt-1">PDF only · Max 20MB</p>

                                    <input type='file'
                                        accept='.pdf'
                                        className='hidden'
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                </label>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={uploadResume}
                                    disabled={!file || !targetJobTitle || !jobDescription.trim() || loading}
                                    className='relative mt-1 w-full h-11 rounded-xl font-bold text-xs bg-[#0B1630] text-white shadow-[0_8px_24px_rgba(109,53,255,0.22)] hover:bg-[#251855] disabled:opacity-40 disabled:cursor-not-allowed transition-all'>
                                    {loading ? "Analyzing role match..." : "Analyze Resume Match"}

                                </motion.button>
                            </div>
                        </div>
                    </div>


                </motion.div>

                {savedEvaluations.length > 0 && (
                    <section className='mt-6 rounded-3xl border border-black/8 bg-white p-4 shadow-[0_14px_44px_rgba(15,23,42,0.06)]'>
                        <div className='mb-3 flex items-center justify-between'>
                            <div>
                                <p className='text-[10px] font-black uppercase tracking-widest text-[#6D35FF]'>Saved Evaluations</p>
                                <h3 className='text-base font-black text-[#071123]'>Open previous resume scores</h3>
                            </div>
                            <span className='rounded-full bg-[#F1EDFF] px-2.5 py-1 text-[10px] font-black text-[#6D35FF]'>{savedEvaluations.length} saved</span>
                        </div>

                        <div className='grid gap-2'>
                            {savedEvaluations.map((evaluation, index) => {
                                const evaluationScore = evaluation?.matchScore || evaluation?.score || 0
                                const evaluationRole = evaluation?.targetRole || evaluation?.jobTitle || evaluation?.suggestedRole || "General role"
                                const date = evaluation?.createdAt ? new Date(evaluation.createdAt).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                }) : "Saved evaluation"

                                return (
                                    <button
                                        key={evaluation?._id || index}
                                        onClick={() => openEvaluation(evaluation)}
                                        className='flex flex-col gap-2 rounded-2xl border border-black/8 bg-[#F8F9FA] p-3 text-left transition hover:border-[#6D35FF]/30 hover:bg-[#FBFAFF] sm:flex-row sm:items-center sm:justify-between'>
                                        <div>
                                            <p className='text-sm font-black text-[#071123]'>Evaluation {index + 1}</p>
                                            <p className='mt-1 text-xs text-black/45'>{evaluationRole} · {date}</p>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <span className='rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#251855] shadow-sm'>{evaluationScore}/100</span>
                                            <span className='rounded-full bg-[#071123] px-3 py-1.5 text-xs font-black text-white'>View</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </section>
                )}
            </section>




        </div>
    )
}

export default Scorer
