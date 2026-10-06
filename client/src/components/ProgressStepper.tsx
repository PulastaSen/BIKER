import { Bike, Wrench, MapPin, ClipboardCheck, Check } from 'lucide-react';

type ProgressStepperProps = { step: number };

const STEPS = [
  { icon: Bike, title: 'Choose Your Bike', desc: 'Select your motorcycle', short: 'BIKE' },
  { icon: Wrench, title: 'Tell Us the Problem', desc: 'Select what happened', short: 'PROBLEM' },
  { icon: MapPin, title: 'Share Your Location', desc: 'Help support find you', short: 'LOCATION' },
  { icon: ClipboardCheck, title: 'Review & Request', desc: 'Confirm & dispatch help', short: 'REVIEW' },
];

export function ProgressStepper({ step }: ProgressStepperProps) {
  const currentStep = STEPS[step - 1];
  const progressPercent = Math.round((step / STEPS.length) * 100);

  return (
    <nav className="stepper-horizontal-cards" aria-label={`Assistance Progress: Step ${step} of 4: ${currentStep.title}`}>
      {/* Mobile-Native Compact Progress Bar (Shown <= 768px) */}
      <div className="stepper-mobile-compact" role="status">
        <div className="stepper-mobile-compact__header">
          <div className="stepper-mobile-step-pill">
            <span>STEP {step} / {STEPS.length}</span>
          </div>
          <strong className="stepper-mobile-title">{currentStep.title}</strong>
          <span className="stepper-mobile-percent">{progressPercent}%</span>
        </div>

        {/* Fluid Native Progress Bar */}
        <div className="stepper-mobile-track" aria-hidden="true">
          <div 
            className="stepper-mobile-fill" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>

        {/* Micro Step Icons Row for Instant Recognition */}
        <div className="stepper-mobile-dots" aria-hidden="true">
          {STEPS.map((s, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < step;
            const isCurrent = stepNum === step;
            const StepIcon = s.icon;

            return (
              <div 
                key={s.short}
                className={`stepper-micro-dot ${isCurrent ? 'is-current' : ''} ${isCompleted ? 'is-completed' : ''}`}
                title={s.title}
              >
                {isCompleted ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  <StepIcon size={12} />
                )}
                <span className="stepper-micro-label">{s.short}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Visual Step Banner */}
      <div className="stepper-guidance-banner" role="status">
        <span className="stepper-guidance-pill">STEP {step} OF 4</span>
        <strong className="stepper-guidance-label">{currentStep.title}</strong>
        <span className="stepper-guidance-sub">— Follow the steps below to dispatch roadside help</span>
      </div>

      {/* Desktop Cards Sequence (Hidden on Mobile) */}
      <div className="stepper-cards-row">
        {STEPS.map((s, index) => {
          const Icon = s.icon;
          const stepNum = index + 1;
          const isActive = stepNum === step;
          const isComplete = stepNum < step;

          return (
            <div
              className={`stepper-card-wrapper ${isActive ? 'is-current' : ''} ${isComplete ? 'is-complete' : ''} ${
                stepNum > step ? 'is-upcoming' : ''
              }`}
              key={s.short}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Connector line between steps */}
              {index < STEPS.length - 1 && (
                <div
                  className={`stepper-connector ${isComplete ? 'stepper-connector--filled' : ''}`}
                  aria-hidden="true"
                />
              )}

              <div className="stepper-card premium-card">
                <div className="stepper-card__header">
                  <div className="stepper-card__icon-badge">
                    {isComplete ? (
                      <Check size={20} strokeWidth={3} className="text-complete-icon" />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                  <span className="stepper-card__number">
                    {isComplete ? 'DONE' : `0${stepNum}`}
                  </span>
                </div>

                <div className="stepper-card__body">
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>

                {/* Active Indicator Pulse Ring */}
                {isActive && <div className="stepper-active-beacon" aria-hidden="true" />}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
