package main

import (
	"fmt"
	"log"

	"github.com/ndk123-web/fast-todo/internal/app"
)

func main() {
	fmt.Println("Fast-Todo App Working...")

	if err := app.Run(); err != nil {
		log.Fatal("Error In Running the App")
	}
}
