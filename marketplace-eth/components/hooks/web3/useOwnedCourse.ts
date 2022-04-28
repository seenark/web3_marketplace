import { useWeb3 } from "@components/provider";
import { getAllCourses, ICourse } from "@content/fetcher";
import { formatBytesString } from "@utils/formatBytes16String";
import { createCourseHash } from "@utils/hash";
import { ethers } from "ethers";
import useSWR from "swr";
import { useAccount2 } from "./useAccount";
import { IOwnedCourseAndICourse, COURSE_STATES } from "./useOwnedCourses";

export function useOwnedCourse(course: ICourse | undefined) {
  const account = useAccount2();
  const { provider, contract } = useWeb3();
  const key =
    provider && account.data && contract && course
      ? ["web3/ownedCourses", account.data]
      : null;

  const { data } = useSWR(key, async () => {
    if (!course || !course.id) return undefined;
      const courseHash = createCourseHash(course.id, account.data!)
      const ownedCourse = await contract!.getCourseByHash(courseHash);
      if (ownedCourse.owner == ethers.constants.AddressZero) {
        return undefined;
      }
      const newOwnedCourse: IOwnedCourseAndICourse = {
        ownedCourseId: ownedCourse.id.toNumber(),
        price: ethers.utils.formatEther(ownedCourse.price.toString()),
        proof: ownedCourse.proof,
        owner: ownedCourse.owner,
        state: COURSE_STATES[ownedCourse.state],
        ...course,
      };
      return newOwnedCourse;
  });

  return {
    data,
  };
}
