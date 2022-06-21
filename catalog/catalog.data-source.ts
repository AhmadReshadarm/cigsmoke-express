import { DataSource } from "typeorm"
import { Category, Color, Product, Brand} from '../core/entities';
import { Parameter } from '../core/entities/catalog/parameter.entity';


const dataSource = new DataSource({
    type: "mysql",
    host: process.env.MYSQL_HOST,
    port: 3306,
    username: "root",
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    logging: true,
    synchronize: true,
    migrationsRun: false,
    entities: [Product, Category, Color, Brand, Parameter],
});

export default dataSource;
