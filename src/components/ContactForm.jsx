import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ContactForm() {
    const [status, setStatus] = useState('idle')

    const handleSubmit = (e) => {
        e.preventDefault()
        setStatus('sent')
        // Link to real logic later
    }

    return (
        <div className="card overflow-hidden border border-brand-blue/30 p-1 shadow-2xl bg-gradient-to-br from-brand-blue/30 via-transparent to-brand-orange/30">
            <div className="bg-brand-blue/10 backdrop-blur-xl rounded-[22px] p-8 sm:p-10">
                <h3 className="text-3xl font-black text-[#062d78]">Get BearTracks</h3>
                <p className="mt-2 text-[#083796] font-bold">
                    Partner with us to bring smart lost and found to your school.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest">Name</label>
                            <input
                                required
                                type="text"
                                placeholder="Samarth"
                                className="mt-2 input-field"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest">School Email</label>
                            <input
                                required
                                type="email"
                                placeholder="you@school.edu"
                                className="mt-2 input-field"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest">School Name</label>
                        <input
                            required
                            type="text"
                            placeholder="Bear Creek High"
                            className="mt-2 input-field"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest">Message</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Tell us about your school..."
                            className="mt-2 input-field resize-none"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={status === 'sent'}
                        className="mt-2 rounded-2xl bg-brand-blue px-6 py-4 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all disabled:opacity-50"
                    >
                        {status === 'sent' ? 'Message Sent! ✓' : 'Send Message'}
                    </motion.button>
                </form>
            </div>
        </div>
    )
}
