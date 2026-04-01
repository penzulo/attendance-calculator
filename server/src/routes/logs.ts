import { LogService } from "@server/services";
import { Elysia, StatusMap, t } from "elysia";

const logService = new LogService();

export const logRoutes = new Elysia({ prefix: "/logs" }).get();
