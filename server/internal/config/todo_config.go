package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoUri string
	Port     string
}

func LoadConfig() (*Config, error) {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error Loading .env file")
	}

	return &Config{
		MongoUri: os.Getenv("MONGO_URI"),
		Port:     os.Getenv("DEVLOPMENT_PORT"),
	}, nil
}
