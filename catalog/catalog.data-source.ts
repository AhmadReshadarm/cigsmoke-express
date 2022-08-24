import { DataSource } from "typeorm";
import { Brand, Category, Color, Parameter, ParameterProducts, Product, ProductVariant, Tag } from '../core/entities';

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
    entities: [ProductVariant, Product, Category, Color, Brand, Parameter, Tag, ParameterProducts],
});

export default dataSource;
