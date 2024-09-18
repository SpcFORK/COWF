export function handleError(error) {
    console.error('An error occurred:');
    console.error(error.message);
    process.exit(1);
}
