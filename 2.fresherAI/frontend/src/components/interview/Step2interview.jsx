import React, { useEffect, useRef } from 'react'
import { useState } from 'react'
import maleVideo from "../../assets/male-ai.mp4"
import femaleVideo from "../../assets/female-ai.mp4"
import { AnimatePresence, motion } from "motion/react"
import { FiArrowRight, FiCamera, FiCameraOff, FiClock, FiCode, FiCpu, FiLogOut, FiMessageSquare, FiMic, FiMicOff, FiRadio } from 'react-icons/fi'
import CodeEditor from './CodeEditor'
import Timer from './Timer'
import { submitAnswer } from '../../apis/interview.api'
import { useNavigate } from 'react-router-dom'
function Step2interview({ interviewData, user }) {
const navigate = useNavigate()
  // ── State ──
  const [question, setQuestion] = useState(interviewData.question);
  const [currentIndex, setCurrentIndex] = useState(interviewData.currentQuestion || 0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(interviewData.question.timer || 60);
  const [timerActive, setTimerActive] = useState(true); // paused once the answer is submitted

  // UI toggles
  const [micOn, setMicOn] = useState(true); // user's manual preference — only changed by the mic button
  const [cameraOn, setCameraOn] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  // Speech
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceGender, setVoiceGender] = useState("female");
  const [introSpoken, setIntroSpoken] = useState(false);

  // Refs
  const aiVideoRef = useRef(null);
  const userVideoRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const speechTimeoutsRef = useRef([]);
  const leavingRef = useRef(false);


  const videoSource = voiceGender === "female" ? femaleVideo : maleVideo
  const progress = ((currentIndex + 1)/(interviewData.totalQuestions))*100
  const showMicon = micOn && !isAIPlaying
  const questionSource = question?.source || (interviewData.useResume ? "resume" : "general")
  const interviewMode = interviewData.type?.toLowerCase() === "hr" ? "HR Interview" : "Technical Interview"
  const modeHint = interviewData.type?.toLowerCase() === "hr" ? "People, communication, and culture fit" : "Role, coding, and scenario readiness"
  const sourceLabels = {
    resume: "Resume-based",
    general: "General",
    coding: "Coding",
    scenario: "Scenario",
    behavioral: "Behavioral",
  }
  const composedAnswer = () => `${answer} ${interimTranscript}`.trim()

  const stopInterviewActivity = (updateUi = true) => {
    leavingRef.current = true;
    if (updateUi) {
      setTimerActive(false);
      setIsAIPlaying(false);
      setIsListening(false);
      setInterimTranscript("");
      setSubtitle("");
    }

    speechTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    speechTimeoutsRef.current = [];

    try {
      recognitionRef.current?.stop();
    } catch (error) {
      console.log(error);
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    }

    aiVideoRef.current?.pause();

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (userVideoRef.current) {
      userVideoRef.current.srcObject = null;
    }
  }

  const leaveInterview = () => {
    const shouldLeave = window.confirm("Leave this interview? Your current answer will not be submitted.");
    if (!shouldLeave) return;

    stopInterviewActivity();
    navigate("/dashboard");
  }

  // Speech recognition

  useEffect(()=>{
    if(!("webkitSpeechRecognition" in window))return;
    const rec = new window.webkitSpeechRecognition()
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e)=>{
      let finalText = "";
      let liveText = "";

      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += `${transcript} `;
        } else {
          liveText += transcript;
        }
      }

      if (finalText.trim()) {
        setAnswer((prev) => `${prev}${prev.trim() ? " " : ""}${finalText.trim()}`);
      }

      setInterimTranscript(liveText.trim());
    }
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec
  },[])


  const startMic = ()=>{
    if (leavingRef.current) return;
    try {
      recognitionRef.current?.start()
    } catch (error) {
      console.log(error)
    }
  }
  const stopMic = ()=>{
    try {
      recognitionRef.current?.stop()
      setInterimTranscript("")
      setIsListening(false)
    } catch (error) {
      console.log(error)
    }
  }

  const toggleMic = ()=>{
    if(micOn){
      stopMic()
    }else{
      startMic()
    }
    setMicOn(!micOn)
  }

  const toggleCamera =async ()=>{
    if(cameraOn){
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraOn(false);

    }else{
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video:true})
        streamRef.current = stream
        setCameraOn(true)
        setTimeout(()=>{
          if(userVideoRef.current) userVideoRef.current.srcObject = stream

        },100)
      } catch (error) {
        setCameraOn(false)
      }
    }
  }

  const handleSubmitCode= (code) => {
   setAnswer((prev)=>{
    const separator = prev.trim() ? "\n\n--- Code ---\n" : "--- Code ---\n";
    return prev + separator + code
   });
   setCodeOpen(false)
    
  }

  useEffect(()=>{
    if (timeLeft <= 0 || !timerActive) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);

  },[timeLeft , timerActive])


  useEffect(()=>{
    const load = ()=>{
      const voices = window.speechSynthesis.getVoices()
      if(!voices.length)return;
      const female = voices.find(v => /zira|samantha|female/i.test(v.name));
      const male   = voices.find(v => /david|mark|male/i.test(v.name));
      if (female)      { setSelectedVoice(female); setVoiceGender("female"); }
      else if (male)   { setSelectedVoice(male);   setVoiceGender("male"); }
      else             { setSelectedVoice(voices[0]); setVoiceGender("female"); }
    }
    load()
    window.speechSynthesis.onvoiceschanged = load

  },[])

  const speakText = (text)=>
    new Promise((resolve)=>{
      if (!window.speechSynthesis || !selectedVoice || !text?.trim()) { resolve(); return; }

      window.speechSynthesis.cancel()

      const timeoutId = setTimeout(()=>{
        speechTimeoutsRef.current = speechTimeoutsRef.current.filter((id) => id !== timeoutId);
        if (leavingRef.current) {
          resolve();
          return;
        }

        const utter = new SpeechSynthesisUtterance(text.replace(/,/g, ", ... ").replace(/\./g, ". ... "))
        utter.voice  = selectedVoice;
        utter.rate   = 0.92;
        utter.pitch  = 1.05;
        utter.volume = 1;
        utter.onstart=()=>{
          if (leavingRef.current) return;
          setIsAIPlaying(true)
          stopMic()
          aiVideoRef.current?.play()
        }
        utter.onend=()=>{
          if (leavingRef.current) {
            resolve();
            return;
          }
          aiVideoRef.current?.pause()
          setIsAIPlaying(false)
          if(micOn) startMic()
            setTimeout(()=>{ setSubtitle("");resolve() },300)
        }
        setSubtitle(text)
        window.speechSynthesis.speak(utter)
      },150)
      speechTimeoutsRef.current.push(timeoutId);
    
    })
  

  useEffect(()=>{
    leavingRef.current = false;
    return () => {
      stopInterviewActivity(false);
    }
  },[])

  useEffect(()=>{
    if(!selectedVoice || introSpoken)return;
    const runIntro=async () => {
      setIntroSpoken(true)
      await new Promise((r) => setTimeout(r, 1200));
      await speakText(`Welcome ${user?.name.split(" ")[0]}! Let's begin your interview.`);
      await new Promise((r) => setTimeout(r, 900));
      await speakText(interviewData.question.question);
    }
    runIntro()

  },[selectedVoice])



  useEffect(()=>{
    setQuestion(interviewData.question);
    setCurrentIndex(interviewData.currentQuestion);
    setTimeLeft(interviewData.question.timer || 60);
    setInterimTranscript("");

  },[interviewData])

  
  useEffect(()=>{
    if(!selectedVoice || !introSpoken)return;
    const speakQuestion = async () => {
      await new Promise((r) => setTimeout(r, 900));
      await speakText(question.question);
    }
    speakQuestion()

  },[question])

  useEffect(()=>{
     setTimeLeft(question.timer || 60);
    setTimerActive(true);

  },[question])



  useEffect(()=>{
    if(timeLeft !== 0)return;
    const autoSubmit = async () => {
      await speakText("Time is up. Submitting your answer now.");
      const finalAnswer = composedAnswer() || "No answer provided. Time over.";

      setLoading(true)

    const res = await submitAnswer({ interviewId: interviewData.interviewId, answer:finalAnswer})

    if(res.completed){
       setFeedback(res.feedback);
        await new Promise((r) => setTimeout(r, 700));
        await speakText(
          res.feedback?.feedback ||
          "Great job! Your interview is complete. Preparing your report now."
        );
        setLoading(false);
        navigate(`/interview/${interviewData.interviewId}/report`);
        return;
    }

     setFeedback(res.feedback);
      await new Promise((r) => setTimeout(r, 700));
      await speakText(
        res.feedback?.feedback ||
        "Noted your answer. Let's move to the next question."
      );
      setLoading(false);
      setQuestion(res.question);
      setCurrentIndex(res.currentQuestion);
      setAnswer("");
      setInterimTranscript("");
      setFeedback(null);


    }


    autoSubmit()
   

  },[timeLeft])


  const submit =async ()=>{

    const finalAnswer = composedAnswer()

    if(!finalAnswer)return;

    setTimerActive(false)
    setLoading(true)
    setInterimTranscript("")

    const res = await submitAnswer({ interviewId: interviewData.interviewId, answer: finalAnswer})

    if(res.completed){
       setFeedback(res.feedback);
        await new Promise((r) => setTimeout(r, 700));
        await speakText(
          res.feedback?.feedback ||
          "Great job! Your interview is complete. Preparing your report now."
        );
        setLoading(false);
        navigate(`/interview/${interviewData.interviewId}/report`);
        return;
    }

     setFeedback(res.feedback);
      await new Promise((r) => setTimeout(r, 700));
      await speakText(
        res.feedback?.feedback ||
        "Noted your answer. Let's move to the next question."
      );
      setLoading(false);
      setQuestion(res.question);
      setCurrentIndex(res.currentQuestion);
      setAnswer("");
      setInterimTranscript("");
      setFeedback(null);

  }

  


  return (
    <div className='min-h-screen bg-[#F4F6FB] flex items-center justify-center p-3 sm:p-5'>


      {codeOpen && <CodeEditor onClose={()=>setCodeOpen(false)} onSubmitCode={handleSubmitCode} />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='w-full max-w-6xl bg-[#071123] border border-white/10 rounded-2xl sm:rounded-[28px] overflow-hidden shadow-[0_28px_90px_rgba(15,23,42,.22)] grid lg:grid-cols-[36%_64%]'>
        {/* left */}

        <div className='flex flex-col border-b lg:border-b-0 lg:border-r border-white/8 p-4 sm:p-5 gap-3 bg-[linear-gradient(135deg,rgba(109,53,255,0.16),transparent_42%)]'>

          {/* Ai Video */}
          <div className='relative rounded-xl overflow-hidden bg-black aspect-video'>
            <video
              src={videoSource}
              ref={aiVideoRef}
              muted
              playsInline
              preload="auto"
              loop
              className="w-full h-full object-cover"
            />
            {(isAIPlaying || isListening) && (
              <div className='absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1'>
                <div className='flex gap-0.5 items-end h-3'>
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      className={`w-0.5 rounded-full ${isAIPlaying ? "bg-white" : "bg-emerald-300"}`}
                      animate={{ height: ["4px", "12px", "4px"] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <span className='text-[10px] text-white/80'>{isAIPlaying ? "AI Speaking" : "Listening live"}</span>
              </div>
            )}
          </div>

          <div className='min-h-[52px] flex items-center'>
            <AnimatePresence>
              {subtitle &&
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className='w-full rounded-xl bg-white/5 border border-white/8 px-3 py-2'>
                  <p className="text-xs text-white/65 leading-relaxed text-center">{subtitle}</p>

                </motion.div>}

             
            </AnimatePresence>

            
          </div>


          <div className='relative rounded-xl overflow-hidden bg-[#17181E] border border-white/8 aspect-video flex items-center justify-center'>
            {cameraOn ?
              <>
                <video
                  ref={userVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className='absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5'>
                <span className="text-[10px] text-white/70">You</span>
                </div>
              </>
              :
              <div className='flex flex-col items-center gap-2'>
                <div className='w-14 h-14 rounded-full bg-white/10 border border-white/15 flex items-center justify-center'>
                <span className='text-2xl font-bold text-white'>{user?.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className='text-xs text-white/35'>{user?.name.split(" ")[0]}</span>
                </div>}     
          </div>


          <div className='flex flex-col items-center gap-1.5 pt-1'>
            <div className='flex items-center justify-center gap-3'>
              <motion.button
              onClick={toggleMic} 
              whileHover={{ scale: 1.08 }} 
              whileTap={{ scale: 0.93 }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  showMicon ? "bg-white/10 border-white/15 text-white" : "bg-red-500/20 border-red-500/30 text-red-400"
                }`}>
                  {showMicon ? <FiMic size={15}/> : <FiMicOff size={15}/>}

              </motion.button>

              <motion.button 
              whileHover={{ scale: 1.08 }} 
              whileTap={{ scale: 0.93 }}
              onClick={toggleCamera}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  cameraOn ? "bg-white/10 border-white/15 text-white" : "bg-white/5 border-white/10 text-white/45 hover:text-white/70"
                }`}>
                  {cameraOn ? <FiCamera size={15}/> : <FiCameraOff size={15}/>}
                

              </motion.button>

              <motion.button 
              whileHover={{ scale: 1.08 }} 
              whileTap={{ scale: 0.93 }}
              onClick={()=>setCodeOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center border bg-white/5 border-white/10 text-white/45 hover:text-white/70 hover:border-white/20 transition-all">

                <FiCode size={15}/>
                
              </motion.button>


            </div>

            <div className='min-h-[14px] flex items-center justify-center'>
              {micOn && isAIPlaying && (
                <span className="text-[10px] text-red-400/80">Mic paused — AI is speaking</span>)}
              {micOn && !isAIPlaying && isListening && (
                <span className="text-[10px] text-emerald-300/90">Live speech capture active</span>)}
            </div>

            <span className="text-[10px] text-white/35 text-center">
              Coding question? Use <FiCode size={9} className="inline -mt-0.5" /> to write &amp; add code
            </span>

          </div>

        </div>
        {/* right */}

        <div className='flex flex-col p-4 sm:p-6'>


          <div className='flex items-start justify-between mb-4'>

            <div> 
              <div className='mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-purple-200'>
                <FiCpu size={11}/>
                {interviewMode}
              </div>
              <h2 className='text-base sm:text-lg font-semibold text-white'>
                {interviewMode}
              </h2>
              <div className='flex flex-wrap items-center gap-2 text-zinc-500 text-xs mt-1'>
                <FiClock size={11}/>
                <span>{question.difficulty}</span>
                <span className='rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/55'>{modeHint}</span>
                <span className='rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/55'>{sourceLabels[questionSource] || questionSource}</span>
                {question?.focus && (
                  <span className='rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-2 py-0.5 text-[10px] text-purple-200'>{question.focus}</span>
                )}

              </div>
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={leaveInterview}
                className='h-9 px-3 rounded-xl border border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15 hover:text-red-200 transition text-xs font-medium flex items-center gap-1.5'
              >
                <FiLogOut size={13}/>
                <span className='hidden sm:inline'>Leave</span>
              </button>

              <div className='flex flex-col items-end gap-1.5 min-w-[110px]'>
                <Timer timeLeft={timeLeft} totalTime={question.timer || 60}/>
              </div>

            </div>
          </div>


          <motion.div 
          initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          className='relative overflow-hidden rounded-2xl bg-[#0E1728] border border-white/8 p-4 sm:p-5 mb-4'>
            <div className='absolute inset-0 bg-[linear-gradient(135deg,rgba(109,53,255,0.16),transparent_45%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,28px_28px,28px_28px] pointer-events-none'/>
            <div className='relative flex items-center gap-2.5 mb-3'>
              <div className='w-8 h-8 rounded-lg bg-white text-[#071123] flex items-center justify-center shrink-0'>
                <FiMessageSquare size={14}/>
              </div>
              <div>
                <p className='text-xs text-zinc-400'>Question {currentIndex + 1}</p>
                <p className='text-[10px] text-white/35'>{questionSource === "resume" ? "Pulled from resume context first" : "Role-specific interview bank"}</p>
              </div>
            </div>
            <p className='relative text-white text-sm sm:text-base leading-7'>
              {question.question}</p>

          </motion.div>

          <div className='mb-3'>
            <div className='flex justify-between text-[10px] text-white/35 mb-1'>
            <span>Progress</span>
            <span>{currentIndex+1}/{interviewData.totalQuestions}</span>
            </div>
            <div className='w-full h-1 rounded-full bg-white/10 overflow-hidden'>
            <div className='h-full bg-[#8B5CF6] rounded-full transition-all duration-500' style={{width: `${progress}%`}} /></div>
          </div>

          <div className='flex-1 flex flex-col min-h-0'>
            <div className='mb-1.5 flex items-center justify-between'>
              <label className='text-xs font-medium text-zinc-400'>Your Answer</label>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${isListening && micOn && !isAIPlaying ? "bg-emerald-500/10 text-emerald-300" : "bg-white/5 text-white/35"}`}>
                <FiRadio size={10} />
                {isListening && micOn && !isAIPlaying ? "Listening" : "Voice standby"}
              </span>
            </div>
            <textarea
            onChange={(e)=>setAnswer(e.target.value)}
            value={answer}
            rows={5}
            onKeyDown={(e)=>{if(e.ctrlKey && e.key === "Enter") submit()}}
            placeholder='Write your answer here… or speak if mic is on'
             className='flex-1 w-full rounded-xl bg-[#17181E] border border-white/8 p-4 text-sm text-white outline-none resize-none focus:border-white/25 transition placeholder-white/20'/>
            <AnimatePresence>
              {(interimTranscript || (isListening && micOn && !isAIPlaying)) && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className='mt-2 rounded-xl border border-emerald-400/20 bg-emerald-400/8 px-3 py-2'>
                  <div className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-300'>
                    <FiMic size={11} />
                    Live transcript
                  </div>
                  <p className='mt-1 min-h-[18px] text-xs leading-5 text-emerald-50/80'>
                    {interimTranscript || "Listening... start speaking and your words will appear here instantly."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className='mt-3 min-h-[0px]'>
            <AnimatePresence>
              {feedback && (
                <motion.div 
                initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 ,y:6}}
                className='rounded-xl border border-green-500/20 bg-green-500/5 p-4 max-h-40 overflow-y-auto'>
                  <p className='text-xs uppercase tracking-widest text-green-400 mb-2'>AI Feedback</p>
                  <p className='text-sm text-zinc-300 leading-6'>{feedback.feedback}</p>

                </motion.div>)}
            </AnimatePresence>
          </div>


          <div className='flex items-center justify-between mt-4 pt-3 border-t border-white/8'>
          <span className='text-xs text-zinc-600 hidden sm:block'>
            Press{" "}
            <span className='mx-1 rounded bg-white/10 px-1.5 py-0.5 text-white text-[10px]'>
             Ctrl+Enter
            </span>to Submit
          </span>

          <motion.button 
          whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submit}
              disabled={loading || !composedAnswer()}
              className='ml-auto h-10 min-w-[150px] justify-center px-5 rounded-xl bg-white text-[#071123] text-sm font-semibold flex items-center gap-2 disabled:opacity-40 transition'

              
              >
                 {loading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  Submitting…
                </>
              ) : (
                <>Submit Answer <FiArrowRight size={15} /></>
              )}

          </motion.button>
          
          </div>


        </div>


      </motion.div>



    </div>
  )
}

export default Step2interview
