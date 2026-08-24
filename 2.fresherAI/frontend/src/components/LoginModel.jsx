import React from 'react'
import { FiX } from "react-icons/fi";
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import api from '../utils/axios';
import { BRAND_LOGO, BRAND_NAME } from '../utils/brand';
function LoginModel({ onClose ,setUser}) {

    const handleGoogleAuth = async () => {
        try {
            const result = await signInWithPopup(auth , provider)
            const token = await result.user.getIdToken()

            const response = await api.post("/api/auth/login" , {token})
          
            setUser(response?.data?.user)
            onClose()
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#071123]/45 backdrop-blur-md px-4'>
            <div className='relative w-full max-w-sm
        bg-[#071123]/90 backdrop-blur-2xl
        border border-[#6D35FF]/25
        rounded-2xl
        overflow-hidden
        shadow-[0_8px_32px_rgba(0,0,0,0.25)]'>

                <div className='absolute inset-x-0 top-0 h-px bg-[#8B5CF6]/70 pointer-events-none' />

                <div className='relative p-7'>
                    <button
                        onClick={onClose}
                        className='absolute top-4 right-4
              text-white/30 hover:text-white
              transition-colors'><FiX size={16} /></button>

                    <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#6D35FF]/20 bg-white shadow-[0_12px_32px_rgba(109,53,255,0.24)]'>
                        <img src={BRAND_LOGO} alt="" className='h-12 w-12 object-contain' />
                    </div>

                    <h2 className='text-lg font-bold text-center mb-2 text-white'>
                        Sign In to{" "}
                        <span className='font-extrabold text-lg tracking-tight text-white'>{BRAND_NAME}</span>
                    </h2>
                    <p className='text-white/45 text-center text-xs'>
                        Continue your AI interview journey
                    </p>

                    <div className='mt-7'>
                        <motion.button
                        onClick={handleGoogleAuth}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className='w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[#6D35FF]/25 bg-white/10 backdrop-blur-md hover:border-[#8B5CF6]/60 hover:bg-white/[0.14] shadow-inner transition-all'
                        >
                            <FcGoogle size={18}/>
                            <span className='text-white font-medium text-sm'>
                                Continue with Google
                            </span>


                        </motion.button>
                    </div>
                </div>

                <div className='relative border-t border-[#6D35FF]/20 bg-[#050B18]/60 p-4 text-center'>
                <p className='text-white/30 text-xs'>
                Secure authentication powered by Firebase
                </p>
                </div>




            </div>

        </div>
    )
}

export default LoginModel
