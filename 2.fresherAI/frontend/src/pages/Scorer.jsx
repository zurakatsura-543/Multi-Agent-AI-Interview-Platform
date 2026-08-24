import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react"
import { useState } from 'react'
import { FiAlertCircle, FiBriefcase, FiCheckCircle, FiClock, FiTarget, FiTrendingUp, FiUploadCloud, FiUser, FiZap } from 'react-icons/fi'
import api from '../utils/axios'
import { useDispatch, useSelector } from 'react-redux'
import { setResume } from '../redux/resumeSlice'
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"
import { useCoins } from '../apis/user.api'
import BrandMark from '../components/BrandMark'

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
    const dispatch = useDispatch()
    const { resume } = useSelector((state) => state.resume)
    const targetJobTitle = selectedRole === "Other" ? customRole.trim() : selectedRole

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
                    <button onClick={() => dispatch(setResume(null))}
                        className='text-[10px] sm:text-xs text-black/50 hover:text-[#0A0A0A] border border-black/15 hover:border-black/35 px-2.5 py-1 rounded-lg transition-colors'>Re-upload</button>
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
            </section>




        </div>
    )
}

export default Scorer
