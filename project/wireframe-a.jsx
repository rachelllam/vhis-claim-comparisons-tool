// Wireframe A — Linear wizard (accordion)
// One step active at a time. Earlier steps collapse into a summary chip.
// Best for: training new agents, scripted flow, less screen real estate.

const WFA_StepHeader = ({ n, title, status, summary }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px' }}>
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      border: '2px solid #2a2a33',
      background: status === 'active' ? '#ff0068' : status === 'done' ? '#fff' : '#fafafd',
      color: status === 'active' ? '#fff' : '#2a2a33',
      fontFamily: 'Caveat, cursive', fontSize: 22, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{status === 'done' ? '✓' : n}</div>
    <div style={{ fontFamily: 'Caveat, cursive', fontSize: 26, fontWeight: 700 }}>{title}</div>
    {summary && (
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span className="tag">{summary}</span>
        <span style={{ fontFamily: 'Caveat, cursive', color: '#8a8a96', fontSize: 20 }}>edit</span>
      </div>
    )}
  </div>
);

const WireframeA = () => (
  <div className="wf" style={{ width: '100%', height: '100%', padding: 28, boxSizing: 'border-box', background: '#f6f6f9', overflow: 'hidden' }}>
    {/* title strip */}
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8 }}>
      <h1 style={{ margin: 0, fontSize: 34 }}>A · Linear wizard</h1>
      <span className="squiggle" style={{ fontSize: 20 }}>one step at a time · accordion · earlier steps collapse to a chip</span>
    </div>

    {/* progress dots */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      {[1,2,3,4,5].map(i => (
        <React.Fragment key={i}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: i <= 2 ? '#ff0068' : '#d8d8e0' }} />
          {i < 5 && <div style={{ flex: '0 0 32px', height: 2, background: i < 2 ? '#ff0068' : '#d8d8e0' }} />}
        </React.Fragment>
      ))}
      <span style={{ marginLeft: 12, fontFamily: 'Caveat, cursive', fontSize: 20, color: '#6b6b76' }}>step 2 of 5</span>
    </div>

    {/* Step 1 — collapsed/done */}
    <div className="box" style={{ marginBottom: 10 }}>
      <WFA_StepHeader n={1} title="Pick a surgery tier" status="done" summary="🔴 複雜手術 · HK$250k–500k+" />
    </div>

    {/* Step 2 — active/expanded */}
    <div className="box" style={{ marginBottom: 10, borderColor: '#ff0068', borderWidth: 3 }}>
      <WFA_StepHeader n={2} title="Find a matching real case  ·  揀返一個近似嘅案例" status="active" />
      <div style={{ padding: '0 22px 18px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 18, marginBottom: 14, alignItems: 'center' }}>
          <span className="step-label" style={{ fontSize: 16 }}>Gender</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <span className="pill on">全部 All</span>
            <span className="pill">男</span>
            <span className="pill">女</span>
          </div>
          <span style={{ width: 1, height: 24, background: '#d8d8e0' }} />
          <span className="step-label" style={{ fontSize: 16 }}>Age</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <span className="pill">全部</span>
            <span className="pill">&lt;40</span>
            <span className="pill">40–59</span>
            <span className="pill on">60+</span>
          </div>
          <span style={{ marginLeft: 'auto' }} className="squiggle">7 cases match</span>
        </div>
        {/* Examples grid 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            ['冠狀動脈搭橋', 'Coronary bypass', '男 · 60+', 'HK$320,000', false],
            ['心臟瓣膜修復', 'Valve repair', '男女 · 60+', 'HK$350,000', true],
            ['癌症切除術', 'Cancer resection', '男女 · 60+', 'HK$380,000', false],
            ['多節脊椎融合', 'Spinal fusion', '男女 · 40–59', 'HK$300,000', false],
          ].map(([zh, en, demo, price, sel]) => (
            <div key={en} className="box" style={{
              padding: '12px 16px',
              borderColor: sel ? '#2c6bd6' : '#2a2a33',
              background: sel ? '#e6f0ff' : '#fff',
              borderWidth: sel ? 3 : 2,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{zh}</div>
                  <div className="label-small">{en}</div>
                </div>
                <div className="hand" style={{ fontSize: 22 }}>{price}</div>
              </div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                {demo.split(' · ').map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div className="squiggle" style={{ textAlign: 'center', marginTop: 6, fontSize: 18 }}>↓ scroll for more cases</div>
      </div>
    </div>

    {/* Steps 3-5 collapsed */}
    <div className="box dashed" style={{ marginBottom: 10 }}>
      <WFA_StepHeader n={3} title="GM (group medical) — if any" status="upcoming" />
    </div>
    <div className="box dashed" style={{ marginBottom: 10 }}>
      <WFA_StepHeader n={4} title="Pick 2–3 VHIS plans to compare (of 6)" status="upcoming" />
    </div>
    <div className="box dashed" style={{ marginBottom: 14 }}>
      <WFA_StepHeader n={5} title="Review chart + send WhatsApp" status="upcoming" />
    </div>

    {/* Footer nav */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <button className="fake">← Back</button>
      <span className="note" style={{ fontSize: 20 }}>agent sees one focus area at a time — guided, hard to skip</span>
      <button className="fake primary">Next: configure plans →</button>
    </div>
  </div>
);

window.WireframeA = WireframeA;
