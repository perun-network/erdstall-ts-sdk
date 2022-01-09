import PRNG from "./random";
import { newRandomUint64 } from "./bigint";
import { PhaseShift } from "#erdstall/api/responses";

export function newRandomPhaseShift(rng: PRNG): PhaseShift {
	return new PhaseShift(newRandomUint64(rng));
}
