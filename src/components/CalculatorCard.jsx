function CalculatorCard({ title, children, buttonText, onCalculate }) {
  return (
    <div className="calculator-card">
      <div className="card-accent"></div>
      <h1>{title}</h1>

      {children}

      <button className="calculate-btn" onClick={onCalculate}>
        {buttonText}
      </button>
    </div>
  );
}

export default CalculatorCard;