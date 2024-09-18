export function handleError(error: Error): void {
  console.error('An error occurred:');
  console.error(error.message);
  process.exit(1);
}
