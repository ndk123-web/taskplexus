package repository

import (
	"context"
	"errors"
	"time"

	"github.com/ndk123-web/fast-todo/internal/config"
	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/pkg/nbcrypt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type UserStruct struct {
	Email     string    `json:"email" bson:"email"`
	Password  string    `json:"password" bson:"password"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" bson:"updatedAt"`
	FullName  string    `json:"fullName,omitempty" bson:"fullName"`
}

type UserRepository interface {
	GetUserTodos(ctx context.Context, userId string) ([]model.Todo, error)
	SignUpUserMongo(ctx context.Context, email string, password string, fullName string) (*SignUpResponse, error)
	SignUpUserPostgres(ctx context.Context, email string, password string, fullName string) (*SignUpResponse, error)
	SignInUser(ctx context.Context, email string, password string) (*SignUpResponse, error)
	UpdateUserName(ctx context.Context, userId string, newName string) (bool, error)
	SignInGoogleUser(ctx context.Context, email string, fullName string) (*SignUpResponse, error)
	SignUpWithGoogle(ctx context.Context, email string, fullName string) (*SignUpResponse, error)
	DeleteUserByEmail(ctx context.Context, email string) error
	DeleteUserFromPostgres(ctx context.Context, email string) error
}

type userRepo struct {
	todoCollection *mongo.Collection
	userColletion  *mongo.Collection
}

func (r *userRepo) GetUserTodos(ctx context.Context, userId string) ([]model.Todo, error) {

	if userId == "" {
		return []model.Todo{}, errors.New("UserId Cant Be Empty")
	}

	// convert the string -> Object ID
	oid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return []model.Todo{}, err
	}

	// create the filter
	filter := bson.M{"_id": oid}

	cursor, err2 := r.todoCollection.Find(ctx, filter)
	if err2 != nil {
		return []model.Todo{}, err2
	}

	// in the end free the resources
	defer cursor.Close(ctx)

	// result array
	var userTodos []model.Todo

	// loop over response cursor
	for cursor.Next(ctx) {
		var userTodo model.Todo
		if err := cursor.Decode(&userTodo); err != nil {
			return []model.Todo{}, err
		}

		// append answers
		userTodos = append(userTodos, userTodo)
	}

	return userTodos, nil
}

type SignUpResponse struct {
	Email        string `json:"email"`
	AccessToken  string `json:"_accessToken"`
	UserId       string `json:"userId"`
	RefreshToken string `json:"_refreshToken"`
	FullName     string `json:"fullName,omitempty"`
}

func (r *userRepo) SignUpUserMongo(ctx context.Context, email string, password string, fullName string) (*SignUpResponse, error) {

	var user UserStruct
	// before we need to find if email already exist
	err2 := r.userColletion.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err2 == nil {
		// if nil means already exists
		return nil, errors.New("User Already Exists")
	} else if !errors.Is(err2, mongo.ErrNoDocuments) {
		// other db error
		return nil, err2
	}

	// else safe
	// we need to hash the password before storing inside DB
	currentUser := UserStruct{Email: email, Password: password, CreatedAt: time.Now(), UpdatedAt: time.Now(), FullName: fullName}
	// we need to store the user in Mongodb
	inserted, err := r.userColletion.InsertOne(ctx, currentUser)
	if err != nil {
		return nil, err
	}

	// convert the objectId to string
	oid := inserted.InsertedID.(primitive.ObjectID)
	userId := oid.Hex()

	return &SignUpResponse{
		Email:    email,
		UserId:   userId,
		FullName: fullName,
	}, nil
}

