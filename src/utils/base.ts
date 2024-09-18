type ResultBase<T = any> = { format: string; content: T };

export function createResultBase<T>({
  format,
  content,
}: Partial<ResultBase<T>>): ResultBase<T>;

export function createResultBase<T extends any[]>(
  ...contents: T
): ResultBase<T>;

export function createResultBase({
  format = "none",
  content = Array.from(arguments),
}) {
  return { format, content };
}

export function createResult<T>(format: string, content: T) {
  return createResultBase<T>({ format, content });
}
