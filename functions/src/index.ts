import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import { app as expressApp } from "../../server.ts";

/**
 * Firebase Cloud Functions HTTP entrypoint for Cainta Photography MIS.
 * 
 * Requests arriving at:
 *   - https://<region>-<project-id>.cloudfunctions.net/api/api/studios
 *   - or https://<region>-<project-id>.cloudfunctions.net/api/studios
 * 
 * Both forms are routed smoothly to the Express endpoints.
 */
const rootApp = express();

rootApp.use((req, _res, next) => {
  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url === "/" ? "" : req.url}`;
  }
  next();
});

rootApp.use(expressApp);

export const api = onRequest(
  {
    region: "us-central1",
    cors: true,
    timeoutSeconds: 120,
    memory: "512MiB",
    maxInstances: 10,
    minInstances: 0,
  },
  rootApp
);
