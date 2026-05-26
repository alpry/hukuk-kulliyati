import Link from 'next/link'
import { Notebook, GraduationCap, Star, ArrowRight } from 'lucide-react'
import HomeSearch from '@/components/HomeSearch'
import RecentMaddeler from '@/components/RecentMaddeler'

const quickAccess = [
  {
    label: 'Notlarıma Git',
    desc: 'Tüm notlarınızı tek yerden görüntüleyin',
    href: '/dashboard/notlar',
    Icon: Notebook,
  },
  {
    label: 'Sınav Modu',
    desc: 'Çoktan seçmeli, flashcard ve madde ezberleme',
    href: '/dashboard/sinav',
    Icon: GraduationCap,
  },
  {
    label: 'Favori Maddelerim',
    desc: 'Yıldızladığınız maddelere hızlı erişim',
    href: '/dashboard/favoriler',
    Icon: Star,
  },
]

export default function HomePage() {
  return (
    <div className="page-fade">
      <div className="max-w-2xl mx-auto pt-8 lg:pt-20">
        <div className="text-center mb-10">
          <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight">Hukuk Külliyatı</h1>
          <p className="text-[13px] text-muted mt-2.5">Madde, kavram veya doğal dil ile arayın.</p>
        </div>
        <HomeSearch />
      </div>

      <div className="max-w-4xl mx-auto mt-16 lg:mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickAccess.map(({ label, desc, href, Icon }) => (
            <Link
              key={label}
              href={href}
              className="group surface surface-hover p-5 flex flex-col gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[13px] font-semibold">{label}</p>
                <p className="text-[11px] text-subtle mt-1 leading-relaxed">{desc}</p>
              </div>
              <div className="mt-auto inline-flex items-center gap-1 text-[11px] text-[var(--primary)] opacity-60 group-hover:opacity-100 transition-opacity">
                Aç <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-14">
        <RecentMaddeler limit={8} />
      </div>
    </div>
  )
}
