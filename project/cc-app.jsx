// Main app — state container + top bar + layout
const { useState: useStateApp } = React;

function CCTopBar({ onClearAll }) {
  return (
    <div className="cc-topbar">
      <div className="cc-brand">
        <span className="cc-wordmark">bowtie</span>
        <span className="cc-tool-badge">Claim Comparison</span>
      </div>
      <div className="cc-topbar-right">
        <button className="cc-link" onClick={onClearAll}>Clear all</button>
      </div>
    </div>
  );
}

function CCApp() {
  // — Scenario state —
  const [tier, setTier] = useStateApp('complex');
  const [gender, setGender] = useStateApp('all');
  const [age, setAge] = useStateApp('60+');
  const [caseItem, setCase] = useStateApp(CASES.find(c => c.tier === 'complex' && c.en === 'Heart valve repair'));

  // — Selected VHIS plans — dynamic list, no limit (added via picker)
  const [plans, setPlans] = useStateApp([
    { id: 'flexi-sup',  deductible: 0 },
    { id: 'pink-semi',  deductible: 20000 },
    { id: 'pink-priv',  deductible: 0 },
  ]);

  // When tier changes, clear the selected case if it no longer matches
  React.useEffect(() => {
    if (caseItem && caseItem.tier !== tier) {
      const first = CASES.find(c => c.tier === tier);
      setCase(first || null);
    }
  }, [tier]);

  const addPlan = (id, deductible) => {
    setPlans(prev => {
      if (prev.find(p => p.id === id)) return prev;
      return [...prev, { id, deductible }];
    });
  };
  const removePlan = (id) => setPlans(prev => prev.filter(p => p.id !== id));
  const setPlanDeductible = (id, deductible) =>
    setPlans(prev => prev.map(p => (p.id === id ? { ...p, deductible } : p)));
  // Pink matrix: one selection per ward row; click toggles / changes deductible
  const selectPinkCell = (id, deductible) => {
    setPlans(prev => {
      const existing = prev.find(p => p.id === id);
      if (existing) {
        if (existing.deductible === deductible) return prev.filter(p => p.id !== id);
        return prev.map(p => (p.id === id ? { ...p, deductible } : p));
      }
      return [...prev, { id, deductible }];
    });
  };

  const onClearAll = () => {
    setTier('minor');
    setGender('all');
    setAge('all');
    setCase(null);
    setPlans([]);
  };

  return (
    <>
      <CCTopBar onClearAll={onClearAll} />
      <div className="cc-main">
        <div className="cc-area-left">
          <div className="cc-panel cc-left-stack">
            <div className="cc-stack-side">
              <CCConfigPanel
                plans={plans}
                onAdd={addPlan} onRemove={removePlan}
                onSetDeductible={setPlanDeductible} onSelectPink={selectPinkCell}
              />
            </div>
            <div className="cc-stack-side">
              <CCInputPanel
                tier={tier} setTier={setTier}
                gender={gender} setGender={setGender}
                age={age} setAge={setAge}
                caseItem={caseItem} setCase={setCase}
              />
            </div>
          </div>
        </div>
        <div className="cc-area-combined">
          <div className="cc-panel cc-combined">
            <div className="cc-combined-side">
              <CCChartPanel caseItem={caseItem} plans={plans} onRemove={removePlan} />
            </div>
            <div className="cc-combined-side">
              <CCMessagePanel caseItem={caseItem} plans={plans} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CCApp />);
