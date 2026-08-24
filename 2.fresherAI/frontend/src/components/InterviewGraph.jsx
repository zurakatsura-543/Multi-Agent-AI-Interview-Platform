import React from 'react'
import { motion } from "motion/react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

function CustomTooltip({ active, payload }) {
    if (active && payload?.length) {
        return (
            <div className='bg-white/95 backdrop-blur-xl border border-black/10 rounded-lg px-2.5 py-1.5 text-[11px] text-[#0A0A0A] shadow-2xl'>
                <p className="text-black/40 mb-0.5">{payload[0]?.payload?.skill}</p>
                <p className="font-bold text-[#0A0A0A]">{payload[0]?.value}%</p>

            </div>
        )
    }
}
function RadarCard({ title, data, color, index }) {
    return (

        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -4 }}
            className='relative overflow-hidden bg-white border border-black/8 rounded-xl p-3 md:p-4
                 flex flex-col shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:border-black/16 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)] transition-all'>
            <div className='absolute inset-x-0 top-0 h-1 bg-[#6D35FF]' />

            <div className='relative'>
                <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={data} cx="50%" cy="50%" outerRadius="68%">
                        <PolarGrid stroke="rgba(10,10,10,0.08)" gridType="circle" />
                        <PolarAngleAxis dataKey="skill"
                            tick={{ fill: "rgba(10,10,10,0.45)", fontSize: 9, fontWeight: 600 }} />
                        <Radar
                            name={title}
                            dataKey="score"
                            stroke={color}
                            fill={color}
                            fillOpacity={0.15}
                            strokeWidth={2}
                            dot={{ r: 2.5, fill: color, strokeWidth: 0 }} />
                        <Tooltip content={<CustomTooltip/>}/>
                    </RadarChart>
                </ResponsiveContainer>
                <p className='text-[#0A0A0A] font-bold text-xs text-center mt-2'>
                    {title}
                </p>
            </div>

        </motion.div>

    )
}

function InterviewGraph({ technicalData, hrData, technicalCount, hrCount }) {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
            <RadarCard title={`Technical Interviews (${technicalCount})`}
                data={technicalData} color="#6D35FF" index={0}
            />
            <RadarCard title={`HR Interviews (${hrCount})`}
                data={hrData} color="#0B1630" index={1}
            />

        </div>
    )
}

export default InterviewGraph
