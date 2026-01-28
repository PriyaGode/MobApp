package com.OriginHubs.Amraj.util;

import jakarta.annotation.PostConstruct;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import javax.sql.DataSource;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.migration.enabled", havingValue = "true", matchIfMissing = false)
public class DatabaseMigrationUtil {

    private final DataSource dataSource;

    public DatabaseMigrationUtil(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void migrateDatabase() {
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            System.out.println("Starting database schema migration...");
            executeStatement(stmt, "ALTER TABLE user_accounts DROP CONSTRAINT IF EXISTS fk_user_accounts_hub_id CASCADE",
                    "Dropped foreign key constraint");
            executeStatement(stmt, "DROP TABLE IF EXISTS hubs CASCADE", "Dropped hubs table");
            executeStatement(stmt, "DROP TABLE IF EXISTS user_activity_logs CASCADE", "Dropped user_activity_logs");
            executeStatement(stmt, "DROP TABLE IF EXISTS user_accounts CASCADE", "Dropped user_accounts table");
            System.out.println("Migration completed! Hibernate will recreate tables.");
        } catch (SQLException e) {
            throw new RuntimeException("Database migration failed", e);
        }
    }

    private void executeStatement(Statement stmt, String sql, String successMsg) {
        try {
            stmt.execute(sql);
            System.out.println("✓ " + successMsg);
        } catch (SQLException e) {
            System.out.println("Note: " + e.getMessage());
        }
    }
}
