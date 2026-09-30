// Hero wordmark set on two arcs so it follows the curved section edges.
// Plain SVG text: scales with the viewport and stays crisp.
export default function CurvedTitle() {
  return (
    <div className="curved-title">
      <h1 className="sr-only">TRIBEVERSE V1, Student Tribe freshers edition</h1>
      <svg viewBox="0 -70 1000 560" role="img" aria-hidden="true" focusable="false">
        <defs>
          <path id="arc-top" d="M 110 40 Q 500 -70 890 40" />
          <path id="arc-tribe" d="M 40 300 Q 500 100 960 300" />
          <path id="arc-verse" d="M 20 470 Q 500 270 980 470" />
        </defs>

        <text className="ct-presents">
          <textPath href="#arc-top" startOffset="50%" textAnchor="middle">STUDENT TRIBE PRESENTS</textPath>
        </text>

        {/* hard shadows */}
        <g className="ct-shadow" transform="translate(0 12)">
          <text className="ct-word"><textPath href="#arc-tribe" startOffset="50%" textAnchor="middle">TRIBE</textPath></text>
          <text className="ct-word"><textPath href="#arc-verse" startOffset="50%" textAnchor="middle">VERSE</textPath></text>
        </g>

        <text className="ct-word ct-tribe">
          <textPath href="#arc-tribe" startOffset="50%" textAnchor="middle">TRIBE</textPath>
        </text>
        <text className="ct-word ct-verse">
          <textPath href="#arc-verse" startOffset="50%" textAnchor="middle">VERSE</textPath>
        </text>

        {/* V1 sticker */}
        <g transform="translate(872 70) rotate(10)">
          <rect x="-62" y="-46" width="124" height="92" rx="20" fill="#FFE600" stroke="#0D1B4B" strokeWidth="6" />
          <text x="0" y="22" textAnchor="middle" className="ct-v1">V1</text>
        </g>
      </svg>
    </div>
  )
}