func (r *userRepo) SignUpUserPostgres(ctx context.Context, email string, password string, fullName string) (*SignUpResponse, error) {
	// Check if user already exists
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)`
	err := config.PostgresPool.QueryRow(ctx, checkQuery, email).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("User Already Exists")
	}
	// Insert new user
	insertQuery := `
		INSERT INTO users (id, email, name, password, created_at, updated_at, plan_limit, is_premium)
		VALUES ($1, $2, $3, $4, NOW(), NOW(), $5, $6)
		RETURNING id
	`
	userId := primitive.NewObjectID().Hex()
	_, err = config.PostgresPool.Exec(ctx, insertQuery, userId, email, fullName, password, 10, false)
	if err != nil {
		return nil, err
	}
	return &SignUpResponse{
		Email:    email,
		UserId:   userId,
		FullName: fullName,
	}, nil
}

func (r *userRepo) SignUpWithGoogle(ctx context.Context, email string, fullName string) (*SignUpResponse, error) {
	if email == "" || fullName == "" {
		return nil, errors.New("Email/FullName is Missing in Repo")
	}

	// Try to find existing user
	filter := bson.M{"email": email}

	var existing SignInUserRequest
	err := r.userColletion.FindOne(ctx, filter).Decode(&existing)
	if err == nil {
		// user exists -> error
		return nil, errors.New("User Already Exists")
	}
	if !errors.Is(err, mongo.ErrNoDocuments) {
		// other db error
		return nil, err
	}
	// no documents -> create new user
	randPass := primitive.NewObjectID().Hex()
	hashed, hErr := nbcrypt.BcryptForPassword(randPass)
	if hErr != nil {
		return nil, hErr
	}
	now := time.Now()
	newUser := UserStruct{Email: email, Password: hashed, CreatedAt: now, UpdatedAt: now, FullName: fullName}
	inserted, iErr := r.userColletion.InsertOne(ctx, newUser)
	if iErr != nil {
		return nil, iErr
	}
	oid := inserted.InsertedID.(primitive.ObjectID)
	return &SignUpResponse{Email: email, UserId: oid.Hex(), FullName: fullName}, nil
}

type SignInUserRequest struct {
	Email          string             `json:"email" bson:"email"`
	ID             primitive.ObjectID `json:"_id" bson:"_id"`
	HashedPassword string             `json:"password" bson:"password"`
	FullName       string             `json:"fullName,omitempty" bson:"fullName,omitempty"`
}

func (r *userRepo) SignInUser(ctx context.Context, email string, password string) (*SignUpResponse, error) {
	// if user exist
	// check password
	// if yes then create jwt access and refresh token
	// return that
	filter := bson.M{"email": email}
	res := r.userColletion.FindOne(ctx, filter)

	var user SignInUserRequest
	res.Decode(&user)

	//password checking
	ok, err := nbcrypt.ValidatePassword(password, user.HashedPassword)
	if !ok || err != nil {
		return nil, err
	}

	userId := user.ID.Hex()
	updated := bson.M{"$set": bson.M{"updatedAt": time.Now()}}
	updatedResult := r.userColletion.FindOneAndUpdate(ctx, filter, updated)
	if err := updatedResult.Err(); err != nil {
		return nil, err
	}

	return &SignUpResponse{
		Email:    email,
		UserId:   userId,
		FullName: user.FullName,
	}, nil
}

// SignInGoogleUser will upsert a user (create if not exists) without password auth
// Used when Google ID token already verified upstream.
func (r *userRepo) SignInGoogleUser(ctx context.Context, email string, fullName string) (*SignUpResponse, error) {
	if email == "" {
		return nil, errors.New("email empty")
	}

	// Find existing user only; do NOT create here.
	filter := bson.M{"email": email}
	var existing SignInUserRequest
	err := r.userColletion.FindOne(ctx, filter).Decode(&existing)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("User Not Found. Please sign up first")
		}
		return nil, err
	}

	// Existing user: optionally update name and updatedAt
	if fullName != "" && existing.FullName == "" {
		_, _ = r.userColletion.UpdateOne(ctx, filter, bson.M{"$set": bson.M{"fullName": fullName, "updatedAt": time.Now()}})
		existing.FullName = fullName
	} else {
		_, _ = r.userColletion.UpdateOne(ctx, filter, bson.M{"$set": bson.M{"updatedAt": time.Now()}})
	}

	return &SignUpResponse{Email: email, UserId: existing.ID.Hex(), FullName: existing.FullName}, nil
}

func ValidatePassword(password string, hashedPassword string) (bool, error) {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return false, err
	}
	return true, nil
}

func (r *userRepo) UpdateUserName(ctx context.Context, userId string, newName string) (bool, error) {
	if userId == "" || newName == "" {
		return false, errors.New("userId or newName is empty")
	}

	userIdOid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return false, err
	}

	filter := bson.M{"_id": userIdOid}
	update := bson.M{"$set": bson.M{"fullName": newName, "updatedAt": time.Now()}}

	updated, err := r.userColletion.UpdateOne(ctx, filter, update)

	if err != nil {
		return false, err
	}

	return updated.ModifiedCount > 0, nil
}

// DeleteUserByEmail deletes a user from both MongoDB and PostgreSQL by email
// Used for complete cleanup when needed
func (r *userRepo) DeleteUserByEmail(ctx context.Context, email string) error {
	if email == "" {
		return errors.New("email is empty")
	}

	// Delete from MongoDB
	filter := bson.M{"email": email}
	result, err := r.userColletion.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return errors.New("user not found in MongoDB")
	}

	// Delete from PostgreSQL
	deleteQuery := `DELETE FROM users WHERE email = $1`
	pgResult, err := config.PostgresPool.Exec(ctx, deleteQuery, email)
	if err != nil {
		return err
	}
	if pgResult.RowsAffected() == 0 {
		return errors.New("user not found in PostgreSQL")
	}

	return nil
}

// DeleteUserFromPostgres deletes a user from PostgreSQL only
// Used for rollback when Mongo signup fails (Postgres already has user, Mongo doesn't)
func (r *userRepo) DeleteUserFromPostgres(ctx context.Context, email string) error {
	if email == "" {
		return errors.New("email is empty")
	}

	deleteQuery := `DELETE FROM users WHERE email = $1`
	pgResult, err := config.PostgresPool.Exec(ctx, deleteQuery, email)
	if err != nil {
		return err
	}
	if pgResult.RowsAffected() == 0 {
		return errors.New("user not found in PostgreSQL")
	}

	return nil
}

func NewUserRepository(todoCol *mongo.Collection, userCol *mongo.Collection) UserRepository {
	return &userRepo{
		todoCollection: todoCol,
		userColletion:  userCol,
	}
}
