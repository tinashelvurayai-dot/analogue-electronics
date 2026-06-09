/**
 * Pre-built SVG diagrams used inside flash-cards.
 * Author cards with a fenced code block whose info-string starts with `diagram`:
 *   ```diagram closed-loop
 *   ```
 * The body of the block is ignored; only the name token after `diagram` matters.
 * Available names: closed-loop, dcs-pyramid, pneumatic-valve, butterfly-valve,
 *                  bode, nyquist, root-locus, open-loop, plc-architecture
 */
import React from "react";

type Props = { className?: string };

const wrap = (children: React.ReactNode, viewBox = "0 0 600 320", title = "Diagram") => (
  <div className="my-4 rounded-md border border-border/60 bg-muted/30 p-3 overflow-x-auto">
    <svg viewBox={viewBox} role="img" aria-label={title} className="w-full h-auto max-h-[360px]"
         xmlns="http://www.w3.org/2000/svg" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="13">
      {children}
    </svg>
  </div>
);

const stroke = "hsl(var(--foreground))";
const accent = "hsl(var(--primary))";
const muted = "hsl(var(--muted-foreground))";

function Block({ x, y, w, h, label, fill = "hsl(var(--card))" }: any) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fill={stroke}>{label}</text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label }: any) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="1.5" markerEnd="url(#arrow)" />
      {label && (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} textAnchor="middle" fill={muted} fontSize="11">{label}</text>
      )}
    </g>
  );
}

const Defs = () => (
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill={stroke} />
    </marker>
  </defs>
);

export function ClosedLoopDiagram() {
  return wrap(
    <>
      <Defs />
      <text x="300" y="22" textAnchor="middle" fill={accent} fontWeight="600">Closed-loop (feedback) control</text>
      <Arrow x1="20" y1="120" x2="80" y2="120" label="r(t)" />
      <g>
        <circle cx="100" cy="120" r="18" fill="hsl(var(--card))" stroke={stroke} strokeWidth="1.5" />
        <text x="100" y="124" textAnchor="middle">Σ</text>
        <text x="100" y="100" textAnchor="middle" fontSize="11" fill={muted}>+</text>
        <text x="100" y="152" textAnchor="middle" fontSize="11" fill={muted}>−</text>
      </g>
      <Arrow x1="118" y1="120" x2="170" y2="120" label="e(t)" />
      <Block x={170} y={100} w={90} h={40} label="Controller" />
      <Arrow x1="260" y1="120" x2="310" y2="120" label="u(t)" />
      <Block x={310} y={100} w={110} h={40} label="Plant G(s)" />
      <Arrow x1="420" y1="120" x2="480" y2="120" label="y(t)" />
      <line x1="480" y1="120" x2="540" y2="120" stroke={stroke} strokeWidth="1.5" />
      <line x1="540" y1="120" x2="540" y2="220" stroke={stroke} strokeWidth="1.5" />
      <line x1="540" y1="220" x2="270" y2="220" stroke={stroke} strokeWidth="1.5" />
      <Block x={170} y={200} w={100} h={40} label="Sensor H(s)" />
      <Arrow x1="170" y1="220" x2="100" y2="220" />
      <line x1="100" y1="220" x2="100" y2="138" stroke={stroke} strokeWidth="1.5" markerEnd="url(#arrow)" />
      <text x="495" y="135" fontSize="11" fill={muted}>output</text>
    </>,
    "0 0 600 260", "Closed-loop control"
  );
}

export function OpenLoopDiagram() {
  return wrap(
    <>
      <Defs />
      <text x="300" y="22" textAnchor="middle" fill={accent} fontWeight="600">Open-loop control</text>
      <Arrow x1="20" y1="100" x2="80" y2="100" label="r(t)" />
      <Block x={80} y={80} w={120} h={40} label="Controller" />
      <Arrow x1="200" y1="100" x2="260" y2="100" label="u(t)" />
      <Block x={260} y={80} w={140} h={40} label="Plant / Process" />
      <Arrow x1="400" y1="100" x2="480" y2="100" label="y(t)" />
      <text x="300" y="170" textAnchor="middle" fill={muted} fontSize="11">No feedback — output not measured or compared to setpoint.</text>
    </>,
    "0 0 600 200", "Open-loop control"
  );
}

