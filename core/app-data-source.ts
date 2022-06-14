import { DataSource } from "typeorm"
import { Order } from "./entities/order.entity";
import { User } from "./entities/user.entity";

const appDataSource = new DataSource({
    type: "mysql",
    host: "db",
    port: 3306,
    username: "root",
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    logging: true,
    synchronize: true,
    migrationsRun: false,
    entities: [Order, User],
});

export default appDataSource;
