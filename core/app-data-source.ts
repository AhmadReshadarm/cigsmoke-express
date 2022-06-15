import { DataSource } from "typeorm"
import { Order } from "./entities/order.entity";
import { User } from "./entities/user.entity";
import { Item } from './entities/item.entity';

const appDataSource = new DataSource({
    type: "mysql",
    host: process.env.MYSQL_HOST,
    port: 3306,
    username: "root",
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    logging: true,
    synchronize: true,
    migrationsRun: false,
    entities: [Order, User, Item],
});

export default appDataSource;
