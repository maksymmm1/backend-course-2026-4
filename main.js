const http = require("http");
const fs = require("fs");
const path = require("path");
const { Command } = require("commander");

const program = new Command();

program
  .name("main")
  .description("HTTP-сервер лабораторної роботи №4, варіант 6")
  .helpOption("--help", "показати довідку")
  .requiredOption("-i, --input <path>", "шлях до JSON-файлу")
  .requiredOption("-h, --host <address>", "адреса сервера")
  .requiredOption("-p, --port <number>", "порт сервера");

program.parse(process.argv);

const options = program.opts();

if (!options.input || !options.host || !options.port) {
  console.error("Error: required parameter is not specified");
  process.exit(1);
}

const inputPath = path.resolve(options.input);

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("OK");
});

fs.access(inputPath, fs.constants.F_OK, (err) => {
  if (err) {
    console.error("Cannot find input file");
    process.exit(1);
  }

  server.listen(options.port, options.host, () => {
    console.log(`Server is listening on http://${options.host}:${options.port}`);
  });
});