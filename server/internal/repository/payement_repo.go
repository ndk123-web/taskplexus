package repository

import "database/sql"

type PayementRepository interface {
	// define methods for payment repository
	CreatePayement(amount float64, currency string) (string, error)
}

type payementRepository struct {
	// here sql type will be used
	payementCollection sql.DB
}

func (p *payementRepository) CreatePayement(amount float64, currency string) (string, error) {
	return "", nil
}

func NewPayementRepository(db sql.DB) PayementRepository {
	return &payementRepository{
		payementCollection: db,
	}
}
