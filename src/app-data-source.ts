import { DataSource } from "typeorm"
import { Order } from "./entities/order";

const appDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "db_cigsmoke",
    // entities: ["/src/entities/*.ts"],
    entities: [Order],
    logging: true,
    synchronize: true,
    migrationsRun: false,
});

export default appDataSource;