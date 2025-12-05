package service

import (
    "context"
    "testing"

    "github.com/ndk123-web/fast-todo/internal/repository"
)

func TestActivityHandleType(t *testing.T) {
    // Create mock or dummy repo
    var mockRepo *repository.ActivityRepository = nil // placeholder

    svc := NewActivityService(mockRepo)

    data := map[string]any{"hi": "hi"}

    _, err := svc.HandleActivityEvent(context.Background(), data)
    if err != nil {
        t.Fatalf("Something went wrong: %v", err)
    }

    t.Log("Success Run")
}
