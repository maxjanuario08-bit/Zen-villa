import GuestPresentation from "./guestPresentation";
import FormulaComparison from "./formulaComparison";
import HomePresentation from "./homePresentation";
import Assistant from "./assistant";
import PropertyReviews from "./propertyReviews";
import PasswordRecovery from "./passwordRecovery";
import chrome from "./chrome";
import site from "./site";
import { ownerServices } from "./ownerServices";
import { guestServices } from "./guestServices";
import { ownerBenefits } from "./ownerBenefits";
import livretVillaPinson from "./livretVillaPinson";
import Logements from "./logements";
import Compte from "./compte";
import Admin from "./admin";
import Equipe from "./equipe";

export default {
  GuestPresentation,
  FormulaComparison,
  HomePresentation,
  Assistant,
  PasswordRecovery,
  PropertyReviews,
  ...chrome,
  ...site,
  ownerServices,
  guestServices,
  ownerBenefits,
  livretVillaPinson,
  Logements,
  Compte,
  Admin,
  Equipe,
};
