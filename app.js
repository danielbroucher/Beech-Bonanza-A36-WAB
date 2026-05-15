

const LB_TO_KG = 0.45359237;
const IN_TO_MM = 25.4;
const GAL_TO_L = 3.78541;


const BEW_LB = 2231;
const BEW_MOM_DIV100 = 1712;


const BEW_KG = BEW_LB * LB_TO_KG;


const BEW_MOMENT = BEW_MOM_DIV100 * 100 * LB_TO_KG * IN_TO_MM;


const ARM_PILOT = 77 * IN_TO_MM;
const ARM_REAR1 = 115 * IN_TO_MM;
const ARM_REAR2 = 120 * IN_TO_MM;
const ARM_BAG1 = 91 * IN_TO_MM;
const ARM_BAG2 = 150 * IN_TO_MM;
const ARM_FUEL = 75 * IN_TO_MM;


const BAG1_MAX = 40 * LB_TO_KG;
const BAG2_MAX = 400 * LB_TO_KG;
const MTOW_KG = 3600 * LB_TO_KG;


const FUEL_LB_PER_GAL = 6;
const TAXI_FUEL_LB = 12;

const CG_SCALE_MIN = 70;   
const CG_SCALE_MAX = 90;   



const AFT_LIMIT = 87.7;


function calculate() {

let pilot = +pilotEl().value || 0;
let copilot = +copilotEl().value || 0;
let rear1 = +rear1El().value || 0;
let bag1 = +bag1El().value || 0;
let bag2 = +bag2El().value || 0;
let fuelL = +fuelEl().value || 0;

let bewMass = +bewMassEl().value || BEW_KG;
let bewCgIn = +bewCgEl().value || (BEW_MOMENT / BEW_KG / IN_TO_MM);
let bewMoment = bewMass * bewCgIn * IN_TO_MM;

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
bewMoment +
pilot*ARM_PILOT +
copilot*ARM_PILOT +
rear1*ARM_REAR1 +
bag1*ARM_BAG1 +
bag2*ARM_BAG2 +
fuelKg*ARM_FUEL;

// total mass
let mass =
bewMass + pilot + copilot + rear1 + bag1 + bag2 + fuelKg;
let massLb = mass / LB_TO_KG;

// CG
let cg_mm = moment / mass;
let cg_in = cg_mm / IN_TO_MM;

let overMtow = mass > MTOW_KG;
let cgTooFwd = cg_in < 77.0;
let cgTooAft = cg_in > AFT_LIMIT;

if (overMtow) {
  warnings.push(`Over MTOW - ${MTOW_KG.toFixed(1)} kg (${(MTOW_KG / LB_TO_KG).toFixed(0)} lb)`);
} else if (cgTooFwd) {
  warnings.push("CG is likely out of limits. Check the image below with CG and weight in lb.");
} else if (cgTooAft) {
  warnings.push("CG is too far aft. Check the image below with CG and weight in lb.");
}

// output
out().innerHTML = `
Total Mass: <b>${mass.toFixed(1)} kg (${massLb.toFixed(0)} lb)</b><br>
CG: <b>${cg_mm.toFixed(0)} mm (${cg_in.toFixed(2)} in)</b><br>
Status: ${warnings.length ? warnings.join("<br>") : "Check the image below with CG and weight in lb."}
`;

}

// DOM helpers
const bewMassEl = ()=>document.getElementById("bewMass");
const bewCgEl = ()=>document.getElementById("bewCg");
const pilotEl = ()=>document.getElementById("pilot");
const copilotEl = ()=>document.getElementById("copilot");
const rear1El = ()=>document.getElementById("rear1");
const bag1El = ()=>document.getElementById("bag1");
const bag2El = ()=>document.getElementById("bag2");
const fuelEl = ()=>document.getElementById("fuel");
const out = ()=>document.getElementById("out");