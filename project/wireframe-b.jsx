// Wireframe B — Cockpit
// 2 columns now: Scenario (left), Configure + Output stacked as 2 rows (right).
// Step 1 compressed to a horizontal row so Step 2 gets the breathing room.

const WFB_Col = ({ title, children, flex = 1 }) =>
  <div style={{ flex, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, minHeight: 0 }}>
    <div className="step-label" style={{ fontSize: 18 }}>{title}</div>
    {children}
  </div>;

const WireframeB = () =>
  <div className="wf" style={{ width: '100%', height: '100%', padding: 24, boxSizing: 'border-box', background: '#f6f6f9', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} data-comment-anchor="3ef253cc1c-div-13-3">

    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8 }}>
      <h1 style={{ margin: 0, fontSize: 34 }}>B · Cockpit</h1>
      <span className="squiggle" style={{ fontSize: 20 }}>scenario · configure + output stacked · all state visible</span>
    </div>

    {/* Context strip — what's currently selected */}
    <div className="box" style={{ padding: '10px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14, background: '#fff' }}>
      <span className="step-label" style={{ fontSize: 14 }}>Current case</span>
      <span className="pill on">🔴 複雜手術</span>
      <span style={{ fontFamily: 'Caveat, cursive', fontSize: 24 }}>心臟瓣膜修復 · Valve repair</span>
      <span className="tag">男女</span><span className="tag">60+</span>
      <span className="hand" style={{ fontSize: 24, marginLeft: 'auto', color: '#191357' }}>HK$350,000</span>
    </div>

    <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>

      {/* LEFT — Scenario: Step 1 compact + Step 2 big */}
      <WFB_Col title="Scenario" flex={1}>
        {/* Step 1 — compact horizontal row */}
        <div className="box" style={{ padding: 10 }}>
          <div className="label-small" style={{ marginBottom: 6 }} data-comment-anchor="17d452e4a7-div-34-11">Step 1 — Surgery tier</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {[['🟢', '小', '15–25k'], ['🔵', '中', '40–70k'], ['🟠', '大', '100–200k'], ['🔴', '複雜', '250–500k+']].map(([d, l, r], i) =>
              <div key={l} className="box" style={{ padding: '6px 8px', borderWidth: i === 3 ? 3 : 1.5, borderColor: i === 3 ? '#ff0068' : '#d8d8e0', background: i === 3 ? '#ffe1ee' : '#fff', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Caveat, cursive', fontSize: 18, lineHeight: 1.1 }}>{d} {l}</div>
                <div className="label-small" style={{ fontSize: 11 }}>${r}</div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2 — fills remaining height */}
        <div className="box" style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="label-small">Step 2 — Real case</div>
            <span className="squiggle" style={{ fontSize: 15 }}>5 of 12 cases match</span>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            <span className="pill on" style={{ fontSize: 13, padding: '2px 10px' }}>全部 All</span>
            <span className="pill" style={{ fontSize: 13, padding: '2px 10px' }}>男</span>
            <span className="pill" style={{ fontSize: 13, padding: '2px 10px' }}>女</span>
            <span style={{ width: 8 }} />
            <span className="pill" style={{ fontSize: 13, padding: '2px 10px' }}>&lt;40</span>
            <span className="pill" style={{ fontSize: 13, padding: '2px 10px' }}>40–59</span>
            <span className="pill blue-on" style={{ fontSize: 13, padding: '2px 10px' }}>60+</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
            {[
              ['冠狀動脈搭橋', 'Coronary bypass', '320,000', '男 · 60+', false],
              ['心臟瓣膜修復', 'Valve repair', '350,000', '男女 · 60+', true],
              ['癌症切除術', 'Cancer resection', '380,000', '男女 · 60+', false],
              ['多節脊椎融合', 'Spinal fusion', '300,000', '男女 · 40–59', false],
              ['乳癌手術', 'Breast cancer surgery', '260,000', '女 · 40–59', false],
              ['髖關節置換', 'Hip replacement', '180,000', '男女 · 60+', false],
            ].map(([zh, en, p, demo, sel]) =>
              <div key={en} className="box" style={{ padding: '10px 14px', borderWidth: sel ? 3 : 1.5, borderColor: sel ? '#2c6bd6' : '#d8d8e0', background: sel ? '#e6f0ff' : '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{zh}</div>
                    <div className="label-small">{en}</div>
                  </div>
                  <div className="hand" style={{ fontSize: 22, color: '#191357' }}>HK${p}</div>
                </div>
                <div style={{ marginTop: 4, display: 'flex', gap: 5 }}>
                  {demo.split(' · ').map(t => <span key={t} className="tag" style={{ fontSize: 12 }}>{t}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </WFB_Col>

      {/* RIGHT — Configure (row 1) + Output (row 2) */}
      <WFB_Col title="Configure & Output" flex={1.55}>

        {/* ROW 1 — Configure: GM (left) + VHIS plans (right) */}
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Step 3 — GM */}
          <div className="box" style={{ padding: 12, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="label-small">Step 3 — GM plan (optional)</div>
              <div style={{ width: 38, height: 20, borderRadius: 999, background: '#18a957', position: 'relative' }}>
                <div style={{ position: 'absolute', right: 2, top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {['Annual limit', 'Per-surgery', 'Ward class', 'Balance left'].map((l, i) =>
                <div key={l}>
                  <div className="label-small">{l}</div>
                  <div className="box" style={{ padding: '6px 10px', fontFamily: 'Caveat, cursive', fontSize: 18 }}>
                    {['$50,000', '$30,000', 'Semi-priv', '$50,000'][i]}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 4 — VHIS plans */}
          <div className="box" style={{ padding: 12, flex: 1.1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="label-small">Step 4 — VHIS plans · 2–3 of 6</div>
              <span className="note" style={{ fontSize: 15 }}>+ add</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Flexi Superior', '$0'],
                ['Pink （半私家）', '$8,000'],
                ['Critical Flex (CF)', '$0']
              ].map(([n, d]) =>
                <div key={n} className="box" style={{ padding: '6px 10px', borderColor: '#2a2a33', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{n}</div>
                    <div className="label-small" style={{ fontSize: 11 }}>deductible {d}</div>
                  </div>
                  <span style={{ fontFamily: 'Caveat, cursive', color: '#ff0068', fontSize: 18 }}>swap</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2 — Output: Chart (left) + WhatsApp (right) */}
        <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
          {/* Chart */}
          <div className="box" style={{ padding: 14, flex: 1.15, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <div style={{ fontFamily: 'Caveat, cursive', fontSize: 22 }}>Coverage breakdown</div>
              <div className="hand" style={{ fontSize: 18, color: '#191357' }}>HK$350,000 total</div>
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#6b6b76', marginBottom: 10 }}>
              <span><span className="dot g" /> GM</span>
              <span><span className="dot b" /> VHIS</span>
              <span><span className="dot o" /> Deductible</span>
              <span><span className="dot r" /> Out-of-pocket</span>
            </div>
            {[
              { label: 'Flexi Superior', deduct: '$0', segs: [0.08, 0.92, 0, 0], amounts: { gm: 30, vhis: 320, ded: 0, oop: 0 }, claim: 350, pays: 0, winner: true },
              { label: 'Pink （半私家）', deduct: '$8k', segs: [0.08, 0.79, 0.02, 0.11], amounts: { gm: 30, vhis: 276, ded: 8, oop: 36 }, claim: 306, pays: 44 },
              { label: 'Critical Flex (CF)', deduct: '$0', segs: [0.08, 0.79, 0, 0.13], amounts: { gm: 30, vhis: 274, ded: 0, oop: 46 }, claim: 304, pays: 46 },
            ].map((p) =>
              <div key={p.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 12, marginBottom: 4 }}>
                  <span>
                    <strong>{p.label}</strong> <span className="label-small" style={{ fontSize: 11 }}>· deduct {p.deduct}</span>
                    {p.winner && <span className="tag" style={{ marginLeft: 6, background: '#ffe1ee', color: '#ff0068', fontSize: 11 }}>best fit</span>}
                  </span>
                  <span className="label-small" style={{ fontSize: 11 }}>claim HK${p.claim}k · OOP HK${p.pays}k</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', height: 24, border: '2px solid #2a2a33', borderRadius: 6, overflow: 'hidden' }}>
                    {[
                      ['#18a957', p.segs[0], `$${p.amounts.gm}k`],
                      ['#2c6bd6', p.segs[1], `$${p.amounts.vhis}k`],
                      ['#d97706', p.segs[2], p.amounts.ded ? `$${p.amounts.ded}k` : ''],
                      ['#d94840', p.segs[3], p.amounts.oop ? `$${p.amounts.oop}k` : ''],
                    ].map(([c, w, t], i) =>
                      w > 0 ?
                        <div key={i} style={{ flex: w, background: c, color: '#fff', fontFamily: 'Kalam, sans-serif', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {w > 0.08 ? t : ''}
                        </div> :
                        null
                    )}
                  </div>
                  <div className="box" style={{ padding: '2px 8px', minWidth: 72, textAlign: 'center', borderColor: p.pays > 0 ? '#d94840' : '#18a957', background: p.pays > 0 ? '#fff5f4' : '#f0faf2' }}>
                    <div className="label-small" style={{ fontSize: 10, lineHeight: 1.1 }}>pays</div>
                    <div className="hand" style={{ fontSize: 18, color: p.pays > 0 ? '#d94840' : '#18a957', lineHeight: 1.1 }}>HK${p.pays}k</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp */}
          <div className="box" style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontFamily: 'Caveat, cursive', fontSize: 20 }}>WhatsApp message</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['✅', '⚠️', '🔵', '🟢'].map((e, i) =>
                  <span key={e} className="box" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, borderWidth: i === 3 ? 2.5 : 1.5, borderColor: i === 3 ? '#ff0068' : '#d8d8e0' }}>{e}</span>
                )}
              </div>
            </div>
            <div className="box soft" style={{ padding: 10, flex: 1, fontSize: 12, lineHeight: 1.5, color: '#4a4a52', overflow: 'hidden' }}>
              🏥 手術保障示例（複雜手術 — 心臟瓣膜修復 / HK$350,000）· 60歲+ <br />
              ●  Flexi Superior：全額保障 HK$320,000<br />
              ●  Pink 半私家：HK$286,400（免賠額 $8,000）<br />
              ●  Critical Flex (CF)：HK$304,000<br />
              …
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 8 }}>
              <span className="label-small" style={{ fontSize: 11 }}>479 chars · editable</span>
              <button className="fake" style={{ fontSize: 14, padding: '3px 10px' }}>↻ Regen</button>
              <button className="fake primary" style={{ fontSize: 16, padding: '3px 12px' }}>Copy</button>
            </div>
          </div>
        </div>
      </WFB_Col>
    </div>

    <div className="note" style={{ textAlign: 'center', marginTop: 8, fontSize: 18 }}>2 columns · scenario picker gets the breathing room · configure + output sit stacked on the right</div>
  </div>;


window.WireframeB = WireframeB;
