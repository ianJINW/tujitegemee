import { Router } from "express";
import uploads from "../middleware/multer.ts";
import { createDocument, deleteDocumentById, getDocumentById, listDocuments } from "../controllers/docs.ts";

const documentRouter = Router();

documentRouter
  .route("/documents")
  .get(listDocuments)
  .post( uploads.single('docs') ,createDocument);

documentRouter
  .route("/documents/:id")
  .get(getDocumentById)
/*   .put(updateArticle)
 */  .delete(deleteDocumentById);

export default documentRouter;
