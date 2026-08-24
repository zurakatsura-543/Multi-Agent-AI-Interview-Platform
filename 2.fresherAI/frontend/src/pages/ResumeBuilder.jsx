import React, { useEffect, useRef, useState } from 'react'
import ResumeForm from '../components/resume/ResumeForm'
import initialData from '../components/resume/initialData'
import { motion } from "motion/react"
import { FiArrowLeft, FiArrowRight, FiCheck, FiEye, FiSave } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PreviewResume from '../components/resume/PreviewResume';
import BrandMark from '../components/BrandMark';
import ATSTemplate from '../components/resume/ATSTemplate';
import DownloadBtn from '../components/resume/DownloadBtn';
const STEPS = [
  { step: 1, title: "Personal Information", subtitle: "Your basic contact details" },
  { step: 2, title: "Professional Summary", subtitle: "A quick intro about yourself" },
  { step: 3, title: "Skills", subtitle: "Your technical skills" },
  { step: 4, title: "Work Experience", subtitle: "Your past jobs & internships" },
  { step: 5, title: "Projects", subtitle: "Projects you have built" },
  { step: 6, title: "Education", subtitle: "Your academic background" },
];

const TOTAL_STEPS = STEPS.length;
const STORAGE_KEY = "hiregen_resume_builder_draft";

