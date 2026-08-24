import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'
import api from '../utils/axios'
import { motion } from "motion/react"
import { FiAward, FiBarChart2, FiCheckCircle, FiClock, FiFileText, FiMap, FiPlus, FiSidebar, FiTarget, FiTrendingUp } from 'react-icons/fi'
import { useEffect } from 'react'
import { getAllInterviews } from '../apis/interview.api'
import Statbox from '../components/Statbox'
import InterviewGraph from '../components/InterviewGraph'
import BrandMark from '../components/BrandMark'
function Dashboard({ user, setUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [moblieOpen, setMoblieOpen] = useState(false)
  const [stats, setStats] = useState({

    totalInterviews: 0,

    totalQuestions: 0,

    completed: 0,

    averageScore: 0,

  });

  const [technicalData, setTechnicalData] = useState([]);

  const [hrData, setHrData] = useState([]);

  const [technicalCount, setTechnicalCount] = useState(0);

  const [hrCount, setHrCount] = useState(0);

  const navigate = useNavigate()
  const firstName = user?.name?.split(" ")[0] || "there"
  const completionRate = stats?.totalInterviews
    ? Math.round((stats.completed / stats.totalInterviews) * 100)
    : 0
  const quickActions = [
    {
      title: "Start mock interview",
      meta: "Technical or HR session",
      icon: <FiPlus size={15} />,
      onClick: () => navigate("/interview"),
    },
    {
      title: "Score a resume",
      meta: "ATS score and gaps",
      icon: <FiFileText size={15} />,
      onClick: () => navigate("/scorer"),
    },
    {
      title: "Build roadmap",
      meta: "Target role learning path",
      icon: <FiMap size={15} />,
      onClick: () => navigate("/roadmap"),
    },
  ]

  useEffect(() => {

    const fetchInterviews = async () => {
      const response = await getAllInterviews()
      setStats(response.stats)
      setTechnicalData(response.technicalData)
      setHrData(response.hrData)
      setTechnicalCount(response.technicalCount)
      setHrCount(response.hrCount)
    }

    fetchInterviews()

  }, [])

  const handleLogout = async () => {
    try {
      const response = await api.get("/api/auth/logout")

      if (response.data.success) {

        setUser(null)
        navigate("/")
      }
    } catch (error) {
      console.log(error)
    }
  }



  return (
    <div className='bg-[#F6F7F9] min-h-screen text-[#0A0A0A] font-sans flex'>
      <Sidebar
        user={user}
        onNewInterview={() => navigate("/interview")}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        moblieOpen={moblieOpen}
        setMoblieOpen={setMoblieOpen}
      />

      <motion.main className={`flex-1 min-h-screen px-3 sm:px-4 md:px-6 py-4 md:py-6 transition-all duration-300 ${sidebarOpen ? "md:ml-[260px]" : "md:ml-[72px]"
        }`}>

        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2.5'>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMoblieOpen(true)}
              className='md:hidden text-black/40 hover:text-[#0A0A0A] transition-colors'>
              <FiSidebar size={17} />

            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className='text-black/40 text-[11px] md:text-xs font-semibold uppercase tracking-widest mb-0.5'>Workspace</p>
              <div className='flex items-center gap-2'>
                <BrandMark compact />
                <span className='text-lg md:text-xl font-black text-[#071123]'>Dashboard</span>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className='relative overflow-hidden rounded-2xl bg-[#071123] text-white border border-[#6D35FF]/20 px-4 py-5 sm:px-5 md:px-6 md:py-6 shadow-[0_18px_50px_rgba(37,24,85,0.22)] mb-4 md:mb-5'>
          <div className='absolute inset-x-0 top-0 h-px bg-[#8B5CF6]/70' />
          <div className='relative grid gap-5 lg:grid-cols-[1.45fr_0.95fr] lg:items-end'>
            <div>
              <p className='text-white/45 text-[10px] font-semibold uppercase tracking-widest mb-2'>Interview readiness</p>
              <h1 className='text-2xl sm:text-3xl md:text-4xl font-black leading-tight'>
                Welcome back, {firstName}
              </h1>
              <p className='mt-2 max-w-xl text-xs sm:text-sm leading-6 text-white/55'>
                Track practice, resume quality, and role preparation from one focused workspace.
              </p>
            </div>

            <div className='grid grid-cols-3 gap-2'>
              <div className='rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2'>
                <p className='text-[9px] uppercase tracking-widest text-white/35'>Coins</p>
                <p className='mt-1 text-lg font-black'>{user?.interviewCoin ?? 0}</p>
              </div>
              <div className='rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2'>
                <p className='text-[9px] uppercase tracking-widest text-white/35'>Complete</p>
                <p className='mt-1 text-lg font-black'>{completionRate}%</p>
              </div>
              <div className='rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2'>
                <p className='text-[9px] uppercase tracking-widest text-white/35'>Score</p>
                <p className='mt-1 text-lg font-black'>{Math.round(stats?.averageScore || 0)}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 md:gap-3'>

          <Statbox
            label="Total Interviews"

            value={stats?.totalInterviews}

            subHighlight="All Time"

            sub="Interviews Created"

            index={0}
            icon={<FiTarget size={16} />}
            accent="bg-[#6D35FF]"
          />

          <Statbox

            label="Questions Solved"

            value={stats?.totalQuestions}

            subHighlight="Answered"

            sub="Across All Interviews"

            index={1}
            icon={<FiCheckCircle size={16} />}
            accent="bg-[#0B1630]"

          />



          <Statbox

            label="Completed"

            value={stats?.completed}

            subHighlight={`${stats?.totalInterviews || 0} Total`}

            sub="Interviews Finished"

            index={2}
            icon={<FiAward size={16} />}
            accent="bg-[#8B5CF6]"

          />



          <Statbox

            label="Average Score"

            value={`${Math.round(stats?.averageScore || 0)}/100`}

            subHighlight="Completed Only"

            sub="Average Performance"

            index={3}
            icon={<FiTrendingUp size={16} />}
            accent="bg-[#3B1B96]"

          />


        </div>

        <div className='mt-5 grid grid-cols-1 xl:grid-cols-[1.4fr_0.75fr] gap-3 md:gap-4'>
          <section>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mb-3 md:mb-4">
              <p className='text-black/35 text-[10px] font-semibold uppercase tracking-widest mb-1'>Performance</p>
              <h3 className='text-[#0A0A0A] font-black text-base md:text-lg'>Skill Breakdown</h3>
            </motion.div>

            <InterviewGraph
              technicalData={technicalData}
              technicalCount={technicalCount}
              hrData={hrData}
              hrCount={hrCount}
            />
          </section>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.34 }}
            className='rounded-xl border border-black/8 bg-white p-3.5 md:p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] h-fit'>
            <div className='flex items-center justify-between gap-3 mb-3'>
              <div>
                <p className='text-black/35 text-[10px] font-semibold uppercase tracking-widest mb-1'>Next steps</p>
                <h3 className='text-sm md:text-base font-black'>Preparation Queue</h3>
              </div>
              <div className='h-9 w-9 rounded-lg bg-black/[0.04] flex items-center justify-center text-black/50'>
                <FiClock size={16} />
              </div>
            </div>

            <div className='space-y-2'>
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  onClick={action.onClick}
                  className='w-full flex items-center gap-3 rounded-lg border border-black/8 bg-[#F8F9FA] px-3 py-2.5 text-left transition hover:border-black/16 hover:bg-white'>
                  <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B1630] text-white'>
                    {action.icon}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block text-xs font-bold text-[#0A0A0A]'>{action.title}</span>
                    <span className='block text-[10px] text-black/40 mt-0.5'>{action.meta}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className='mt-3 rounded-lg border border-[#6D35FF]/20 bg-[#071123] px-3 py-3 text-white'>
              <div className='flex items-center gap-2'>
                <FiBarChart2 size={14} className='text-white/60' />
                <p className='text-xs font-bold'>Readiness snapshot</p>
              </div>
              <p className='mt-2 text-[11px] leading-5 text-white/50'>
                {stats.completed > 0
                  ? `You have completed ${stats.completed} interview${stats.completed === 1 ? "" : "s"} with an average score of ${Math.round(stats.averageScore || 0)}/100.`
                  : "Complete one interview to unlock your first performance report."}
              </p>
            </div>
          </motion.aside>
        </div>
        

      </motion.main>



    </div>
  )
}

export default Dashboard
