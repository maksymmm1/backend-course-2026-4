const http = require("http");
const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const { XMLBuilder } = require("fast-xml-parser");

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
const outputPath = path.join(__dirname, "output.xml");

const builder = new XMLBuilder({
  format: true,
  indentBy: "  ",
  suppressEmptyNode: false,
});

function isTrue(value) {
  return String(value).toLowerCase() === "true";
}

function toRecords(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") {
    const nested = Object.values(parsed).find((value) => Array.isArray(value));
    if (nested) return nested;
  }
  return [];
}

function toXmlObject(records, query) {
  let rows = records;

  // ?survived=true — лише ті, хто вижив (Survived === 1)
  if (isTrue(query.survived)) {
    rows = rows.filter((row) => Number(row.Survived) === 1);
  }

  const showAge = isTrue(query.age);
  const passenger = rows.map((row) => {
    const item = {
      name: row.Name ?? "",
    };

    // ?age=true — додати вік
    if (showAge) {
      item.age = row.Age === null || row.Age === undefined ? "" : row.Age;
    }

    item.ticket = row.Ticket ?? "";
    return item;
  });

  return { passengers: { passenger } };
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${options.host}:${options.port}`);
  const query = Object.fromEntries(requestUrl.searchParams.entries());

  // На КОЖЕН запит читаємо файл заново
  fs.readFile(inputPath, "utf8", (readError, raw) => {
    if (readError) {
      console.error("Cannot find input file");
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Cannot find input file");
      return;
    }

    let records;
    try {
      records = toRecords(JSON.parse(raw));
    } catch {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Invalid JSON");
      return;
    }

    const xml = builder.build(toXmlObject(records, query));

    // writeFile — вимога методички (асинхронний запис)
    fs.writeFile(outputPath, xml, "utf8", (writeError) => {
      if (writeError) {
        console.error(writeError.message);
      }

      res.writeHead(200, {
        "Content-Type": "application/xml; charset=utf-8",
      });
      res.end(xml);
    });
  });
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