/** Decorative architectural drawing. All meaningful copy lives outside the SVG. */
export function BuildingBlueprint({ compact = false }: { compact?: boolean }) {
  return (
    <svg viewBox="0 0 600 520" fill="none" aria-hidden="true" className={`building-blueprint${compact ? " building-blueprint--compact" : ""}`}>
      <g className="blueprint-ground" stroke="currentColor" strokeWidth="0.7">
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <path d={`M ${40 + i * 30} ${320 + i * 15} l 250 -125`} />
            <path d={`M ${40 + i * 30} ${320 - i * 15} l 330 165`} />
          </g>
        ))}
      </g>
      <g className="blueprint-volume" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        <path d="M170 180 330 100 470 170 310 250Z" className="blueprint-roof" />
        <path d="M170 180v180l140 70V250Z" className="blueprint-wall" />
        <path d="M310 250 470 170v180l-160 80Z" className="blueprint-wall-side" />
        <path d="M170 225 310 295 470 215M170 270 310 340 470 260M170 315 310 385 470 305" />
        {[1, 2, 3, 4].map(i => <path key={i} d={`M${170 + i * 28} ${180 + i * 14}v180M${310 + i * 32} ${250 - i * 16}v180`} />)}
        <path d="M203 177 330 114 436 167 310 230Z" strokeDasharray="4 5" />
        <path d="M330 100V70M170 180l-28-14M470 170l28-14" strokeDasharray="3 5" />
      </g>
      <g className="blueprint-system" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M240 365V215l90-45 75 37v136" />
        <path d="M240 260l70 35 95-48M240 305l70 35 95-48" />
        <path d="M310 295v45" />
      </g>
      <g className="blueprint-nodes" fill="currentColor">
        {[[240,215],[330,170],[405,207],[240,260],[310,295],[405,247],[240,305],[310,340],[405,292],[240,365]].map(([cx,cy],i) => (
          <g key={i}><circle cx={cx} cy={cy} r="10" fill="currentColor" opacity=".1" /><circle cx={cx} cy={cy} r="3.5" /></g>
        ))}
      </g>
      <g className="blueprint-dimensions" stroke="currentColor" strokeWidth=".7">
        <path d="M142 195v175M137 195h10M137 370h10M175 390l130 65M172 385l6 10M302 450l6 10M335 445l140-70M332 440l6 10M472 370l6 10" />
        <path d="M100 155h40M120 135v40M490 400h40M510 380v40" />
      </g>
    </svg>
  );
}
