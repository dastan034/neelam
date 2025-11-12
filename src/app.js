import React, { useEffect, useMemo, useState } from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";

const FILTERS = {
  all: () => true,
  active: (todo) => !todo.completed,
  completed: (todo) => todo.completed,
};

const FILTER_LABELS = {
  all: "All",
  active: "Active",
  completed: "Completed",
};

const STORAGE_KEY = "neelam-react-todos";

function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item) =>
      typeof item === "object" &&
      item !== null &&
      typeof item.id === "string" &&
      typeof item.text === "string" &&
      typeof item.completed === "boolean"
    );
  } catch (error) {
    console.warn("Failed to load todos from storage", error);
    return [];
  }
}

function App() {
  const [todos, setTodos] = useState(() => loadTodos());
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.warn("Failed to save todos", error);
    }
  }, [todos]);

  const activeCount = useMemo(
    () => todos.reduce((total, todo) => total + (todo.completed ? 0 : 1), 0),
    [todos]
  );

  const completedCount = todos.length - activeCount;

  const filteredTodos = useMemo(
    () => todos.filter(FILTERS[filter] ?? FILTERS.all),
    [todos, filter]
  );

  function addTodo(event) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    setTodos((current) => [
      {
        id: crypto.randomUUID(),
        text: trimmed,
        completed: false,
      },
      ...current,
    ]);
    setDraft("");
  }

  function toggleTodo(id) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  function renameTodo(id, text) {
    const trimmed = text.trim();
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, text: trimmed || todo.text } : todo
      )
    );
  }

  function removeTodo(id) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  function toggleAll() {
    setTodos((current) => {
      const allComplete = current.every((todo) => todo.completed);
      return current.map((todo) => ({ ...todo, completed: !allComplete }));
    });
  }

  function clearCompleted() {
    setTodos((current) => current.filter((todo) => !todo.completed));
  }

  const e = React.createElement;

  return e(
    "div",
    { className: "app" },
    e(
      "header",
      { className: "app__header" },
      e("h1", { className: "app__title" }, "Todo List"),
      e(
        "form",
        { className: "todo-form", onSubmit: addTodo },
        e("input", {
          className: "todo-form__input",
          placeholder: "What needs to be done?",
          value: draft,
          onChange: (event) => setDraft(event.target.value),
        }),
        e(
          "button",
          { className: "todo-form__submit", type: "submit" },
          "Add"
        )
      ),
      todos.length > 0
        ? e(
            "button",
            { type: "button", className: "toggle-all", onClick: toggleAll },
            "Toggle all"
          )
        : null
    ),
    e(
      "section",
      { className: "todo-list" },
      filteredTodos.length === 0
        ? e(
            "p",
            { className: "todo-list__empty" },
            filter === "completed"
              ? "You have not completed any tasks yet."
              : "Nothing to see here yet. Add a task to get started!"
          )
        : filteredTodos.map((todo) =>
            e(
              "article",
              {
                key: todo.id,
                className: `todo-card${todo.completed ? " todo-card--completed" : ""}`,
              },
              e(
                "label",
                { className: "todo-card__checkbox" },
                e("input", {
                  type: "checkbox",
                  checked: todo.completed,
                  onChange: () => toggleTodo(todo.id),
                }),
                e("span", { className: "checkbox" })
              ),
              e(
                "div",
                { className: "todo-card__body" },
                e(
                  "input",
                  {
                    className: "todo-card__text",
                    value: todo.text,
                    onChange: (event) => renameTodo(todo.id, event.target.value),
                  }
                )
              ),
              e(
                "button",
                {
                  type: "button",
                  className: "todo-card__delete",
                  onClick: () => removeTodo(todo.id),
                  "aria-label": "Delete todo",
                },
                "✕"
              )
            )
          )
    ),
    e(
      "footer",
      { className: "app__footer" },
      e(
        "div",
        { className: "todo-count" },
        `${activeCount} item${activeCount === 1 ? "" : "s"} left`
      ),
      e(
        "div",
        { className: "filters" },
        Object.keys(FILTERS).map((key) =>
          e(
            "button",
            {
              key,
              type: "button",
              className: `filters__button${filter === key ? " filters__button--active" : ""}`,
              onClick: () => setFilter(key),
            },
            FILTER_LABELS[key]
          )
        )
      ),
      e(
        "div",
        { className: "actions" },
        e(
          "button",
          {
            type: "button",
            className: "actions__clear",
            disabled: completedCount === 0,
            onClick: clearCompleted,
          },
          "Clear completed"
        )
      )
    )
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(React.createElement(App));
