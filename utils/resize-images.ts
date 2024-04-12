import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import { Dirent } from "fs";
import { getSubdirectories, listFolders } from "./lib.js";

type ImagesList = {
  imagesList: { path: string; srcset: string }[];
};

type Srcset = {
  width: number;
  height: number;
};

const PROJECT_PATH =
  "F:\\Formation Openclassrooms\\Projet_4_Optimisation\\nina-carducci.github.io";

const inputPath = path.resolve(process.argv[2]);
const outputPath = path.resolve(process.argv[3]);

const listOfImages: ImagesList["imagesList"] = JSON.parse(
  await fs.readFile("imagesAndSrcsets.json", {
    encoding: "utf-8",
  })
)["imagesList"];

const imagesWithSrcset = listOfImages.map(async (imageObject) => {
  const imagePath = path.resolve(PROJECT_PATH, imageObject.path);
  let dimensionsList = imageObject.srcset.split(", ").map((dimension) => {
    const xY = dimension.split("x");
    return { width: Number(xY[0]), height: Number(xY[1]) };
  });
  //   console.log(imagePath);
  //   console.log(dimensionsList);
  return { path: imagePath, srcset: dimensionsList };
});

async function resizeImage(imagePath: string, srcset: Srcset, outpath: string) {
  try {
    await fs.mkdir(path.dirname(outpath), { recursive: true });
    sharp(imagePath)
      .resize(srcset.width, srcset.height, { fit: "outside" })
      .toFile(
        outpath.replace(path.extname(outpath), "") +
          `${srcset.width}x${srcset.height}` +
          path.extname(outpath)
      )
      .then(() => {
        const basePath =
          path.dirname(outpath).split("\\").slice(-3).join("\\") + "\\";
        console.log("resized image : ", basePath + path.basename(imagePath));
      });
  } catch (error) {
    console.log(`[ERROR] could not resize file ${imagePath}`);
    console.log(error);
  }
}

async function getImagesInFolder(
  folderPath: string,
  extension: "jpg" | "png" | "webp"
) {
  let folderContent: string[];
  try {
    folderContent = await fs.readdir(folderPath);
    const images = folderContent.filter(
      (itemPath) => path.extname(itemPath) === "." + extension
    );
    const imagesPaths = images.map((imageBasename) =>
      path.join(folderPath, imageBasename)
    );
    return imagesPaths;
  } catch (error) {
    console.log("could not get images in folder ", folderPath);
    console.log(error);
  }
}

async function getImageSrcSet(imagePath: string) {
  const imageName = path
    .basename(imagePath)
    .replace(path.extname(imagePath), "");
  const imageSpecs = await Promise.all(imagesWithSrcset);
  const fileSpecified = imageSpecs.filter((imageSpec) => {
    const imageSpecName = path
      .basename(imageSpec.path)
      .replace(path.extname(imageSpec.path), "");
    return imageSpecName === imageName;
  });
  if (fileSpecified.length > 0) {
    console.log("image ", imageName, " specified as : ");
    return fileSpecified[0].srcset;
  }
  const folderSpecified = imageSpecs.filter((imageSpec) => {
    // console.log('imageSpecDir ', imagePath, ' includes ', (imagePath))
    return path.dirname(imagePath).includes(imageSpec.path);
  });
  if (folderSpecified.length > 0) return folderSpecified[0].srcset;
  return undefined;
}

function getOutputPath(outputPath: string, inputPath: string) {
  const outpath = [
    outputPath,
    path.basename(path.dirname(inputPath)),
    path.basename(inputPath),
  ].join(path.sep);
  return outpath;
}

// console.log("got this output path ", getOutputPath(outputPath, inputPath));

const folders = await listFolders([inputPath]);
let imagesPathPerFolder = folders?.map(
  async (folderPath) => await getImagesInFolder(folderPath, "webp")
);

if (imagesPathPerFolder) {
  const imagesPaths = (await Promise.all(imagesPathPerFolder)).reduce(
    (previous, current) => previous && current && [...previous, ...current]
  );
  imagesPaths?.map(async (imagePath) => {
    // console.log(getOutputPath(outputPath, imagePath));
    (await getImageSrcSet(imagePath))?.map((srcset) => {
      resizeImage(imagePath, srcset, getOutputPath(outputPath, imagePath));
    });
  });
}

// getImagesInFolder(process.argv[2], "webp");

// console.log(imagesWithSrcset);
// resizeImagesFolder(outpath);
