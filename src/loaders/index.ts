import express from "express";
import expressLoader from "./express";
import prismaLoader from "./prisma";
import Container from "typedi";

export default async (app: express.Application) => {
  expressLoader(app);
  const prisma = prismaLoader();
  Container.set("prisma", prisma);
};
