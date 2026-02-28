import { useEffect, useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PlatformSection from './components/PlatformSection';
import FeaturesSection from './components/FeaturesSection';
import HardwareSection from './components/HardwareSection';
import EcosystemSection from './components/EcosystemSection';
import OpenSourceSection from './components/OpenSourceSection';
import PartnersSection from './components/PartnersSection';
import Footer from './components/Footer';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header scrolled={scrolled} />
      <HeroSection />
      <PlatformSection />
      <FeaturesSection />
      <HardwareSection />
      <EcosystemSection />
      <OpenSourceSection />
      <PartnersSection />
      <Footer />
    </div>
  );
}
