'use client'

import { motion } from 'framer-motion'
import { LogIn, User } from 'lucide-react'
import { setUserData } from '../utils/auth'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { isAuthenticated } from '../utils/auth'

export default function LabInventoryLoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to inventory if already authenticated
    if (isAuthenticated()) {
      router.push('/inventory')
    }
  }, [router])

  const handleGuestLogin = () => {
    try {
      const guestData = {
        name: 'Guest User',
        roll: 'guest',
        department: 'Guest',
        degree: 'Guest',
        passing_year: new Date().getFullYear(),
        isAdmin: false,
        lastLogin: new Date().toISOString()
      }
      setUserData(guestData)
      router.push('/inventory')
    } catch (error) {
      console.error('Error during guest login:', error)
      alert('Failed to login as guest. Please try again.')
    }
  }

  return (
    <div className='min-h-[90vh] flex items-center justify-center'>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute inset-0 bg-repeat"
          style={{ backgroundImage: 'url("/img/doraemon-pattern-light.png")', backgroundSize: '100px' }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        className="relative bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-xl w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Pocket Circle */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-[var(--doraemon-blue)] rounded-full shadow-lg">
          <motion.img
            src="/img/welcome.gif"
            alt="Doraemon"
            className='rounded-full'
          />
        </div>

        {/* Content */}
        <div className="mt-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Tech Inventory Portal
          </h1>

          {/* Login Button */}
          <motion.a
            className="group relative overflow-hidden bg-[var(--doraemon-blue)] hover:bg-[var(--doraemon-dark-blue)] text-white px-8 py-3 rounded-xl inline-flex items-center justify-center w-full font-medium transition-colors"
            href={`${process.env.NEXT_PUBLIC_SSO_URL}/project/${process.env.NEXT_PUBLIC_SSO_PROJECT_ID}/ssocall`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogIn className="w-5 h-5 mr-2" />
            Login with SSO
          </motion.a>

          {/* Guest Login Button */}
          <motion.button
            className="group relative overflow-hidden bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl inline-flex items-center justify-center w-full font-medium transition-colors mt-4"
            onClick={handleGuestLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <User className="w-5 h-5 mr-2" />
            Continue as Guest
          </motion.button>

          {/* Footer */}
          <div className="mt-8 text-sm text-gray-500">
            <p>Guest users have limited access to inventory features</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
