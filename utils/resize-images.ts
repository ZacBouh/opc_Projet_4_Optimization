import path from "path";
import sharp from "sharp";
import fs from "fs/promises";

type ImagesList = {
  imagesList: { path: string; srcset: string }[];
};

type Srcset = {
  width: number;
  height: number;
};

const PROJECT_PATH =
  "F:\\Formation Openclassrooms\\Projet_4_Optimisation\\nina-carducci.github.io\\";
const entryPath = path.resolve(process.argv[2]);

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
  console.log(imagePath);
  console.log(dimensionsList);
  return { path: imagePath, srcset: dimensionsList };
});

function resizeImage(path: string, srcset: Srcset, outpath: string) {
  sharp(path)
    .resize(srcset.width, srcset.height, { fit: "outside" })
    .toFile(outpath);
}

imagesWithSrcset.map(async (imageObject) => {
  const image = await imageObject;
  const isDirectory = (await fs.stat(image.path)).isDirectory();
  if (!isDirectory) {
    image.srcset.map((srcset) => {
      console.log(
        `compressing ${path.basename(image.path)} to ${srcset.width}x${
          srcset.height
        }`
      );
      resizeImage(
        image.path,
        srcset,
        path.join(
          path.dirname(image.path),
          path.basename(image.path),
          `${srcset.width}x${srcset.height}`,
          path.extname(image.path)
        )
      );
    });
    return;
  }
});
