export function LoadingSteps({ steps, currentStep, action }) {
  return (
    <div className="loading-overlay">
      <div className="loading-modal">
        <h3 className="loading-title">
          {action === "listing" && "Listando NFT"}
          {action === "buying" && "Comprando NFT"}
          {action === "cancelling" && "Cancelando publicación"}
          {action === "minting" && "Minteando NFT"}
        </h3>
        <div className="loading-steps">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`loading-step ${step.completed ? "completed" : ""} ${
                index === currentStep ? "active" : ""
              }`}
            >
              <div className="step-indicator">
                {step.completed ? (
                  <span className="check-icon">✓</span>
                ) : index === currentStep ? (
                  <span className="loading-spinner small"></span>
                ) : (
                  <span className="step-number">{index + 1}</span>
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
