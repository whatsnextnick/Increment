import { Link, Navigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { BlurFade } from '../components/magicui/blur-fade'
import { AnimatedGradientText } from '../components/magicui/animated-gradient-text'
import { ShimmerButton } from '../components/magicui/shimmer-button'
import { BorderBeam } from '../components/magicui/border-beam'
import { Button } from '../components/ui/Button'

const features = [
  { icon: '🏋', label: 'Log workouts', desc: 'Sets, reps, weight' },
  { icon: '📈', label: 'Track progress', desc: 'Charts & trends' },
  { icon: '🎯', label: 'Hit PRs', desc: 'Progressive overload' },
]

export default function HomePage() {
  const { session } = useSession()

  if (session) return <Navigate to="/dashboard" replace />

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-900 px-4">
      <div className="max-w-lg text-center">

        {/* Icon */}
        <BlurFade delay={0} duration={0.5}>
          <div className="mb-5 text-5xl">⚡</div>
        </BlurFade>

        {/* Heading */}
        <BlurFade delay={0.1} duration={0.5}>
          <h1 className="text-4xl font-extrabold sm:text-5xl leading-tight">
            <AnimatedGradientText
              colorFrom="#c4b5fd"
              colorTo="#22d3ee"
              speed={0.8}
              className="text-4xl font-extrabold sm:text-5xl"
            >
              Increm
            </AnimatedGradientText>
          </h1>
        </BlurFade>

        {/* Subheading */}
        <BlurFade delay={0.18} duration={0.5}>
          <p className="mt-4 text-lg text-surface-400">
            Track workouts, monitor progress, and hit new PRs.
            Built for lifters who take progressive overload seriously.
          </p>
        </BlurFade>

        {/* CTA Buttons */}
        <BlurFade delay={0.28} duration={0.5}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/auth/sign-up">
              <ShimmerButton className="h-12 px-7 text-base rounded-btn">
                Get started free
              </ShimmerButton>
            </Link>
            <Link to="/auth/sign-in">
              <Button size="lg" variant="secondary">Sign in</Button>
            </Link>
          </div>
        </BlurFade>

        {/* Feature cards */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          {features.map(({ icon, label, desc }, i) => (
            <BlurFade key={label} delay={0.36 + i * 0.08} duration={0.45}>
              <div className="relative rounded-card border border-surface-700 bg-surface-800 p-4">
                <div className="text-2xl">{icon}</div>
                <p className="mt-2 text-sm font-semibold text-slate-200">{label}</p>
                <p className="text-xs text-surface-400">{desc}</p>
                <BorderBeam
                  size={60}
                  duration={6 + i * 1.5}
                  delay={i * 1.2}
                  colorFrom="#8b5cf6"
                  colorTo="#22d3ee"
                  borderWidth={1}
                />
              </div>
            </BlurFade>
          ))}
        </div>

      </div>
    </div>
  )
}
