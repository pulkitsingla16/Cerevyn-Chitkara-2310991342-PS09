export function Instructions() {
  return (
    <section className="panel instructions-panel">
      <div className="section-heading">
        <h2>How to play</h2>
      </div>
      <ul className="instruction-list">
        <li>Select two cards per move.</li>
        <li>Matching cards remain revealed.</li>
        <li>Mismatched cards turn face down after a short delay.</li>
        <li>Match all pairs to complete the round.</li>
        <li>The next difficulty depends on the previous completed round.</li>
      </ul>
    </section>
  )
}
