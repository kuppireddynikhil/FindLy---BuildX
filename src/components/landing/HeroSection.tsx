import { Link } from 'react-router-dom';
import { FileText, Search, GraduationCap, Lock, Zap } from 'lucide-react';

// Import assets
import mainHeroStudent from '../../assets/illustrations/main-hero-student.png';
import heroBg from '../../assets/backgrounds/hero-section-background.png';
import blackWallet from '../../assets/items/black-wallet.png';
import blueBackpack from '../../assets/items/blue-backpack.png';
import blueWaterBottle from '../../assets/items/blue-water-bottle.png';
import studentIdCard from '../../assets/items/student-id-card.png';
import heroLeaves from '../../assets/decorative/hero-decorative-leaves.png';

export function HeroSection() {
  return (
    <section id="hero" className="relative bg-findlyBg pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Decorative background grid elements if needed, otherwise the heroBg covers it */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-findlyBlue/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-findlyCyan/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Side: Copywriting & CTAs */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          {/* Platform Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200/50 text-sky-600 font-semibold text-xs md:text-sm mb-6 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-findlyBlue animate-pulse" />
            Smart Lost & Found Platform for Campuses
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-findlyTextPrimary leading-[1.1] mb-6 animate-fade-in-up stagger-1">
            Lost Today.
            <br />
            Found Tomorrow.
            <br />
            <span className="bg-gradient-to-r from-findlyBlue to-findlyCyan bg-clip-text text-transparent">
              We Connect.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-findlyTextSecondary font-medium leading-relaxed mb-8 max-w-[540px] animate-fade-in-up stagger-2">
            Findly helps students report lost items, discover matches, and recover belongings faster with a secure campus-wide platform.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 w-full sm:w-auto mb-12 animate-fade-in-up stagger-3">
            <Link
              to="/report/lost"
              className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm md:text-base font-bold text-white bg-findlyBlue hover:bg-findlyBlue/95 rounded-2xl shadow-md transition-all duration-200 hover:-translate-y-[2px]"
            >
              <FileText size={18} />
              Report Lost Item
            </Link>
            <Link
              to="/search"
              className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm md:text-base font-bold text-findlyTextSecondary hover:text-findlyBlue bg-white border border-findlyBorder hover:border-findlyBlue/30 rounded-2xl shadow-sm transition-all duration-200 hover:-translate-y-[2px]"
            >
              <Search size={18} />
              Explore Platform
            </Link>
          </div>

          {/* Feature Strip */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 border-t border-slate-200 pt-8 w-full max-w-[560px] animate-fade-in-up stagger-4">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
                <GraduationCap size={18} />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-findlyTextPrimary leading-none mb-1">Campus Friendly</p>
                <p className="text-[10px] sm:text-xs text-findlyTextSecondary">Built for students</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-xl text-findlyBlue">
                <Lock size={18} />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-findlyTextPrimary leading-none mb-1">Secure</p>
                <p className="text-[10px] sm:text-xs text-findlyTextSecondary">Your data is safe</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="p-2 bg-sky-50 rounded-xl text-sky-500">
                <Zap size={18} />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-findlyTextPrimary leading-none mb-1">Fast Reporting</p>
                <p className="text-[10px] sm:text-xs text-findlyTextSecondary">Report in seconds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Layered Asset Visuals */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px] md:min-h-[560px] w-full select-none animate-scale-in">
          {/* Section Background Grid */}
          <img
            src={heroBg}
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
          />

          {/* Decorative Leaves */}
          <img
            src={heroLeaves}
            alt="Leaves Decoration"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
          />

          {/* Main Hero Student Illustration */}
          <div className="relative z-20 w-[60%] xs:w-[50%] sm:w-[45%] md:w-[48%] lg:w-[65%] xl:w-[60%] flex justify-center items-center">
            <img
              src={mainHeroStudent}
              alt="Student carrying backpack looking at phone"
              className="w-full h-auto object-contain drop-shadow-lg"
              style={{ animation: 'float 6s ease-in-out infinite' }}
            />
          </div>

          {/* Floating Asset 1: Blue Backpack */}
          <div
            className="absolute top-[8%] right-[10%] w-[18%] sm:w-[15%] md:w-[14%] z-30 pointer-events-none drop-shadow-xl"
            style={{
              animation: 'float 5s ease-in-out infinite',
              animationDelay: '1.2s',
            }}
          >
            <img src={blueBackpack} alt="Blue Backpack" className="w-full h-auto object-contain transform rotate-[12deg]" />
          </div>

          {/* Floating Asset 2: Black Wallet */}
          <div
            className="absolute top-[12%] left-[10%] w-[15%] sm:w-[13%] md:w-[12%] z-30 pointer-events-none drop-shadow-xl"
            style={{
              animation: 'float 5.5s ease-in-out infinite',
              animationDelay: '0.4s',
            }}
          >
            <img src={blackWallet} alt="Black Wallet" className="w-full h-auto object-contain transform -rotate-[15deg]" />
          </div>

          {/* Floating Asset 3: Blue Water Bottle */}
          <div
            className="absolute bottom-[20%] right-[6%] w-[12%] sm:w-[10%] md:w-[9%] z-30 pointer-events-none drop-shadow-xl"
            style={{
              animation: 'float 4.5s ease-in-out infinite',
              animationDelay: '2s',
            }}
          >
            <img src={blueWaterBottle} alt="Blue Water Bottle" className="w-full h-auto object-contain transform rotate-[8deg]" />
          </div>

          {/* Floating Asset 4: Student ID Card */}
          <div
            className="absolute bottom-[18%] left-[8%] w-[20%] sm:w-[18%] md:w-[16%] lg:w-[22%] xl:w-[18%] z-30 pointer-events-none drop-shadow-xl"
            style={{
              animation: 'float 5.8s ease-in-out infinite',
              animationDelay: '1.7s',
            }}
          >
            <img src={studentIdCard} alt="Student ID Card" className="w-full h-auto object-contain transform -rotate-[10deg]" />
          </div>

          {/* Floating Search Icon Graphic for visual depth */}
          <div
            className="absolute top-[28%] right-[22%] bg-white/95 border border-findlyBorder rounded-full p-3 shadow-premium z-30 flex items-center justify-center animate-bounce"
            style={{
              animationDuration: '3.5s',
              animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Search className="w-5 h-5 text-findlyBlue" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </section>
  );
}
