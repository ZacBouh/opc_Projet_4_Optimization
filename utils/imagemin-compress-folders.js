import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import * as path from "path";
import { listFolders } from "./lib.js";
let folderToCompress = process.argv[2];
let outputDir = process.argv[3] ?? "";
console.log("OUTPUTDIR ", outputDir);
console.log("parent name : ", path.resolve(folderToCompress, ".."));
async function compressFolder(folderPath, outdir) {
    const inputDirName = path.basename(folderPath);
    const inputPath = path.resolve(folderPath);
    const outputDir = path.join(folderPath + "_webp");
    console.log("input: ", inputPath, " outputDir: ", outputDir);
    const result = await imagemin([`${inputPath}\\*.{jpg,png}`], {
        destination: outdir,
        plugins: [imageminWebp({ quality: 85 })],
    });
    return result.map((result) => {
        console.log("optimized : ", path.basename(result.sourcePath));
        return result.destinationPath;
    });
}
const listOfFolders = await listFolders([folderToCompress]);
listOfFolders
    ?.map((folder) => compressFolder(folder, outputDir + folder))
    .map(async (imagePath) => console.log("picked up : ", await imagePath));
