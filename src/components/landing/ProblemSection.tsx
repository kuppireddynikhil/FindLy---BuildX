// Import assets
import hardToRecover from '../../assets/illustrations/hard-to-recover-illustration.png';
import noCentralSystem from '../../assets/illustrations/no-central-system.png';
import wordOfMouth from '../../assets/illustrations/word-of-mouth.png';
import unclaimedItemsBox from '../../assets/illustrations/unclaimed-items-box.png';

export function ProblemSection() {
  const cards = [
    {
      image: hardToRecover,
      title: 'Hard to Recover',
      desc: 'Lost belongings are difficult to find with no proper system in place.',
    },
    {
      image: noCentralSystem,
      title: 'No Central System',
      desc: "There's no single platform for reporting and tracking lost items.",
    },
    {
      image: wordOfMouth,
      title: 'Rely on Word of Mouth',
      desc: 'Students depend on friends, class groups, and notices with limited reach.',
    },
    {
      image: unclaimedItemsBox,
      title: 'Items Go Unclaimed',
      desc: 'Many valuable items never find their owners and remain unclaimed.',
    },
  ];

  return (
    <section id="problem" className="bg-white py-20 md:py-28 border-b border-findlyBorder relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-red-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-amber-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-[640px] mx-auto mb-16 md:mb-24 flex flex-col items-center">
          <span className="text-xs md:text-sm font-bold tracking-widest text-findlyBlue uppercase mb-3">
            The Problem
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-findlyTextPrimary mb-4">
            Losing something is stressful.
            <br />
            <span className="text-slate-400">Finding it shouldn't be.</span>
          </h2>
        </div>

        {/* 2x2 Grid of Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-center text-center bg-findlyBg border border-findlyBorder rounded-3xl p-6 sm:p-8 shadow-soft transition-all duration-300 hover:shadow-premium hover:-translate-y-1 hover:border-slate-300/40 group"
            >
              {/* Illustration Wrapper */}
              <div className="w-full aspect-[4/3] flex items-center justify-center mb-8 overflow-hidden rounded-2xl bg-white p-3 border border-slate-100 shadow-sm relative">
                <img
                  src={card.image}
                  alt={card.title}
                  className="max-h-[140px] w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-bold text-findlyTextPrimary mb-3 leading-tight">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-sm md:text-base text-findlyTextSecondary leading-relaxed font-medium">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
