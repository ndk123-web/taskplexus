import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Todo {
  id: number;
  task: string;
  done: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

interface TodoState {
  todos: Todo[];
  addTodo: (task: Todo) => void;
  deleteTodo: (id: number) => void;
  clearTodos: () => void;
}

const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],

      addTodo: (task) => set({ todos: [...get().todos, task] }),

      deleteTodo: (id) =>
        set({ todos: get().todos.filter((t) => t.id !== id) }),

      clearTodos: () => set({ todos: [] }),
    }),
    {
      name: "user-todos", // localStorage key
    }
  )
);

export default useTodoStore;
