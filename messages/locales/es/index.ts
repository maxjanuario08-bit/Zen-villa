import chrome from "./chrome";
import site from "./site";
import { ownerServices } from "./ownerServices";
import { guestServices } from "./guestServices";
import { ownerBenefits } from "./ownerBenefits";
import livretVillaPinson from "./livretVillaPinson";
import Logements from "./logements";
import Compte from "./compte";
import Admin from "./admin";

export default {
  ...chrome,
  ...site,
  ownerServices,
  guestServices,
  ownerBenefits,
  livretVillaPinson,
  Logements,
  Compte,
  Admin,
};
