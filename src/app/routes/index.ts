import { IRoute } from "@/types/app.js";
import UserRoutes from "@/app/routes/user/index.js";

const routes: IRoute[] = [...Object.values({ ...UserRoutes })];

export default routes;
