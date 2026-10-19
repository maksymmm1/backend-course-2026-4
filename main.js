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

console.log(options);