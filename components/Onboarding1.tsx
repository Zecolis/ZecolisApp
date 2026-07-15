import React from 'react';
import OnboardingView from './OnboardingView';
import onboardingImage from '../assets/Onboarding1.jpeg';

interface Onboarding1Props {
  onNext: () => void;
  onSkip: () => void;
}

const Onboarding1: React.FC<Onboarding1Props> = ({ onNext, onSkip }) => {
  return (
    <OnboardingView
      step={1}
      eyebrow="France → Bénin"
      title={
        <>
          Envoyez
          <br />
          <span className="text-[#FF6B00]">moins cher.</span>
        </>
      }
      subtitle="Trouvez un voyageur fiable et envoyez vos colis simplement."
      backgroundImage={onboardingImage}
      backgroundPosition="center 58%"
      chips={["Voyageurs fiables", "Prix doux", "Envoi simple"]}
      ctaLabel="Suivant"
      onNext={onNext}
      onSkip={onSkip}
    />
  );
};

export default Onboarding1;