export function DcsPyramidDiagram() {
  const levels = [
    { w: 520, label: "Level 0 — Field devices (sensors, actuators)" },
    { w: 440, label: "Level 1 — PLC / DCS controllers" },
    { w: 360, label: "Level 2 — SCADA / HMI (supervisory)" },
    { w: 280, label: "Level 3 — MES (manufacturing execution)" },
    { w: 200, label: "Level 4 — ERP (business / planning)" },
  ];
  return wrap(
    <>
      <text x="300" y="22" textAnchor="middle" fill={accent} fontWeight="600">Automation pyramid (ISA-95)</text>
      {levels.slice().reverse().map((lvl, i) => {
        const y = 40 + i * 44;
        const x = (600 - lvl.w) / 2;
        const hues = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];
        return (
          <g key={i}>
            <rect x={x} y={y} width={lvl.w} height={38} rx="4" fill={hues[i] + "33"} stroke={hues[i]} strokeWidth="1.5" />
            <text x="300" y={y + 24} textAnchor="middle" fill={stroke}>{lvl.label}</text>
          </g>
        );
      })}
    </>,
    "0 0 600 280", "Automation pyramid"
  );
}

export function PneumaticValveDiagram() {
  return wrap(
    <>
      <Defs />
      <text x="300" y="22" textAnchor="middle" fill={accent} fontWeight="600">Diaphragm-actuated pneumatic control valve</text>
      {/* Actuator (top) */}
      <ellipse cx="300" cy="80" rx="90" ry="40" fill="hsl(var(--card))" stroke={stroke} strokeWidth="1.5" />
      <line x1="210" y1="80" x2="390" y2="80" stroke={stroke} strokeDasharray="4 3" />
      <text x="300" y="60" textAnchor="middle" fontSize="11" fill={muted}>diaphragm</text>
      <text x="300" y="100" textAnchor="middle" fontSize="11" fill={muted}>spring chamber</text>
      <line x1="395" y1="80" x2="440" y2="80" stroke={stroke} strokeWidth="1.5" markerEnd="url(#arrow)" />
      <text x="445" y="78" fontSize="11" fill={stroke}>air signal (3–15 psi)</text>
      {/* Stem */}
      <rect x="295" y="120" width="10" height="60" fill={stroke} />
      <text x="320" y="155" fontSize="11" fill={muted}>stem</text>
      {/* Body */}
      <path d="M180 180 L420 180 L390 260 L210 260 Z" fill="hsl(var(--card))" stroke={stroke} strokeWidth="1.5" />
      <text x="300" y="245" textAnchor="middle" fontSize="11" fill={muted}>valve body</text>
      {/* Plug */}
      <polygon points="285,180 315,180 305,210 295,210" fill={accent} stroke={stroke} />
      {/* Seat */}
      <line x1="270" y1="215" x2="330" y2="215" stroke={stroke} strokeWidth="2" />
      <text x="345" y="218" fontSize="11" fill={muted}>plug / seat</text>
      {/* Flow arrows */}
      <line x1="100" y1="225" x2="200" y2="225" stroke={accent} strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="400" y1="225" x2="500" y2="225" stroke={accent} strokeWidth="2" markerEnd="url(#arrow)" />
      <text x="120" y="215" fontSize="11" fill={accent}>flow in</text>
      <text x="440" y="215" fontSize="11" fill={accent}>flow out</text>
    </>,
    "0 0 600 300", "Pneumatic control valve"
  );
}

