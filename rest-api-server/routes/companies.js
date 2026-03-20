import { Router } from "express";
import { getAllCompaniesHandler } from "#api/controllers/companies.js";

const companiesRouter = Router();

companiesRouter.get('/', getAllCompaniesHandler);

export default companiesRouter;
