"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 })
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    // Check if it's a touch device
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches)
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)
    
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    if (!isMobile) {
      window.addEventListener("mousemove", updateMousePosition)
    }

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("mousemove", updateMousePosition)
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <>
      {/* Outer tracking ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-primary/60 rounded-full pointer-events-none z-9999 flex items-center justify-center bg-primary/5 backdrop-blur-[1px]"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 25,
          mass: 0.5,
        }}
      >
        {/* Optical crosshairs */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-1.5 h-0.5 bg-primary/90" />
        <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-1.5 h-0.5 bg-primary/90" />
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-0.5 h-1.5 bg-primary/90" />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0.5 h-1.5 bg-primary/90" />
      </motion.div>

      {/* Inner precise dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-primary rounded-full pointer-events-none z-10000 shadow-[0_0_10px_var(--primary)] shadow-primary/40"
        animate={{
          x: mousePosition.x - 3,
          y: mousePosition.y - 3,
        }}
        transition={{
          type: "spring",
          stiffness: 1000,
          damping: 40,
        }}
      />
    </>
  )
}
