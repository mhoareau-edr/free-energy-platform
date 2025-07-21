export default function EtapesTracker({ status, onStepClick }) {

  const steps = [
    "Demande de VT",
    "Visite Technique",
    "DP",
    "RAC",
    "VAD",
    "Pose",
    "Consuel",
    "EDF",
    "Terminé"
  ];

  const statusToStep = {
    "Demande de VT": 1,
    "En attente de VT": 1,
    "Visite Technique": 2,
    "Visite Technique incomplète": 2,
    "En attente de documents pour la DP": 3,
    "Demande de DP": 3,
    "DP": 3,
    "RAC": 4,
    "VAD": 5,
    "Pose": 6,
    "Consuel": 7,
    "EDF": 8,
    "Terminé": 9
  };

  const currentStep = statusToStep[status] || 1;

  function getEtapeLabel(index) {
  if (index === 1 && status === "Visite Technique incomplète") {
    return "Visite Technique incomplète";
  }
  if (index === 2 && status === "En attente de documents pour la DP") {
    return "En attente de documents DP";
  }
  if (index === 2 && status === "Demande de DP") {
    return "Demande de DP";
  }
  return steps[index];
}

  return (
    <>
      <div className="etapes-tracker">
        {steps.map((step, index) => {
          const stepIndex = index + 1;
          let stepClass = "etape-pending";
          if (stepIndex < currentStep) stepClass = "etape-reached";
          else if (stepIndex === currentStep && step !== "Terminé") stepClass = "etape-active";
          else if (step === "Terminé" && stepIndex === currentStep) stepClass = "etape-reached";

          return (
            <div key={step} className={`etape-item ${stepClass}`}>
              <div className="etape-bullet">{stepIndex}</div>
              <div className="etape-label dark:text-white">{getEtapeLabel(index)}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}