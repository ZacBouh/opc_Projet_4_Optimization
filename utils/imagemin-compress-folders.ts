import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import * as path from "path";
import * as fs from "fs/promises";
import { fileURLToPath } from "url";

let folderToCompress = process.argv[2];
let outputDir = process.argv[3] ?? "";
console.log("OUTPUTDIR ", outputDir);
console.log("parent name : ", path.resolve(folderToCompress, ".."));

async function compressFolder(folderPath: string, outdir: string) {
  const inputDirName = path.basename(folderPath);
  const inputPath = path.resolve(folderPath);
  const outputDir = path.join(folderPath + "_webp");
  console.log("input: ", inputPath, " outputDir: ", outputDir);

  const result = await imagemin([`${inputPath}\\*.{jpg,png}`], {
    destination: outdir,
    plugins: [imageminWebp({ quality: 85 })],
  });
  console.log("Images optimized in folder : ", path.resolve(outputDir));
}

async function listFolders(folder: string[]): Promise<string[] | undefined> {
  if (!folder) {
    console.log("you need to provide a folder to compress as first argument");
    return;
  }
  let directories = (await getSubdirectories(folder[0] + "\\")) as string[];
  if (directories.length === 0) {
    return [...folder];
  }

  const nextDirectory = await listFolders(directories);
  if (nextDirectory) return [...nextDirectory, ...folder];
}

async function getSubdirectories(dir: string) {
  //   console.log("getting getSubdirectories for : ", dir);
  const dirNames = await fs.readdir(dir);
  const result = dirNames.map(async (dirName) => {
    if ((await fs.stat(dir + dirName)).isDirectory()) return dir + dirName;
  });
  return Promise.all(result).then(function (result) {
    return result.filter((directory: string | undefined) =>
      typeof directory === "string" ? directory : false
    );
  });
}

const listOfFolders = await listFolders([folderToCompress]);
listOfFolders?.map((folder) => compressFolder(folder, outputDir + folder));