export function ButterflyValveDiagram() {
  return wrap(
    <>
      <Defs />
      <text x="300" y="22" textAnchor="middle" fill={accent} fontWeight="600">Butterfly valve (cross-section)</text>
      {/* Pipe body */}
      <rect x="80" y="100" width="440" height="120" fill="hsl(var(--card))" stroke={stroke} strokeWidth="1.5" />
      <line x1="80" y1="110" x2="520" y2="110" stroke={muted} strokeDasharray="3 3" />
      <line x1="80" y1="210" x2="520" y2="210" stroke={muted} strokeDasharray="3 3" />
      {/* Disc (partially open, ~60°) */}
      <g transform="translate(300 160) rotate(-30)">
        <ellipse cx="0" cy="0" rx="60" ry="10" fill={accent} stroke={stroke} strokeWidth="1.5" />
      </g>
      {/* Shaft */}
      <circle cx="300" cy="160" r="6" fill={stroke} />
      <line x1="300" y1="100" x2="300" y2="60" stroke={stroke} strokeWidth="2" />
      <rect x="280" y="40" width="40" height="22" fill="hsl(var(--card))" stroke={stroke} />
      <text x="300" y="55" textAnchor="middle" fontSize="11">handle</text>
      {/* Flow */}
      <line x1="20" y1="160" x2="75" y2="160" stroke={accent} strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="525" y1="160" x2="580" y2="160" stroke={accent} strokeWidth="2" markerEnd="url(#arrow)" />
      <text x="30" y="150" fontSize="11" fill={accent}>flow</text>
      <text x="380" y="120" fontSize="11" fill={muted}>disc rotates 90° from open → closed</text>
    </>,
    "0 0 600 260", "Butterfly valve"
  );
}

export function BodeDiagram() {
  // Two-axis Bode sketch: magnitude (dB) and phase
  return wrap(
    <>
      <Defs />
      <text x="300" y="18" textAnchor="middle" fill={accent} fontWeight="600">Bode plot (magnitude & phase)</text>
      {/* Magnitude plot */}
      <g transform="translate(60 30)">
        <text x="-30" y="10" fontSize="11" fill={muted}>|G| (dB)</text>
        <line x1="0" y1="0" x2="0" y2="100" stroke={stroke} />
        <line x1="0" y1="100" x2="480" y2="100" stroke={stroke} />
        <line x1="0" y1="50" x2="480" y2="50" stroke={muted} strokeDasharray="2 4" />
        <text x="-25" y="54" fontSize="10" fill={muted}>0</text>
        <path d="M0 20 L160 20 L320 80 L480 95" fill="none" stroke={accent} strokeWidth="2" />
        <text x="200" y="35" fontSize="11" fill={accent}>−20 dB/dec</text>
      </g>
      {/* Phase plot */}
      <g transform="translate(60 170)">
        <text x="-30" y="10" fontSize="11" fill={muted}>∠G (°)</text>
        <line x1="0" y1="0" x2="0" y2="100" stroke={stroke} />
        <line x1="0" y1="100" x2="480" y2="100" stroke={stroke} />
        <line x1="0" y1="50" x2="480" y2="50" stroke={muted} strokeDasharray="2 4" />
        <text x="-25" y="14" fontSize="10" fill={muted}>0°</text>
        <text x="-30" y="54" fontSize="10" fill={muted}>−45°</text>
        <text x="-30" y="94" fontSize="10" fill={muted}>−90°</text>
        <path d="M0 10 L120 10 Q240 10 240 50 Q240 90 360 90 L480 90" fill="none" stroke={accent} strokeWidth="2" />
        <text x="200" y="130" fontSize="11" fill={muted}>log ω →</text>
      </g>
    </>,
    "0 0 600 320", "Bode plot"
  );
}

export function NyquistDiagram() {
  return wrap(
    <>
      <Defs />
      <text x="300" y="22" textAnchor="middle" fill={accent} fontWeight="600">Nyquist plot</text>
      {/* Axes */}
      <line x1="60" y1="170" x2="540" y2="170" stroke={stroke} />
      <line x1="300" y1="40" x2="300" y2="300" stroke={stroke} />
      <text x="545" y="174" fontSize="11" fill={muted}>Re</text>
      <text x="295" y="35" fontSize="11" fill={muted}>Im</text>
      {/* −1 point */}
      <circle cx="220" cy="170" r="4" fill="hsl(0 70% 55%)" />
      <text x="200" y="160" fontSize="11" fill="hsl(0 70% 55%)">(−1, 0)</text>
      {/* Locus */}
      <path d="M460 170 Q 460 80 320 90 Q 200 100 220 200 Q 240 260 460 170" fill="none" stroke={accent} strokeWidth="2" />
      <polygon points="455,168 470,170 455,176" fill={accent} />
      <text x="120" y="240" fontSize="11" fill={muted}>encirclements of (−1) determine stability (N = P − Z)</text>
    </>,
    "0 0 600 320", "Nyquist plot"
  );
}

