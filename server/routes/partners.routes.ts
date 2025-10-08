import { Router } from "express";
import { createPartner, deletePartner, getPartnerById, getPartners, updatePartner } from "../controllers/partners.ts";
import { fileUpload } from "../middleware/multer.ts";

const partnerRouter = Router()

partnerRouter.route("/partners")
  .post(fileUpload, createPartner)
  .get(getPartners); 

partnerRouter.route("/partners/:id").get(getPartnerById).patch(updatePartner).delete(deletePartner);
  
export default partnerRouter;