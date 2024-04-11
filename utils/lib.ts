import fs from "fs/promises";
import path from "path";

export async function listFolders(
  folder: string[]
): Promise<string[] | undefined> {
  if (!folder) {
    console.log("you need to provide a folder to compress as first argument");
    return;
  }
  let directories = (await getSubdirectories(
    path.resolve(folder[0])
  )) as string[];
  if (directories.length === 0) {
    return [...folder];
  }

  const nextDirectory = await listFolders(directories);
  if (nextDirectory) return [...nextDirectory, ...folder];
}

export async function getSubdirectories(dir: string) {
  // console.log("getting getSubdirectories for : ", dir);
  const dirNames = await fs.readdir(dir);
  const result = dirNames.map(async (dirName) => {
    if ((await fs.stat(path.resolve(dir, dirName))).isDirectory())
      return path.join(dir, dirName);
  });
  return Promise.all(result).then(function (result) {
    return result.filter((directory: string | undefined) =>
      typeof directory === "string" ? directory : false
    );
  });
}
