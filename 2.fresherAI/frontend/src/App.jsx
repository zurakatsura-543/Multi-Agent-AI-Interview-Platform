import { Routes , Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import { lazy, Suspense, useState, useEffect } from 'react'
import { getCurrentUser } from './apis/user.api'
import { getResume } from './apis/resume.api'
import { useDispatch } from 'react-redux'
import { setResume } from './redux/resumeSlice'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Scorer = lazy(() => import('./pages/Scorer'))
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'))
const InterviewStart = lazy(() => import('./pages/InterviewStart'))
const InterviewPage = lazy(() => import('./pages/InterviewPage'))
const InterviewReport = lazy(() => import('./pages/InterviewReport'))
const Roadmap = lazy(() => import('./pages/Roadmap'))
const Billing = lazy(() => import('./pages/Billing'))

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBFAFF] text-[#071123]">
      <div className="flex items-center gap-3 rounded-full border border-[#E8DEFF] bg-white px-5 py-3 shadow-[0_16px_45px_rgba(40,24,85,0.10)]">
        <img src="/hg-logo.png" alt="" className="h-7 w-7 rounded-lg" />
        <span className="text-sm font-black">Loading HireGen-AI...</span>
      </div>
    </div>
  )
}

function RequireAuth({ user, authChecked, children }) {
  if (!authChecked) return <LoadingScreen />
  return user ? <Suspense fallback={<LoadingScreen />}>{children}</Suspense> : <Navigate to="/" replace />
}

function App() {
  const [user,setUser]= useState(null)
  const [authChecked , setAuthChecked] = useState(false)
  const dispatch = useDispatch()


  useEffect(()=>{

    const getUser = async () => {
      try {
        const data = await getCurrentUser()
        setUser(data?.user || null)
      } finally {
        setAuthChecked(true)
      }
    }

    getUser()

  },[])

  useEffect(()=>{
    if (!user) return

    const getResumeData = async()=>{
      const result = await getResume()
      dispatch(setResume(result?.data))
    }

    getResumeData()

  },[user, dispatch])

  return (
   <>

	   <Routes>
	    <Route path='/' element={
	      authChecked && user ? <Navigate to="/dashboard" replace/> : <Home setUser={setUser}/>
	      }/>

	    <Route path='/dashboard' element={
	      <RequireAuth user={user} authChecked={authChecked}><Dashboard user={user} setUser={setUser}/></RequireAuth> }/>

	      <Route path='/scorer' element={
	      <RequireAuth user={user} authChecked={authChecked}><Scorer user={user} setUser={setUser}/></RequireAuth> }/>

	      <Route path='/resume' element={
	      <RequireAuth user={user} authChecked={authChecked}><ResumeBuilder user={user} setUser={setUser}/></RequireAuth> }/>

	      <Route path='/interview' element={
	      <RequireAuth user={user} authChecked={authChecked}><InterviewStart user={user} setUser={setUser}/></RequireAuth> }/>

	      <Route path='/interview/:id' element={
	      <RequireAuth user={user} authChecked={authChecked}><InterviewPage user={user} setUser={setUser}/></RequireAuth> }/>

	      <Route path='/interview/:id/report' element={
	      <RequireAuth user={user} authChecked={authChecked}><InterviewReport user={user} setUser={setUser}/></RequireAuth> }/>

	      <Route path='/roadmap' element={
	      <RequireAuth user={user} authChecked={authChecked}><Roadmap user={user} setUser={setUser}/></RequireAuth> }/>

	      <Route path='/billing' element={
	      <RequireAuth user={user} authChecked={authChecked}><Billing user={user} setUser={setUser}/></RequireAuth> }/>


   </Routes>
   </>
  )
}

export default App
