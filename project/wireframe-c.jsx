// Wireframe C — Comparison-first (plans-as-columns)
// Output is the hero; plans become side-by-side columns the customer "sees".
// Best for: showing the customer the comparison directly; inputs minimised into a thin top bar.

const WireframeC = () => (
  <div className="wf" style={{ width: '100%', height: '100%', padding: 24, boxSizing: 'border-box', background: '#f6f6f9', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 10 }}>
      <h1 style={{ margin: 0, fontSize: 34 }}>C · Comparison-first</h1>
      <span className="squiggle" style={{ fontSize: 20 }}>output is the hero · plans as columns · inputs collapse to a slim top bar</span>
    </div>

    {/* TOP — scenario bar (collapsed inputs) */}
    <div className="box" style={{ padding: '10px 14px', marginBottom: 12, display:'flex', alignItems:'center', gap: 10, flexWrap: 'wrap' }}>
      <span className="step-label" style={{ fontSize: 14 }}>Case</span>
      <span className="pill on">🔴 複雜</span>
      <span className="pill blue-on">心臟瓣膜修復 · Valve repair ▾</span>
      <span className="tag">男女</span><span className="tag">60+</span>
      <span className="hand" style={{ fontSize: 22, color:'#191357' }}>HK$350,000</span>
      <span style={{ width: 1, height: 24, background: '#d8d8e0', margin: '0 6px' }} />
      <span className="step-label" style={{ fontSize: 14 }}>GM</span>
      <span className="pill" style={{ fontSize: 13 }}>on · $50k/$30k · semi-priv ▾</span>
      <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
        <span className="label-small">comparing</span>
        <span className="tag" style={{ background: '#ffe1ee', color:'#ff0068' }}>Flexi Superior ×</span>
        <span className="tag" style={{ background: '#ffe1ee', color:'#ff0068' }}>Pink 半私家 ×</span>
        <span className="tag" style={{ background: '#ffe1ee', color:'#ff0068' }}>Critical Flex ×</span>
        <span className="note" style={{ fontSize: 16 }}>+ add (3 left)</span>
      </span>
    </div>

    <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>

      {/* LEFT — 3 plan columns (the hero) */}
      <div style={{ flex: 1.7, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="step-label" style={{ fontSize: 18, marginBottom: 8 }}>Plan comparison</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, flex: 1, minHeight: 0 }}>
          {[
            { name: 'Flexi Superior', sub: '無免賠額', deduct: 0, covered: 320, oop: 0, winner: true },
            { name: 'Pink （半私家）', sub: '免賠額 $8,000', deduct: 8, covered: 286, oop: 56 },
            { name: 'Critical Flex (CF)', sub: '無免賠額', deduct: 0, covered: 304, oop: 46 },
          ].map((p) => (
            <div key={p.name} className="box" style={{ padding: 14, display: 'flex', flexDirection: 'column', borderColor: p.winner ? '#ff0068' : '#2a2a33', borderWidth: p.winner ? 3 : 2, position: 'relative' }}>
              {p.winner && <span className="pill on" style={{ position: 'absolute', top: -14, right: 12, fontSize: 13, background: '#ff0068', color:'#fff', borderColor:'#ff0068' }}>best fit</span>}
              <div style={{ fontWeight: 700, fontSize: 18 }}>{p.name}</div>
              <div className="label-small" style={{ marginBottom: 12 }}>{p.sub}</div>

              {/* Vertical stacked bar */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flex: 1, minHeight: 0, marginBottom: 10 }}>
                <div style={{ width: 60, height: '100%', border: '2px solid #2a2a33', borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {p.oop > 0 && <div style={{ background: '#d94840', height: `${(p.oop/350)*100}%` }} />}
                  {p.deduct > 0 && <div style={{ background: '#d97706', height: `${(p.deduct/350)*100}%` }} />}
                  <div style={{ background: '#2c6bd6', height: `${(p.covered/350)*100}%` }} />
                  <div style={{ background: '#18a957', height: `${(30/350)*100}%` }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                  <div><span className="dot g" /> GM HK$30k</div>
                  <div><span className="dot b" /> VHIS HK${p.covered}k</div>
                  {p.deduct > 0 && <div><span className="dot o" /> Deduct HK${p.deduct}k</div>}
                  {p.oop > 0 && <div><span className="dot r" /> OOP HK${p.oop}k</div>}
                </div>
              </div>

              {/* Summary line */}
              <div className="box soft" style={{ padding: '8px 10px' }}>
                <div className="label-small">Customer pays</div>
                <div className="hand" style={{ fontSize: 26, color: p.oop > 0 ? '#d94840' : '#18a957' }}>
                  HK${p.deduct + p.oop}k
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — WhatsApp message panel (always visible, slim) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="step-label" style={{ fontSize: 18, marginBottom: 8 }}>WhatsApp customer</div>
        <div className="box" style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Tone presets */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {[['✅','factual'],['⚠️','urgent'],['🔵','formal'],['🟢','friendly']].map(([e,l],i) => (
              <div key={l} className="box" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, borderColor: i===3?'#ff0068':'#d8d8e0', borderWidth: i===3?3:1.5, background: i===3?'#ffe1ee':'#fff' }}>
                <span>{e}</span><span className="label-small">{l}</span>
              </div>
            ))}
          </div>

          {/* Message preview as chat bubble */}
          <div style={{ flex: 1, background: '#dcf8c6', borderRadius: 14, padding: 12, fontSize: 13, lineHeight: 1.6, color: '#1f1f24', position: 'relative', minHeight: 0, overflow: 'hidden' }}>
            <div style={{ fontFamily:'Caveat, cursive', fontSize: 18, marginBottom: 6 }}>🏥 手術保障示例</div>
            複雜手術 — 心臟瓣膜修復<br/>
            預計手術費：HK$350,000  (60歲+)<br/><br/>
            🟢 十三員醫療 (GM) 保障：HK$30,000<br/>
            🔵 Flexi Superior：HK$320,000 (全額)<br/>
            🔵 Pink 半私家：HK$286,400 (免 $8k)<br/>
            🔵 Critical Flex：HK$304,000<br/><br/>
            <span style={{ color:'#6b6b76' }}>VHIS方案比較：…</span>
            <div style={{ position: 'absolute', bottom: 6, right: 12, fontSize: 11, color: '#6b6b76' }}>479 chars · 11:42 AM ✓✓</div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="fake" style={{ fontSize: 16 }}>✎ Edit</button>
            <button className="fake" style={{ fontSize: 16 }}>↻ Regen</button>
            <button className="fake primary" style={{ flex: 1, fontSize: 18 }}>Copy & paste to WhatsApp</button>
          </div>
        </div>
      </div>
    </div>

    <div className="note" style={{ textAlign:'center', marginTop: 8, fontSize: 18 }}>plans are visual columns the customer can grok — inputs hide above; output dominates</div>
  </div>
);

window.WireframeC = WireframeC;