function ResumeBuilder({user , setUser}) {
    const [currentStep,setCurrentStep] = useState(1)
    const [data,setData]= useState(initialData)
    const [showPreview,setShowPreview] = useState(false)
    const [saveState, setSaveState] = useState("idle")
    const resumeRef = useRef(null)
    const navigate = useNavigate()
    const progressPct = ((currentStep)/(TOTAL_STEPS))* 100
    const activeStep = STEPS.find((s)=>s.step === currentStep);
    const goPrev = ()=>{
      if(currentStep > 1){
        setCurrentStep(currentStep -1)
      }
    }

     const goNext = ()=>{
      if(currentStep < TOTAL_STEPS){
        setCurrentStep(currentStep + 1)
      }
    }


    const isLastStep = currentStep === STEPS.length

    useEffect(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          setData({ ...initialData, ...parsed })
        }
      } catch (error) {
        console.log(error)
      }
    }, [])

    const saveProgress = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        setSaveState("saved")
        setTimeout(() => setSaveState("idle"), 1800)
      } catch (error) {
        console.log(error)
        setSaveState("error")
        setTimeout(() => setSaveState("idle"), 2200)
      }
    }

    if(showPreview){
      return <PreviewResume data={data} user={user} setUser={setUser} onBack={()=>setShowPreview(false)}/>
    }
  return (
    <div className='min-h-screen bg-[#F6F7FB] text-[#071123] flex flex-col'>
      <motion.nav 
        initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
        className='sticky top-0 z-20 border-b border-black/8 bg-white/85 backdrop-blur-xl'>
            <div className='mx-auto flex h-12 max-w-7xl items-center justify-between px-3 sm:px-5'>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className='flex h-8 items-center justify-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 text-xs font-semibold text-black/55 transition hover:border-[#6D35FF]/50 hover:text-[#251855]'>
                    <FiArrowLeft size={13} />
                    <span className='hidden sm:block'>Back</span>
                  </button>

                  <div onClick={()=>navigate("/dashboard")}
                 className='flex cursor-pointer items-center gap-1.5'>
                    <BrandMark />
                    <span className='hidden rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-black/50 sm:block'>Resume Builder</span>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={saveProgress}
                    className='flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#6D35FF]/25 bg-[#F8F7FF] px-2.5 text-xs font-semibold text-[#251855] transition hover:border-[#6D35FF]/60 hover:bg-white'>
                    <FiSave size={13}/>
                    <span className='hidden sm:block'>
                      {saveState === "saved" ? "Saved" : saveState === "error" ? "Failed" : "Save Progress"}
                    </span>
                  </button>
                  <button onClick={()=>setShowPreview(true)} className='flex h-8 items-center justify-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 text-xs text-black/55 transition hover:border-[#6D35FF]/50 hover:text-[#251855] xl:hidden'>
                    <FiEye size={13}/>
                    <span className='hidden sm:block'>Preview</span>
                  </button>
                  <div className='hidden sm:block xl:hidden'>
                    <DownloadBtn docRef={resumeRef} user={user} setUser={setUser} />
                  </div>
                </div>

            </div>

        </motion.nav>


        <div className='pointer-events-none fixed -left-[9999px] top-0'>
          <div ref={resumeRef}>
            <ATSTemplate data={data} />
          </div>
        </div>

        <main className='flex-1 px-3 py-4 sm:px-5 lg:px-6 lg:py-6'>
          <div className='mx-auto grid w-full max-w-7xl gap-4 xl:grid-cols-[minmax(0,560px)_minmax(520px,1fr)]'>
            <section className='min-w-0'>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className='overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_16px_42px_rgba(15,23,42,0.07)]'>
                <div className='border-b border-black/8 bg-[#071123] px-4 py-4 text-white sm:px-5'>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <p className='text-[10px] font-semibold uppercase tracking-widest text-white/40'>Resume Studio</p>
                      <h1 className='mt-1 text-xl font-black sm:text-2xl'>Build an ATS-ready resume</h1>
                    </div>
                    <div className='rounded-xl border border-[#6D35FF]/30 bg-white/8 px-3 py-2 text-right'>
                      <p className='text-[9px] uppercase tracking-widest text-white/35'>Progress</p>
                      <p className='text-sm font-black'>{Math.round(progressPct)}%</p>
                    </div>
                  </div>

                  <div className='mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10'>
                    <div className='h-full rounded-full bg-[#8B5CF6] transition-all duration-300' style={{width: `${progressPct}%`}} />
                  </div>
                </div>

                <div className='grid border-b border-black/8 bg-[#FBFAFF] sm:grid-cols-3'>
                  {STEPS.map((s) => (
                    <button
                      key={s.step}
                      onClick={() => setCurrentStep(s.step)}
                      className={`flex items-center gap-2 border-b border-black/6 px-4 py-3 text-left transition sm:border-r ${s.step === currentStep ? "bg-white" : "hover:bg-white/70"}`}>
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${s.step < currentStep ? "bg-[#6D35FF] text-white" : s.step === currentStep ? "bg-[#071123] text-white" : "bg-black/5 text-black/35"}`}>
                        {s.step < currentStep ? <FiCheck size={12} /> : s.step}
                      </span>
                      <span className='min-w-0'>
                        <span className={`block truncate text-[11px] font-bold ${s.step === currentStep ? "text-[#071123]" : "text-black/45"}`}>{s.title}</span>
                        <span className='hidden truncate text-[9px] text-black/35 sm:block'>{s.subtitle}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className='px-4 py-4 sm:px-5 sm:py-5'>
                  <div className='mb-4'>
                    <p className='text-[10px] text-black/40 font-bold uppercase tracking-widest'>
                      STEP {currentStep} OF {TOTAL_STEPS}
                    </p>
                    <h2 className='mt-1 text-xl font-black sm:text-2xl'>{activeStep.title}</h2>
                    <p className='mt-1 text-xs text-black/45 sm:text-sm'>{activeStep.subtitle}</p>
                  </div>

                  <ResumeForm step={currentStep} data={data} setData={setData}/>

                  <div className='mt-6 flex items-center justify-between border-t border-black/8 pt-4'>
                    <button
                      onClick={goPrev}
                      disabled={currentStep === 1}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all
                        ${currentStep === 1
                          ? "border-black/8 text-black/25 cursor-not-allowed"
                          : "border-black/12 bg-white text-black/55 hover:border-[#6D35FF]/45 hover:text-[#251855]"
                        }`}>
                      <FiArrowLeft size={15}/>
                      <span className='hidden sm:block'>Previous</span>
                    </button>

                    <div className='flex items-center gap-1.5'>
                      {STEPS.map((s)=>(
                        <button key={s.step}
                          onClick={()=>setCurrentStep(s.step)}
                          className={`rounded-full transition-all ${s.step === currentStep
                            ? "w-5 h-1.5 bg-[#6D35FF]"
                            : s.step < currentStep
                              ? "w-1.5 h-1.5 bg-[#251855]/45"
                              : "w-1.5 h-1.5 bg-black/12"
                            }`}/>
                      ))}
                    </div>

                    {isLastStep ? (
                      <button onClick={()=>setShowPreview(true)} className='flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0B1630] border border-[#6D35FF]/20 text-white shadow-[0_8px_24px_rgba(109,53,255,0.22)] hover:bg-[#251855] hover:border-[#6D35FF]/50 transition-all'>
                        <FiEye size={13}/>
                        <span className='hidden sm:block'>Preview Resume</span>
                      </button>
                    ):(
                      <button onClick={goNext} className='flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0B1630] border border-[#6D35FF]/20 text-white shadow-[0_8px_24px_rgba(109,53,255,0.22)] hover:bg-[#251855] hover:border-[#6D35FF]/50 transition-all'>
                        <span className='hidden sm:block'>Next</span><FiArrowRight size={15}/>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </section>

            <aside className='hidden min-w-0 xl:block'>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className='sticky top-[72px] overflow-hidden rounded-2xl border border-[#6D35FF]/20 bg-[#071123] shadow-[0_18px_50px_rgba(37,24,85,0.24)]'>
                <div className='flex items-center justify-between border-b border-white/10 px-4 py-3 text-white'>
                  <div>
                    <p className='text-[10px] font-semibold uppercase tracking-widest text-white/35'>Live Preview</p>
                    <h3 className='text-sm font-black'>ATS Template</h3>
                  </div>
                  <DownloadBtn docRef={resumeRef} user={user} setUser={setUser} />
                </div>

                <div className='flex justify-center overflow-auto bg-[#0C1833] px-4 py-5'>
                  <div className='h-[870px] w-[620px] shrink-0 overflow-hidden rounded-lg bg-white shadow-[0_20px_70px_rgba(0,0,0,0.38)]'>
                    <div className='origin-top-left scale-[0.78]'>
                      <ATSTemplate data={data} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>
        </main>

     

    </div>
  )
}

export default ResumeBuilder
