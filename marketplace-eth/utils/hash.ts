import { ethers } from "ethers";
import { formatBytesString } from "./formatBytes16String";


export const createCourseHash = (courseId:string, account:string) => {
  const hexCourseIdBytes16 = formatBytesString(courseId, 16);
  const courseHash = ethers.utils.solidityKeccak256(
    ["bytes16", "address"],
    [hexCourseIdBytes16, account]
  );

  return courseHash
}