import { simulateWorldCup } from "../utils/tournamentSimulation.js";

self.onmessage = (event) => {
  const { groupsTemplate, matches, iterations } = event.data;
  self.postMessage(simulateWorldCup(groupsTemplate, matches, iterations));
};
