import { DataSource } from "typeorm"
import ormconfig from "../ormconfig.json"
import { Order } from "./entities/order.entity";
import { User } from "./entities/user.entity";

const appDataSource = new DataSource({
    ...(ormconfig as any),
    entities: [Order, User],
});

export default appDataSource;
