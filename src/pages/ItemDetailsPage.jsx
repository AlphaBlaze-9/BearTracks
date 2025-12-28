import { Link, useParams } from 'react-router-dom'
import Container from '../components/Container.jsx'
import Section from '../components/Section.jsx'
import MotionReveal from '../components/MotionReveal.jsx'
import { useItems } from '../context/ItemsContext.jsx'

/**
 * ItemDetailsPage
 * ---------------
 * One item, bigger photo, and the full details.
 */

export default function ItemDetailsPage() {
  const { id } = useParams()
  const { getItem } = useItems()
  const item = getItem(id)

  if (!item) {
    return (
      <div className="min-h-screen bg-hero">
        <Section className="pt-24 pb-12">
          <Container>
            <MotionReveal>
              <div className="mx-auto max-w-md card p-12 text-center bg-brand-blue/10 backdrop-blur-3xl border border-brand-blue/30 shadow-2xl rounded-[3rem]">
                <div className="text-6xl mb-6 text-slate-300">🔎</div>
                <h2 className="text-3xl font-black text-[#062d78] tracking-tight">Item not found</h2>
                <p className="mt-3 text-[#083796] font-bold">
                  This item may have been removed or the link is incorrect.
                </p>
                <Link
                  to="/browse"
                  className="mt-8 inline-flex rounded-2xl bg-brand-blue px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all"
                >
                  Back to browse
                </Link>
              </div>
            </MotionReveal>
          </Container>
        </Section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hero">
      <Section className="pt-16 sm:pt-20 pb-10">
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            {/* Left Column: Image */}
            <div className="w-full lg:w-[42%]">
              <MotionReveal>
                <Link to="/browse" className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-2xl bg-brand-blue/15 backdrop-blur-md border border-brand-blue/30 text-xs font-black text-[#062d78] shadow-lg hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all group w-fit">
                  <span className="transform transition-transform group-hover:-translate-x-1 text-lg leading-none">←</span>
                  <span>Back to browse</span>
                </Link>
                <div className="card overflow-hidden border border-brand-blue/20 shadow-2xl bg-brand-blue/10 backdrop-blur-xl p-2.5">
                  <div className="aspect-[4/5] w-full rounded-[1.75rem] overflow-hidden bg-brand-blue/5">
                    {item.imageDataUrl ? (
                      <img src={item.imageDataUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100">
                        <div className="text-center grayscale opacity-30">
                          <div className="text-8xl">📦</div>
                          <div className="mt-4 text-sm font-bold uppercase tracking-widest">No photo uploaded</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </MotionReveal>
            </div>

            {/* Right Column: Details */}
            <div className="w-full lg:w-[54%] pt-2 lg:pt-8">
              <MotionReveal delay={0.1}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={
                      'rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] shadow-sm ' +
                      (item.status === 'Found'
                        ? 'bg-green-500 text-white shadow-green-500/20'
                        : 'bg-brand-blue text-white shadow-brand-blue/20')
                    }
                  >
                    {item.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">ID: #{item.id.toString().slice(-6)}</span>
                </div>

                <h1 className="text-4xl font-black tracking-tight text-[#062d78] sm:text-5xl">{item.title}</h1>
                <p className="mt-4 text-base text-[#083796] font-bold leading-relaxed">{item.description}</p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.75rem] border border-brand-blue/20 bg-brand-blue/10 backdrop-blur-xl p-5 shadow-lg">
                    <div className="text-[10px] font-black text-[#01143a]/40 uppercase tracking-widest">Category</div>
                    <div className="mt-1 text-xl font-black text-[#062d78]">{item.category || 'Other'}</div>
                  </div>

                  {(item.location || item.date) && (
                    <div className="sm:col-span-2 rounded-[1.75rem] border border-brand-blue/20 bg-brand-blue/10 backdrop-blur-xl p-5 shadow-lg">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Extra details</div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {item.location && (
                          <div className="flex items-start gap-3">
                            <div className="mt-1 h-5 w-5 bg-brand-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <div className="h-2 w-2 bg-brand-blue rounded-full" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-[#01143a]/40 uppercase tracking-[0.05em]">Location</span>
                              <span className="text-[#062d78] font-black">{item.location}</span>
                            </div>
                          </div>
                        )}
                        {item.date && (
                          <div className="flex items-start gap-3">
                            <div className="mt-1 h-5 w-5 bg-brand-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <div className="h-2 w-2 bg-brand-orange rounded-full" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-[#01143a]/40 uppercase tracking-[0.05em]">Date</span>
                              <span className="text-[#062d78] font-black">{item.date}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 p-1 rounded-[1.75rem] bg-gradient-to-r from-brand-blue via-brand-orange to-brand-blue shadow-2xl shadow-brand-blue/20 group overflow-hidden relative">
                  <div className="bg-brand-blue/5 backdrop-blur-3xl rounded-[1.5rem] p-6 transition-all group-hover:bg-transparent">
                    <h3 className="text-lg font-black text-[#062d78] group-hover:text-white transition-colors">Want to claim this?</h3>
                    <p className="mt-1.5 text-sm text-[#083796] font-bold group-hover:text-white/90 transition-colors">
                      We’re working on a secure messaging feature. For now, please check with your school’s main office or lost & found center.
                    </p>
                  </div>
                </div>
              </MotionReveal>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
