import { DataSource } from "typeorm";
import { ConfigService } from './src/config-service'

const cfg = new ConfigService();

const PostgresDataSource = new DataSource({
    type: "postgres",
    host: cfg.get('DB_HOST'),
    port: Number(cfg.get('DB_PORT')),
    username: cfg.get('DB_NAME'),
    password: cfg.get('DB_PASSWORD'),
    database: cfg.get('DB_USER'),
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['src/migrations/*{.ts,.js}'],
    migrationsRun: false,
    synchronize: false,
})

export default PostgresDataSource;
