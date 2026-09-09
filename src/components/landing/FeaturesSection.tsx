import { Search, Image as ImageIcon, Bell, ShieldCheck, Users, Zap } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Search className="w-6 h-6 text-findlyBlue" />,
      bgIcon: 'bg-sky-50',
      title: 'Smart Search',
      desc: 'Search by category, location, and keywords to find items quickly.',
    },
    {
      icon: <ImageIcon className="w-6 h-6 text-findlyCyan" />,
      bgIcon: 'bg-cyan-50',
      title: 'Photo-Based Reports',
      desc: 'Add images to improve chances of accurate identification.',
    },
    {
      icon: <Bell className="w-6 h-6 text-indigo-500" />,
      bgIcon: 'bg-indigo-50',
      title: 'Real-Time Updates',
      desc: 'Get instant notifications when a matching item is found.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
      bgIcon: 'bg-blue-50',
      title: 'Secure Authentication',
      desc: 'Protect your account and personal data with strong security.',
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      bgIcon: 'bg-emerald-50',
      title: 'Campus Collaboration',
      desc: 'Built for campuses to create a trustworthy community.',
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      bgIcon: 'bg-amber-50',
      title: 'Fast Recovery',
      desc: 'Simplified process helps return items to owners faster.',
    },
  ];

  return (
    <section id="features" className="bg-white py-20 md:py-28 border-b border-findlyBorder relative overflow-hidden">
      {/* Subtle backgrounds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-50/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-50/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-[720px] mx-auto mb-16 md:mb-24">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-findlyTextPrimary leading-tight">
            Everything{' '}
            <span className="bg-gradient-to-r from-findlyBlue to-findlyCyan bg-clip-text text-transparent">
              You Need
            </span>{' '}
            To Recover Lost Items Faster
          </h2>
        </div>

        {/* 3x2 Grid of Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-start text-left bg-white border border-findlyBorder rounded-3xl p-6 sm:p-8 shadow-soft hover:shadow-premium hover:-translate-y-1 hover:border-slate-300/40 transition-all duration-300 group"
            >
              {/* Circular Icon Wrapper */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feature.bgIcon} mb-6 transition-transform duration-300 group-hover:scale-110`}>
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-bold text-findlyTextPrimary mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm md:text-base text-findlyTextSecondary leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
