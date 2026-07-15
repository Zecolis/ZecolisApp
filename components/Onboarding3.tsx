import React from 'react';
import OnboardingView from './OnboardingView';
import onboardingImage from '../assets/onboarding 3.jpeg';

interface Onboarding3Props {
  onNext: () => void;
  onSkip: () => void;
}

const Onboarding3: React.FC<Onboarding3Props> = ({ onNext, onSkip }) => {
  return (
    <OnboardingView
      step={3}
      eyebrow="Confiance totale"
      title={
        <>
          La confiance
          <br />
          <span className="text-[#FF6B00]">d’abord.</span>
        </>
      }
      subtitle="Profils vérifiés, avis transparents et protection à chaque étape."
      backgroundImage={onboardingImage}
      backgroundPosition="center 42%"
      chips={["Vérifiés", "Transparents", "Assurés"]}
      ctaLabel="Commencer"
      onNext={onNext}
      onSkip={onSkip}
    />
  );
};

export default Onboarding3;
