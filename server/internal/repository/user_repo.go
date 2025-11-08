package repository

import (
	"context"
	"errors"
	"time"

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
	SignUpUser(ctx context.Context, email string, password string, fullName string) (*SignUpResponse, error)
	SignInUser(ctx context.Context, email string, password string) (*SignUpResponse, error)
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

func (r *userRepo) SignUpUser(ctx context.Context, email string, password string, fullName string) (*SignUpResponse, error) {

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

func ValidatePassword(password string, hashedPassword string) (bool, error) {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return false, err
	}
	return true, nil
}

func NewUserRepository(todoCol *mongo.Collection, userCol *mongo.Collection) UserRepository {
	return &userRepo{
		todoCollection: todoCol,
		userColletion:  userCol,
	}
}
