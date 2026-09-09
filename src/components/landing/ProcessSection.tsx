import { ClipboardList, UploadCloud, Search, Gift } from 'lucide-react';

export function ProcessSection() {
  const steps = [
    {
      number: 1,
      icon: <ClipboardList className="w-6 h-6 text-findlyBlue" />,
      title: 'Report Item',
      desc: 'Choose lost or found and provide basic details.',
    },
    {
      number: 2,
      icon: <UploadCloud className="w-6 h-6 text-findlyBlue" />,
      title: 'Upload Details',
      desc: 'Add photos, location, and description to help identify it.',
    },
    {
      number: 3,
      icon: <Search className="w-6 h-6 text-findlyBlue" />,
      title: 'Find Matches',
      desc: 'Our system matches your item with similar reports.',
    },
    {
      number: 4,
      icon: <Gift className="w-6 h-6 text-findlyBlue" />,
      title: 'Recover Belongings',
      desc: 'Connect with the finder or owner and reclaim your item.',
    },
  ];

  return (
    <section id="process" className="bg-findlyBg py-20 md:py-28 border-b border-findlyBorder relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-[640px] mx-auto mb-20 md:mb-28">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-findlyTextPrimary">
            Recover Items In Four Simple Steps
          </h2>
        </div>

        {/* Timeline Stepper Container */}
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-6 w-full max-w-[1200px] mx-auto">
          {/* Horizontal Connecting Line (Desktop Only) */}
          <div className="absolute top-[52px] left-[10%] right-[10%] h-[2px] border-t-2 border-dashed border-sky-200 z-0 hidden lg:block" />

          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center text-center z-10 w-full max-w-[280px] group"
            >
              {/* Step Circle with Number Badge */}
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white border-2 border-sky-100 shadow-premium transition-transform duration-300 group-hover:scale-105 mb-6">
                {/* Number Badge */}
                <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-findlyBlue text-white text-xs font-extrabold border-2 border-white shadow-sm">
                  {step.number}
                </span>

                {/* Inner Circle / Icon */}
                <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center">
                  {step.icon}
                </div>
              </div>

              {/* Step Title */}
              <h3 className="text-lg md:text-xl font-extrabold text-findlyTextPrimary mb-2 leading-tight">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-sm md:text-base text-findlyTextSecondary leading-relaxed font-semibold">
                {step.desc}
              </p>

              {/* Vertical Connecting Line (Mobile Only - except last) */}
              {idx < steps.length - 1 && (
                <div className="absolute top-[120px] bottom-[-48px] w-[2px] border-l-2 border-dashed border-sky-200 z-0 lg:hidden" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
