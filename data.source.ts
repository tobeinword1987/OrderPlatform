import { DataSource } from "typeorm";
import { ConfigService } from './src/config-service'

const cfg = new ConfigService();

const PostgresDataSource = new DataSource({
    type: "postgres",
    host: cfg.get('DB_HOST'),
    port: Number(cfg.get('DB_PORT')),
    username: cfg.get('DB_USER'),
    password: cfg.get('DB_PASSWORD'),
    database: cfg.get('DB_NAME'),
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['src/migrations/*{.ts,.js}'],
    migrationsRun: false,
    synchronize: false,
    cache: {
        duration: 3000,
        type: "database",
        tableName: "configurable-table-query-result-cache"
    }
})

export default PostgresDataSource;
