import { HeroSection } from "./components/HeroSection";
import { FunFactsSection } from "./components/FunFactsSection";
import { PortalFeaturedSections } from "./components/PortalFeaturedSections";
import { ClientTestimonialsSection } from "./components/ClientTestimonialsSection";

export const HomePage = () => {

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 py-8 lg:py-16">
        <HeroSection />
        <FunFactsSection />
      </div>

      <PortalFeaturedSections />
      <ClientTestimonialsSection />
    </div>
  );
};
