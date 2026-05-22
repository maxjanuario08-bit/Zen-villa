import chrome from "./chrome";
import site from "./site";
import { ownerServices } from "./ownerServices";
import { guestServices } from "./guestServices";
import { ownerBenefits } from "./ownerBenefits";

export default {
  ...chrome,
  ...site,
  ownerServices,
  guestServices,
  ownerBenefits,
};
