import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Import assets
import ctaBg from '../../assets/backgrounds/cta-banner-background.png';
import blackWallet from '../../assets/items/black-wallet.png';
import blueBackpack from '../../assets/items/blue-backpack.png';
import blueWaterBottle from '../../assets/items/blue-water-bottle.png';
import studentIdCard from '../../assets/items/student-id-card.png';

export function CTABanner() {
  return (
    <section id="cta" className="bg-white py-16 md:py-24 relative overflow-hidden select-none">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        {/* Banner Container */}
        <div className="relative rounded-[40px] overflow-hidden bg-findlyBlue/10 p-12 md:p-20 text-center flex flex-col items-center justify-center border border-sky-100 shadow-premium min-h-[380px] md:min-h-[460px]">
          {/* Main Banner Background Image */}
          <img
            src={ctaBg}
            alt="CTA Background"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-90"
          />

          {/* Floating Left: Blue Backpack */}
          <div
            className="absolute left-[4%] top-[15%] w-[16%] sm:w-[12%] lg:w-[10%] hidden xs:block z-10 pointer-events-none drop-shadow-xl"
            style={{
              animation: 'float 5s ease-in-out infinite',
              animationDelay: '0.2s',
            }}
          >
            <img src={blueBackpack} alt="Backpack" className="w-full h-auto object-contain transform -rotate-[15deg]" />
          </div>

          {/* Floating Mid-Left: Black Wallet */}
          <div
            className="absolute left-[16%] bottom-[12%] w-[12%] sm:w-[9%] lg:w-[7%] hidden sm:block z-10 pointer-events-none drop-shadow-lg"
            style={{
              animation: 'float 4.5s ease-in-out infinite',
              animationDelay: '1.5s',
            }}
          >
            <img src={blackWallet} alt="Wallet" className="w-full h-auto object-contain transform rotate-[10deg]" />
          </div>

          {/* Floating Right: Blue Water Bottle */}
          <div
            className="absolute right-[8%] top-[10%] w-[10%] sm:w-[7%] lg:w-[6%] hidden xs:block z-10 pointer-events-none drop-shadow-xl"
            style={{
              animation: 'float 6s ease-in-out infinite',
              animationDelay: '0.8s',
            }}
          >
            <img src={blueWaterBottle} alt="Water Bottle" className="w-full h-auto object-contain transform rotate-[20deg]" />
          </div>

          {/* Floating Far-Right: Student ID Card */}
          <div
            className="absolute right-[5%] bottom-[15%] w-[18%] sm:w-[14%] lg:w-[12%] hidden sm:block z-10 pointer-events-none drop-shadow-xl"
            style={{
              animation: 'float 5.5s ease-in-out infinite',
              animationDelay: '1.1s',
            }}
          >
            <img src={studentIdCard} alt="ID Card" className="w-full h-auto object-contain transform -rotate-[12deg]" />
          </div>

          {/* Content Wrapper */}
          <div className="relative z-20 max-w-[640px] mx-auto text-white flex flex-col items-center">
            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4 text-white drop-shadow-sm">
              Let's Bring Lost Items Back Home
            </h2>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl text-sky-100 font-semibold mb-8 max-w-[520px] leading-relaxed drop-shadow-sm">
              Join hundreds of students who trust Findly to keep campuses connected.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/signup"
                className="flex items-center justify-center gap-2 px-8 py-3.5 text-sm md:text-base font-bold text-findlyBlue bg-white hover:bg-sky-50 rounded-2xl shadow-md transition-all duration-200 hover:-translate-y-[2px] group"
              >
                Get Started
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-8 py-3.5 text-sm md:text-base font-bold text-white hover:text-sky-50 bg-white/10 hover:bg-white/20 border border-white/30 rounded-2xl transition-all duration-200 hover:-translate-y-[2px] backdrop-blur-sm group"
              >
                Learn More
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
