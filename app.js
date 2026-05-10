// =====================================
// UNIT CONSTANTS
// =====================================

const LB_TO_KG = 0.45359237;
const IN_TO_MM = 25.4;
const GAL_TO_L = 3.78541;

// =====================================
// AIRCRAFT DATA — CONFIRMED FROM MANUAL
// =====================================

// Basic Empty Condition (matched pair)
const BEW_LB = 2231;
const BEW_MOM_DIV100 = 1712;

// Convert empty values
const BEW_KG = BEW_LB * LB_TO_KG;

// moment conversion:
// (moment/100 × 100) gives lb*in
// convert to kg*mm
const BEW_MOMENT = BEW_MOM_DIV100 * 100 * LB_TO_KG * IN_TO_MM;

// Arms (your confirmed stations)
const ARM_PILOT = 77 * IN_TO_MM;
const ARM_REAR1 = 115 * IN_TO_MM;
const ARM_REAR2 = 120 * IN_TO_MM;
const ARM_BAG1 = 91 * IN_TO_MM;
const ARM_BAG2 = 150 * IN_TO_MM;
const ARM_FUEL = 75 * IN_TO_MM;

// Limits
const BAG1_MAX = 40 * LB_TO_KG;
const BAG2_MAX = 400 * LB_TO_KG;
const MTOW_KG = 3600 * LB_TO_KG;

// Fuel
const FUEL_LB_PER_GAL = 6;
const TAXI_FUEL_LB = 12;

const CG_SCALE_MIN = 70;   // left edge of diagram scale
const CG_SCALE_MAX = 90;   // right edge of diagram scale

// =====================================
// CG ENVELOPE — FROM YOUR TABLE
// =====================================

const envelope = [
{w:3100, fwd:74.0, aft:87.7},
{w:3200, fwd:75.4, aft:87.7},
{w:3400, fwd:78.2, aft:87.7},
{w:3600, fwd:81.0, aft:87.7}
];

// interpolate forward limit
function interpFwd(weightLb) {
if (weightLb <= 3100) return 74.0;
if (weightLb >= 3600) return 81.0;

for (let i=0;i<envelope.length-1;i++) {
let a = envelope[i];
let b = envelope[i+1];
if (weightLb >= a.w && weightLb <= b.w) {
let t = (weightLb-a.w)/(b.w-a.w);
return a.fwd + t*(b.fwd-a.fwd);
}
}
}
function updateCGDiagram(cg_in, fwd, aft) {

const track = document.querySelector(".cg-track");
const dot = document.getElementById("cgDot");
const zone = document.getElementById("cgZone");

const trackW = track.clientWidth;

// convert inch → %
function toPct(val){
return (val - CG_SCALE_MIN) / (CG_SCALE_MAX - CG_SCALE_MIN);
}

// limit zone
let leftPct = toPct(fwd);
let rightPct = toPct(aft);

zone.style.left = (leftPct * trackW) + "px";
zone.style.width = ((rightPct-leftPct) * trackW) + "px";

// CG dot
let cgPct = toPct(cg_in);
dot.style.left = (cgPct * trackW - 11) + "px";

// color if out of limits
if (cg_in < fwd || cg_in > aft) {
dot.style.background = "#ef4444";
} else {
dot.style.background = "#22c55e";
}

// labels
document.getElementById("cgFwdLabel").innerText =
`FWD ${fwd.toFixed(1)} in`;

document.getElementById("cgAftLabel").innerText =
`AFT ${aft.toFixed(1)} in`;

}
// =====================================
// MAIN CALCULATION
// =====================================

function calculate() {

let pilot = +pilotEl().value || 0;
let copilot = +copilotEl().value || 0;
let rear1 = +rear1El().value || 0;
let rear2 = +rear2El().value || 0;
let bag1 = +bag1El().value || 0;
let bag2 = +bag2El().value || 0;
let fuelL = +fuelEl().value || 0;

let warnings = [];

// baggage limits
if (bag1 > BAG1_MAX) warnings.push("Front baggage exceeds limit");
if (bag2 > BAG2_MAX) warnings.push("Rear baggage exceeds limit");

// fuel conversion
let fuelGal = fuelL / GAL_TO_L;
let fuelLb = fuelGal * FUEL_LB_PER_GAL - TAXI_FUEL_LB;
if (fuelLb < 0) fuelLb = 0;
let fuelKg = fuelLb * LB_TO_KG;

// total moment
let moment =
BEW_MOMENT +
pilot*ARM_PILOT +
copilot*ARM_PILOT +
rear1*ARM_REAR1 +
rear2*ARM_REAR2 +
bag1*ARM_BAG1 +
bag2*ARM_BAG2 +
fuelKg*ARM_FUEL;

// total mass
let mass =
BEW_KG + pilot + copilot + rear1 + rear2 + bag1 + bag2 + fuelKg;

// CG
let cg_mm = moment / mass;
let cg_in = cg_mm / IN_TO_MM;

// envelope check
let weightLb = mass / LB_TO_KG;
let fwd = interpFwd(weightLb);
let aft = 87.7;

if (mass > MTOW_KG) warnings.push("Over MTOW");
if (cg_in < fwd) warnings.push("CG too far forward");
if (cg_in > aft) warnings.push("CG too far aft");

// output
out().innerHTML = `
Total Mass: <b>${mass.toFixed(1)} kg</b><br>
CG: <b>${cg_mm.toFixed(0)} mm (${cg_in.toFixed(2)} in)</b><br>
Envelope: ${fwd.toFixed(1)} – ${aft} in<br>
Status: ${warnings.length ? warnings.join("<br>") : "Within limits ✅"}
`;

}

// DOM helpers
const pilotEl = ()=>document.getElementById("pilot");
const copilotEl = ()=>document.getElementById("copilot");
const rear1El = ()=>document.getElementById("rear1");
const rear2El = ()=>document.getElementById("rear2");
const bag1El = ()=>document.getElementById("bag1");
const bag2El = ()=>document.getElementById("bag2");
const fuelEl = ()=>document.getElementById("fuel");
const out = ()=>document.getElementById("out");