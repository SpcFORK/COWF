# COWF Parser and CLI Tool

This project implements a TypeScript-based parser and CLI tool for the COWF (Custom Optimized Web Format) file/codec system. It supports parsing of Ctxt, Cjml, Artf, Htmf, Rout, and YAML formats.

## Features

- Basic COWF file structure and parsing
- Support for Ctxt, Cjml, Artf, Htmf, Rout, and YAML formats
- TypeScript-based parser for COWF files
- Dynamic code execution support for JavaScript, Python, Ruby, Lua, Perl, and PHP within Artf format
- Improved error handling and reporting
- Unit testing with Jest
- TSDoc documentation

## Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`

## Usage

To use the CLI tool, run:

```
npm start <file_path> [options]
```

Options:
- `-v, --verbose`: Enable verbose logging
- `-r, --results`: Log parsed results
- `-l, --log`: Log each parsed section
- `--lang=<language>`: Specify the language for ARTF parsing (javascript, python, ruby, lua, perl, or php)

Example:
```
npm start sample.cowf --verbose --lang=javascript
```

## Development

- Run tests: `npm test`
- Generate documentation: `npm run docs`
- Run performance tests: `npm run test:performance`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
