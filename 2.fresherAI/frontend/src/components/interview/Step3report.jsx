import React, { useRef } from 'react'
import { motion } from "motion/react"
import { FiAlertTriangle, FiArrowLeft, FiAward, FiCheck, FiFileText, FiShield, FiTarget, FiTrendingUp, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import DownloadBtn from '../resume/DownloadBtn'
function Step3report({ report, user, setUser }) {
  const navigate = useNavigate()
  const reportRef = useRef(null)
  const evidenceQuestions = report.questions?.filter((item) => item.evidence?.jdRequirement || item.evidence?.resumeEvidence || item.evidence?.testedGap) || []
  const averageJdAlignment = report.averageJdAlignment || Math.round(
    evidenceQuestions.reduce((sum, item) => sum + (item.feedback?.jdAlignment || 0), 0) / (evidenceQuestions.length || 1)
  )
  const readinessScore = report.readinessScore || report.overallScore || 0
  const groundednessRisk = report.groundednessRisk || "not_applicable"

  return (
    <div className='min-h-screen bg-white flex items-center justify-center md:p-5'>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl rounded-[24px] bg-gray-100 border border-white/10 overflow-hidden">
        <div className='border-b border-white/10 px-8 py-6 flex items-center justify-between'>

          <div>
            <div onClick={() => navigate("/dashboard")} className='inline-flex items-center gap-2 text-white rounded-full border border-black/20 bg-black px-3 py-1.5 cursor-pointer'>
              <FiArrowLeft size={14} />
              <span className='text-xs text-zinc-100'>Back</span>

            </div>

            <h1 className='text-2xl font-bold text-black mt-2'>Interview Report</h1>

            <p className='text-xs mb-2 text-zinc-500 mt-1.5'>
              AI Generated Performance Analysis
            </p>

            <DownloadBtn
              docRef={reportRef}
              user={user}
              setUser={setUser}
            />
          </div>

          <div className='hidden md:flex items-center gap-2.5 rounded-2xl border border-black/34 bg-black px-4 py-2.5'>
            <FiAward className="text-yellow-400" size={16} />

            <span className='text-sm text-white'>Completed</span>
          </div>

        </div>


        <div className='p-8' ref={reportRef}>
          <div className='grid md:grid-cols-3 gap-5'>
            <div className='rounded-2xl bg-[#17181E] border border-white/10 p-6'>

              <div className='w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center'>
                <FiTarget size={18} />
              </div>

              <p className='mt-5 text-zinc-500 text-xs'>Overall Score</p>

              <h2 className='mt-2 text-4xl font-bold text-white'>
                {report.overallScore}

                <span className='text-lg text-zinc-500'>/100</span>
              </h2>


            </div>

            <div className='rounded-2xl bg-[#17181E] border border-white/10 p-6'>
              <div className='w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center'>
                <FiTrendingUp size={18} />
              </div>

              <p className='mt-5 text-zinc-500 text-xs'>Questions</p>

              <h2 className='mt-2 text-4xl font-bold text-white'>{report.questions.length}</h2>
            </div>


            <div className='rounded-2xl bg-[#17181E] border border-white/10 p-6'>
              <div className='w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center'>
                <FiAward size={18} />
              </div>

              <p className='mt-5 text-zinc-500 text-xs'>Status</p>

              <h2 className='mt-2 text-4xl font-bold text-white'>Completed</h2>
            </div>


          </div>

          <div className='mt-6 rounded-2xl bg-[#17181E] border border-white/10 p-6'>
            <h3 className="text-lg font-semibold text-white">
              Interview Summary
            </h3>

            <p className="mt-3 text-sm leading-7 text-zinc-400">
              {report.summary}
            </p>

          </div>

          <div className='mt-6 rounded-2xl bg-[#071123] border border-[#8B5CF6]/20 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.16)]'>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              <div>
                <p className='text-[11px] font-black uppercase tracking-widest text-[#A78BFA]'>Resume-JD Readiness</p>
                <h3 className='mt-2 text-xl font-bold text-white'>Role readiness after this interview</h3>
                <p className='mt-2 max-w-2xl text-sm leading-6 text-zinc-400'>
                  {report.evidenceCoverageSummary || (evidenceQuestions.length ? "Your answers were reviewed against retrieved resume-JD evidence." : "No resume-JD evidence was used for this interview.")}
                </p>
              </div>

              <div className='rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-right'>
                <p className='text-[11px] uppercase tracking-widest text-zinc-500'>Readiness</p>
                <h2 className='mt-1 text-4xl font-black text-white'>
                  {readinessScore}
                  <span className='text-lg text-zinc-500'>/100</span>
                </h2>
              </div>
            </div>

            <div className='mt-5 grid gap-3 md:grid-cols-3'>
              <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300'>
                  <FiTarget size={17} />
                </div>
                <p className='mt-4 text-xs text-zinc-500'>Average JD Alignment</p>
                <h4 className='mt-1 text-2xl font-bold text-white'>{averageJdAlignment}/100</h4>
              </div>

              <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-purple-400/10 text-purple-200'>
                  <FiFileText size={17} />
                </div>
                <p className='mt-4 text-xs text-zinc-500'>Evidence Questions</p>
                <h4 className='mt-1 text-2xl font-bold text-white'>{evidenceQuestions.length}/{report.questions?.length || 0}</h4>
              </div>

              <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-200'>
                  <FiShield size={17} />
                </div>
                <p className='mt-4 text-xs text-zinc-500'>Groundedness Risk</p>
                <h4 className='mt-1 text-2xl font-bold capitalize text-white'>{groundednessRisk.replace("_", " ")}</h4>
              </div>
            </div>

            <div className='mt-5 grid gap-5 lg:grid-cols-3'>
              <div>
                <div className='flex items-center gap-2 text-sm font-semibold text-white'>
                  <FiCheck className='text-emerald-300' />
                  Strong Matches
                </div>
                <div className='mt-3 space-y-2'>
                  {(report.strongestMatchedSkills?.length ? report.strongestMatchedSkills : report.strengths?.slice(0, 3))?.map((item) => (
                    <div key={item} className='rounded-xl border border-emerald-300/15 bg-emerald-300/8 px-3 py-2 text-xs leading-5 text-emerald-50/80'>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className='flex items-center gap-2 text-sm font-semibold text-white'>
                  <FiAlertTriangle className='text-amber-200' />
                  Weak JD Gaps
                </div>
                <div className='mt-3 space-y-2'>
                  {(report.weakestJdGaps?.length ? report.weakestJdGaps : report.weaknesses?.slice(0, 3))?.map((item) => (
                    <div key={item} className='rounded-xl border border-amber-300/15 bg-amber-300/8 px-3 py-2 text-xs leading-5 text-amber-50/80'>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className='flex items-center gap-2 text-sm font-semibold text-white'>
                  <FiTrendingUp className='text-purple-200' />
                  Next Practice
                </div>
                <div className='mt-3 space-y-2'>
                  {(report.nextPracticePlan?.length ? report.nextPracticePlan : report.recommendations?.slice(0, 5))?.map((item) => (
                    <div key={item} className='rounded-xl border border-purple-300/15 bg-purple-300/8 px-3 py-2 text-xs leading-5 text-purple-50/80'>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className='grid lg:grid-cols-2 gap-5 mt-6'>

            <div className='rounded-2xl bg-[#17181E] border border-green-500/20 p-6'>

              <div className='flex items-center gap-2.5'>
                <div className='w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center'>
                  <FiTrendingUp className='text-white' size={16} />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Strengths
                </h2>
              </div>

              <div className='mt-5 space-y-3'>
                {report.strengths?.length >0 ? (
                  report.strengths?.map((s)=>(
                    <div key={s} className='flex items-start gap-3 rounded-xl bg-green-500/5 border border-green-500/10 p-3.5'>
                      <div className='w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-xs'><FiCheck size={16}/></div>

                      <p className='text-sm text-zinc-300 leading-6'>{s}</p>
                      </div>
                  ))

                ):(
                  <p className="text-zinc-500 text-sm">
                      No strengths available.
                    </p>
                )}
              </div>



            </div>


           <div className='rounded-2xl bg-[#17181E] border border-red-500/20 p-6'>

              <div className='flex items-center gap-2.5'>
                <div className='w-9 h-9 rounded-lg bg-red-500 flex items-center justify-center'>
                  <FiX className='text-white' size={16} />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Areas to Improve
                </h2>
              </div>

              <div className='mt-5 space-y-3'>
                {report.weaknesses?.length >0 ? (
                  report.weaknesses?.map((s)=>(
                    <div key={s} className='flex items-start gap-3 rounded-xl bg-red-500/5 border border-red-500/10 p-3.5'>
                      <div className='w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 text-xs'>!</div>

                      <p className='text-sm text-zinc-300 leading-6'>{s}</p>
                      </div>
                  ))

                ):(
                  <p className="text-zinc-500 text-sm">
                      No weaknesses found.
                    </p>
                )}
              </div>



            </div>
          </div>

          <div className='mt-6 rounded-2xl bg-[#17181E] border border-white/10 p-6'>
          <h3 className="text-lg font-semibold text-white">
                Recommendations
              </h3>


              <div className='mt-5 space-y-3'>
                {
                  report.recommendations?.length > 0 ? (
                    report.recommendations?.map((r, i)=>(
                      <div key={i} className='flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] p-4'>
                        <div className='w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-semibold flex-shrink-0 text-sm'>{i+1}</div>
                        <p className='text-sm text-zinc-300 leading-6'>{r}</p>
                        </div>
                    ))

                  ):(
                    <p className="text-zinc-500 text-sm">
                    No recommendations available.</p>
                  )
                }
              </div>
          </div>


          <div className='mt-8'>
             <h3 className="text-xl font-bold text-black mb-5">
                Question Wise Analysis
              </h3>

              <div className='space-y-5'>
                {report.questions?.map((item,index)=>(
                  <div key={index} className='rounded-2xl bg-[#17181E] border border-white/10 p-6'>
                    <div>
                      <span className='text-[11px] uppercase tracking-widest text-zinc-500'>
                        Question {index+1}

                      </span>
                      <h4 className='mt-2.5 text-base font-semibold text-white leading-7'>{item.question}</h4>
                    </div>

                    <div className='mt-6'>
                      <p className='text-[11px] uppercase tracking-widest text-zinc-500'> Your Answer</p>
                      <p className='mt-2.5 text-sm leading-6 text-zinc-300'>
                        {item.userAnswer || "No answer submitted"}
                      </p>
                    </div>

                    <div className='grid md:grid-cols-4 gap-3.5 mt-6'>
                      <div className='rounded-xl bg-black/20 p-3.5'>
                      <p className='text-xs text-zinc-500'>Score</p>
                      <h5 className='mt-2 text-xl font-bold text-white'>
                        {item.feedback?.score ?? 0}
                      </h5>
                      
                      </div>

                      <div className='rounded-xl bg-black/20 p-3.5'>
                      <p className='text-xs text-zinc-500'>Clarity</p>
                      <h5 className='mt-2 text-xl font-bold text-white'>
                        {item.feedback?.clarity ?? 0}
                      </h5>
                      
                      </div>

                      <div className='rounded-xl bg-black/20 p-3.5'>
                      <p className='text-xs text-zinc-500'>Relevance</p>
                      <h5 className='mt-2 text-xl font-bold text-white'>
                        {item.feedback?.relevance ?? 0}
                      </h5>
                      
                      </div>

                      <div className='rounded-xl bg-black/20 p-3.5'>
                      <p className='text-xs text-zinc-500'>Communication</p>
                      <h5 className='mt-2 text-xl font-bold text-white'>
                        {item.feedback?.communication ?? 0}
                      </h5>
                      
                      </div>
                    </div>

                    {item.feedback?.evidenceCoverage && item.feedback.evidenceCoverage !== "not_applicable" && (
                      <div className='mt-4 grid gap-3 md:grid-cols-3'>
                        <div className='rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3.5'>
                          <p className='text-xs text-emerald-200/70'>Evidence Coverage</p>
                          <h5 className='mt-2 text-lg font-bold capitalize text-white'>
                            {item.feedback.evidenceCoverage}
                          </h5>
                        </div>

                        <div className='rounded-xl border border-purple-300/15 bg-purple-300/5 p-3.5'>
                          <p className='text-xs text-purple-100/70'>JD Alignment</p>
                          <h5 className='mt-2 text-lg font-bold text-white'>
                            {item.feedback.jdAlignment ?? 0}/100
                          </h5>
                        </div>

                        <div className='rounded-xl border border-amber-300/15 bg-amber-300/5 p-3.5'>
                          <p className='text-xs text-amber-100/70'>Groundedness Risk</p>
                          <h5 className='mt-2 text-lg font-bold capitalize text-white'>
                            {item.feedback.groundednessRisk || "not_applicable"}
                          </h5>
                        </div>
                      </div>
                    )}

                    {(item.evidence?.jdRequirement || item.evidence?.resumeEvidence || item.evidence?.testedGap) && (
                      <div className='mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4'>
                        <p className='text-[11px] uppercase tracking-widest text-zinc-500'>Retrieved Evidence Used</p>
                        <div className='mt-3 grid gap-3 md:grid-cols-2'>
                          {item.evidence?.jdRequirement && (
                            <div className='rounded-lg bg-black/20 p-3'>
                              <p className='text-[10px] uppercase tracking-widest text-zinc-500'>JD Requirement</p>
                              <p className='mt-1.5 text-xs leading-5 text-zinc-300'>{item.evidence.jdRequirement}</p>
                            </div>
                          )}
                          {item.evidence?.resumeEvidence && (
                            <div className='rounded-lg bg-black/20 p-3'>
                              <p className='text-[10px] uppercase tracking-widest text-zinc-500'>Resume Evidence</p>
                              <p className='mt-1.5 text-xs leading-5 text-zinc-300'>{item.evidence.resumeEvidence}</p>
                            </div>
                          )}
                        </div>
                        {item.evidence?.testedGap && (
                          <div className='mt-3 rounded-lg border border-amber-300/15 bg-amber-300/5 p-3'>
                            <p className='text-[10px] uppercase tracking-widest text-amber-100/60'>Tested Gap</p>
                            <p className='mt-1.5 text-xs leading-5 text-amber-50/75'>{item.evidence.testedGap}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className='mt-6 rounded-xl border border-green-500/20 bg-green-500/5 p-4.5'>
                    <p className='text-[11px] uppercase tracking-widest text-green-400'>AI Feedback</p>
                    <p className='mt-2.5 text-sm leading-6 text-zinc-300'>{item.feedback?.feedback ||
                          "No feedback available."}</p>
                    </div>


                    {item.feedback?.improvements?.length > 0 && (
                      <div className='mt-6'>
                         <h5 className="text-sm font-semibold text-white">
                          Suggested Improvements
                        </h5>
                        <div className='mt-3.5 space-y-2.5'>
                          {item.feedback?.improvements?.map((item, i)=>(
                            <div key={i} className='rounded-lg border border-white/10 bg-white/[0.03] p-3.5'>
                              <p className='text-sm text-zinc-300'>
                               • {item}
                              </p>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}

                  </div>
                ))}
              </div>
          </div>

        </div>

      </motion.div>
    </div>
  )
}

export default Step3report
