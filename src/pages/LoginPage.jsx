import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Container from '../components/Container.jsx'
import Section from '../components/Section.jsx'
import MotionReveal from '../components/MotionReveal.jsx'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * LoginPage
 * ---------
 * Supabase authentication login.
 */

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from || '/'

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate(from)
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero pt-8">
      <Section className="py-8 sm:py-12">
        <Container>
          <div className="mx-auto max-w-[440px]">
            <MotionReveal>
              <h1 className="text-4xl font-black tracking-tight text-[#062d78] text-center">Log in</h1>
              <p className="mt-3 text-base text-[#083796] font-bold text-center">
                Welcome back to BearTracks. Please enter your credentials.
              </p>
            </MotionReveal>

            <MotionReveal delay={0.1}>
              <div className="mt-10 card overflow-hidden border border-brand-blue/30 p-1 shadow-2xl bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-gold/15">
                <div className="bg-brand-blue/5 backdrop-blur-xl rounded-[22px] p-8 sm:p-10">
                  <form onSubmit={onSubmit} className="grid gap-6">
                    <div>
                      <label className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest">Email</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        placeholder="you@school.edu"
                        className="mt-2 input-field"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-xs font-black text-[#062d78] uppercase tracking-widest">Password</label>
                      </div>
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                        placeholder="••••••••"
                        className="mt-2 input-field"
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100"
                      >
                        {error}
                      </motion.div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className="mt-2 rounded-2xl bg-brand-blue px-6 py-4 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all disabled:opacity-50"
                    >
                      {loading ? 'Logging in...' : 'Log in'}
                    </motion.button>

                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                    </div>

                    <p className="text-sm text-[#062d78] font-bold text-center">
                      Don’t have an account?{' '}
                      <Link to="/signup" className="font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors duration-300">
                        Sign up
                      </Link>
                    </p>
                  </form>
                </div>
              </div>
            </MotionReveal>
          </div>
        </Container>
      </Section>
    </div>
  )
}
