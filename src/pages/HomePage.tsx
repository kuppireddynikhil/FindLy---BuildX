import { HeroSection } from '../components/landing/HeroSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { SolutionSection } from '../components/landing/SolutionSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { ProcessSection } from '../components/landing/ProcessSection';
import { CTABanner } from '../components/landing/CTABanner';

export function HomePage() {
  return (
    <div className="bg-findlyBg text-findlyTextPrimary font-sans antialiased selection:bg-findlyBlue/20 overflow-x-hidden min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <ProcessSection />
      <CTABanner />
    </div>
  );
}
