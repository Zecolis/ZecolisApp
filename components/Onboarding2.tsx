import React from 'react';
import OnboardingView from './OnboardingView';
import onboardingImage from '../assets/Onboarding2.jpeg';

interface Onboarding2Props {
  onNext: () => void;
  onSkip: () => void;
}

const Onboarding2: React.FC<Onboarding2Props> = ({ onNext, onSkip }) => {
  return (
    <OnboardingView
      step={2}
      eyebrow="Voyagez. Gagnez."
      title={
        <>
          Voyagez.
          <br />
          <span className="text-[#FF6B00]">Gagnez.</span>
        </>
      }
      subtitle="Publiez votre trajet et recevez des colis en toute sécurité."
      backgroundImage={onboardingImage}
      backgroundPosition="center 52%"
      chips={["20 kg disponibles", "Paris → Cotonou", "Paiement sécurisé"]}
      ctaLabel="Suivant"
      onNext={onNext}
      onSkip={onSkip}
    />
  );
};

export default Onboarding2;
