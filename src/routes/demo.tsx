import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { TodoStatus } from "@/server/db/generated/enums";
import { useTRPC } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/shared";

export const Route = createFileRoute("/demo")({
  component: DemoPage,
});

const STATUS_LABELS: Record<TodoStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const STATUS_VARIANTS: Record<
  TodoStatus,
  "default" | "secondary" | "outline" | "destructive" | "ghost" | "link"
> = {
  PENDING: "outline",
  IN_PROGRESS: "secondary",
  DONE: "default",
};

const NEXT_STATUS: Record<TodoStatus, TodoStatus> = {
  PENDING: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "PENDING",
};

function DemoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold">tRPC Demo</h1>
        <p className="text-sm text-muted-foreground">
          query + mutations via{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            @trpc/tanstack-react-query
          </code>
        </p>
      </div>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-semibold">Todos</h2>
        <Suspense fallback={<TodoListSkeleton />}>
          <TodoList />
        </Suspense>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-semibold">Create Todo</h2>
        <CreateTodoForm />
      </section>
    </div>
  );
}

type Todo = RouterOutputs["todo"]["getAll"][number];

function TodoList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const todosQuery = useQuery(trpc.todo.getAll.queryOptions());

  const deleteMutation = useMutation(
    trpc.todo.delete.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries(trpc.todo.getAll.pathFilter()),
    }),
  );

  const setStatusMutation = useMutation(
    trpc.todo.setStatus.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries(trpc.todo.getAll.pathFilter()),
    }),
  );

  if (todosQuery.isPending) {
    return <TodoListSkeleton />;
  }

  if (todosQuery.error) {
    return <p className="text-sm text-muted-foreground">Error: {todosQuery.error.message}</p>;
  }

  if (todosQuery.data.length === 0) {
    return <p className="text-sm text-muted-foreground">No todos yet. Create one below.</p>;
  }

  return (
    <ul className="space-y-3">
      {todosQuery.data.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onAdvanceStatus={() =>
            setStatusMutation.mutate({ id: todo.id, status: NEXT_STATUS[todo.status] })
          }
          onDelete={() => deleteMutation.mutate({ id: todo.id })}
          isPending={
            (setStatusMutation.isPending && setStatusMutation.variables?.id === todo.id) ||
            (deleteMutation.isPending && deleteMutation.variables?.id === todo.id)
          }
        />
      ))}
    </ul>
  );
}

function TodoCard({
  todo,
  onAdvanceStatus,
  onDelete,
  isPending,
}: {
  todo: Todo;
  onAdvanceStatus: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  return (
    <li>
      <Card className="opacity-100 transition-opacity" data-pending={isPending || undefined}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{todo.title}</CardTitle>
            <Badge variant={STATUS_VARIANTS[todo.status]}>{STATUS_LABELS[todo.status]}</Badge>
          </div>
        </CardHeader>

        {todo.description && (
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">{todo.description}</p>
          </CardContent>
        )}

        <CardFooter className="gap-2">
          <Button size="sm" variant="outline" onClick={onAdvanceStatus} disabled={isPending}>
            Advance → {STATUS_LABELS[NEXT_STATUS[todo.status]]}
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete} disabled={isPending}>
            Delete
          </Button>
        </CardFooter>
      </Card>
    </li>
  );
}

function TodoListSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-64" />
            </CardContent>
            <CardFooter className="gap-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-16" />
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function CreateTodoForm() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TodoStatus>("PENDING");

  const createMutation = useMutation(
    trpc.todo.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.todo.getAll.pathFilter());
        setTitle("");
        setDescription("");
        setStatus("PENDING");
      },
    }),
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({ title: title.trim(), description: description.trim(), status });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Buy groceries"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details…"
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Initial status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as TodoStatus)}>
          <SelectTrigger id="status" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(TodoStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={createMutation.isPending || !title.trim()}>
        {createMutation.isPending ? "Creating…" : "Create todo"}
      </Button>

      {createMutation.isError && (
        <p className="text-sm text-destructive">{createMutation.error.message}</p>
      )}
    </form>
  );
}
