import { Elysia, t, StatusMap } from "elysia";
import { LogService } from "@server/services";

const logService = new LogService();

export const logRoutes = new Elysia({ prefix: "/logs" }).get();
