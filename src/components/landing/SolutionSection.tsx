import { FileEdit, Image as ImageIcon, Search, Users } from 'lucide-react';

// Import asset
import findlyMatchingNetwork from '../../assets/illustrations/findly-matching-network.png';

export function SolutionSection() {
  const features = [
    {
      icon: <FileEdit className="w-6 h-6 text-findlyBlue" />,
      bgIcon: 'bg-sky-50 border border-sky-100',
      title: 'Report Instantly',
      desc: 'Submit lost or found items in just a few taps.',
    },
    {
      icon: <ImageIcon className="w-6 h-6 text-findlyCyan" />,
      bgIcon: 'bg-cyan-50 border border-cyan-100',
      title: 'Upload Securely',
      desc: 'Add clear photos and details to help identify items.',
    },
    {
      icon: <Search className="w-6 h-6 text-indigo-500" />,
      bgIcon: 'bg-indigo-50 border border-indigo-100',
      title: 'Discover Matches',
      desc: 'Smart matching helps you find possible matches fast.',
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      bgIcon: 'bg-emerald-50 border border-emerald-100',
      title: 'Connect & Reunite',
      desc: 'We help connect owners with honest finders.',
    },
  ];

  return (
    <section id="solution" className="bg-findlyBg py-20 md:py-28 border-b border-findlyBorder relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-[640px] mx-auto mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-findlyTextPrimary mb-3">
            How FINDLY Solves It
          </h2>
          <p className="text-base sm:text-lg text-findlyTextSecondary font-semibold">
            A smarter way to report, discover, and recover.
          </p>
        </div>

        {/* Two-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Matching Network Illustration */}
          <div className="lg:col-span-6 flex justify-center items-center select-none animate-scale-in">
            <div className="relative w-full max-w-[500px] aspect-square flex justify-center items-center">
              <img
                src={findlyMatchingNetwork}
                alt="Findly Matching Network illustration showing connected items and student profile cards"
                className="w-full h-auto object-contain drop-shadow-xl"
                style={{ animation: 'float 7s ease-in-out infinite' }}
              />
            </div>
          </div>

          {/* Right Column: 4 Feature Cards */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-6 bg-white border border-findlyBorder rounded-3xl p-5 md:p-6 shadow-soft hover:shadow-premium hover:-translate-y-[2px] transition-all duration-300 group"
              >
                {/* Outline Icon in light colored border wrapper */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${feature.bgIcon} transition-transform duration-300 group-hover:scale-110`}>
                  {feature.icon}
                </div>

                {/* Details */}
                <div className="text-left">
                  <h3 className="text-lg font-extrabold text-findlyTextPrimary mb-1 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-findlyTextSecondary font-medium leading-normal">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
