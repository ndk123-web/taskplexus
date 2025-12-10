package config

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

func ConnectPostgresDB() (*pgxpool.Pool, error) {
	connStr := "postgres://ndk:ndk123@localhost:5432/taskplexus?sslmode=disable"

	fmt.Println("Connecting to Postgres...")
	
	pool, err := pgxpool.New(context.Background(), connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect postgres: %w", err)
	}
	
	err = pool.Ping(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to ping postgres: %w", err)
	}
	
	fmt.Println("Connected to Postgres successfully")
	return pool, nil
}
