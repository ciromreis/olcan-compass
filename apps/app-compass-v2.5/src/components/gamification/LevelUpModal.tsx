'use client'

import { useState, useEffect } from 'react'
import { X, Trophy } from 'lucide-react'

interface LevelUpModalProps {
  newLevel: number
  levelTitle: string
  onClose: () => void
}

export function LevelUpModal({ newLevel, levelTitle, onClose }: LevelUpModalProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setShow(true))
    const timer = setTimeout(() => handleClose(), 6000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClose = () => { setShow(false); setTimeout(onClose, 400) }

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity duration-400" onClick={handleClose} style={{ opacity: show ? 1 : 0 }} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative rounded-[2rem] bg-white shadow-2xl p-10 max-w-md w-full text-center transition-all duration-400"
          onClick={(e) => e.stopPropagation()}
          style={{ opacity: show ? 1 : 0, transform: show ? 'scale(1)' : 'scale(0.9)' }}>
          <button onClick={handleClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
            <Trophy className="h-10 w-10 text-brand-500" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-950 mb-2">Novo nivel!</h2>
          <div className="rounded-2xl bg-slate-50 p-5 mb-5">
            <p className="text-sm text-slate-500 mb-1">Voce alcancou</p>
            <p className="text-3xl font-bold text-slate-950 mb-1">Nivel {newLevel}</p>
            <p className="text-lg font-semibold text-brand-600">{levelTitle}</p>
          </div>
          <button onClick={handleClose} className="w-full rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
            Continuar
          </button>
        </div>
      </div>
    </>
  )
}