export function RootLocusDiagram() {
  return wrap(
    <>
      <Defs />
      <text x="300" y="22" textAnchor="middle" fill={accent} fontWeight="600">Root-locus (sketch)</text>
      <line x1="60" y1="170" x2="540" y2="170" stroke={stroke} />
      <line x1="300" y1="40" x2="300" y2="300" stroke={stroke} />
      <text x="545" y="174" fontSize="11" fill={muted}>σ (Re)</text>
      <text x="295" y="35" fontSize="11" fill={muted}>jω (Im)</text>
      {/* Open-loop poles (x) */}
      {[{x:230,y:170},{x:170,y:170},{x:110,y:170}].map((p,i)=>(
        <g key={i}>
          <line x1={p.x-6} y1={p.y-6} x2={p.x+6} y2={p.y+6} stroke={accent} strokeWidth="2"/>
          <line x1={p.x-6} y1={p.y+6} x2={p.x+6} y2={p.y-6} stroke={accent} strokeWidth="2"/>
        </g>
      ))}
      {/* Zero (o) */}
      <circle cx="380" cy="170" r="7" fill="none" stroke={accent} strokeWidth="2" />
      {/* Branches */}
      <path d="M230 170 Q 240 80 320 60" fill="none" stroke="hsl(var(--secondary))" strokeWidth="2" />
      <path d="M230 170 Q 240 260 320 280" fill="none" stroke="hsl(var(--secondary))" strokeWidth="2" />
      <path d="M170 170 L380 170" stroke="hsl(var(--secondary))" strokeWidth="2" />
      <path d="M110 170 L60 170" stroke="hsl(var(--secondary))" strokeWidth="2" />
      <text x="100" y="200" fontSize="11" fill={muted}>× = open-loop pole, ○ = zero, branches → as K increases</text>
    </>,
    "0 0 600 320", "Root locus"
  );
}

export function PlcArchitectureDiagram() {
  return wrap(
    <>
      <Defs />
      <text x="300" y="22" textAnchor="middle" fill={accent} fontWeight="600">PLC architecture</text>
      <Block x={250} y={120} w={100} h={50} label="CPU" fill="hsl(var(--primary)/0.15)" />
      <Block x={60} y={120} w={120} h={50} label="Input module" />
      <Block x={420} y={120} w={120} h={50} label="Output module" />
      <Block x={250} y={40} w={100} h={40} label="Memory" />
      <Block x={250} y={220} w={100} h={40} label="Power supply" />
      <Arrow x1="180" y1="145" x2="250" y2="145" />
      <Arrow x1="350" y1="145" x2="420" y2="145" />
      <Arrow x1="300" y1="80" x2="300" y2="120" />
      <Arrow x1="300" y1="220" x2="300" y2="170" />
      <text x="120" y="195" textAnchor="middle" fontSize="11" fill={muted}>field sensors</text>
      <text x="480" y="195" textAnchor="middle" fontSize="11" fill={muted}>actuators</text>
    </>,
    "0 0 600 280", "PLC architecture"
  );
}

const REGISTRY: Record<string, React.FC<Props>> = {
  "closed-loop": ClosedLoopDiagram,
  "open-loop": OpenLoopDiagram,
  "dcs-pyramid": DcsPyramidDiagram,
  "automation-pyramid": DcsPyramidDiagram,
  "pneumatic-valve": PneumaticValveDiagram,
  "control-valve": PneumaticValveDiagram,
  "butterfly-valve": ButterflyValveDiagram,
  "bode": BodeDiagram,
  "nyquist": NyquistDiagram,
  "root-locus": RootLocusDiagram,
  "plc": PlcArchitectureDiagram,
  "plc-architecture": PlcArchitectureDiagram,
};

export function Diagram({ name }: { name: string }) {
  const key = name.trim().toLowerCase();
  const Comp = REGISTRY[key];
  if (!Comp) {
    return (
      <div className="my-3 rounded border border-dashed border-border p-3 text-sm text-muted-foreground">
        Unknown diagram: <code>{name}</code> — available:{" "}
        {Object.keys(REGISTRY).join(", ")}
      </div>
    );
  }
  return <Comp />;
}

export const DIAGRAM_NAMES = Object.keys(REGISTRY);
