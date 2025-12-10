package config

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var PostgresPool *pgxpool.Pool

func ConnectPostgresDB() {
	connStr := os.Getenv("POSTGRES_URL")

	// fmt.Println("Connecting to Postgres...")

	pool, err := pgxpool.New(context.Background(), connStr)
	if err != nil {
		fmt.Println("failed to connect postgres: %w", err)
	}

	err = pool.Ping(context.Background())
	if err != nil {
		fmt.Println("failed to ping postgres: %w", err)
	}

	fmt.Println("Connected to Postgres successfully")

	PostgresPool = pool
}
