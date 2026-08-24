import React from 'react'
import { motion } from "motion/react"
function Statbox({ label, value, sub, subHighlight, index = 0, icon, accent = "bg-black" }) {
  return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.4, delay: index * 0.08 }}

      whileHover={{ y: -4 }}
    className='relative overflow-hidden bg-white border border-black/8 rounded-xl p-3.5 md:p-4 flex flex-col gap-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:border-black/16 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)] transition-all'>

        <div className={`absolute left-0 top-0 h-full w-1 ${accent}`} />

        <div className='relative flex items-center justify-between gap-3'>
          <p className='text-black/40 text-[9px] md:text-[11px] font-semibold uppercase tracking-widest'>{label}</p>
          {icon && (
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-black/[0.04] text-black/55'>
              {icon}
            </div>
          )}
        </div>

        <p className='relative text-[#0A0A0A] text-2xl md:text-3xl font-black tracking-tight'>{value}</p>

        {sub && (
            <div className='relative flex items-center gap-1 mt-0.5 flex-wrap'>
                {subHighlight && (
                    <div className='text-[9px] font-semibold bg-[#0B1630] text-white px-1.5 py-0.5 rounded'>{subHighlight}</div>
                )}

                <span className='text-black/35 text-[9px] md:text-[11px]'>{sub}</span>

            </div>
        )}


    </motion.div>
  )
}

export default Statbox
