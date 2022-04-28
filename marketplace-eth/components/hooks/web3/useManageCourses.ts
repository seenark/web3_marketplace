import { useAccount2 } from "@components/hooks/web3/useAccount";
import { useWeb3 } from "@components/provider";
import useSWR from "swr";
import { COURSE_STATES } from "./useOwnedCourses";

export interface IOwnedCourse {
    ownedCourseId: number;
    price: number | string;
    proof: string;
    owner: string;
    state: string;
    hash:string
}

export function useManageCourses() {
  const { provider, contract } = useWeb3();
  const account = useAccount2();
  const swrRes = useSWR(
    () =>
      provider && contract && account.data && account.isAdmin
        ? `web3/managedCourses/${account.data}`
        : null,
    async () => {
      if (!contract) return [];
      const courses: IOwnedCourse[] = [];
      const courseCount = await contract.getCourseCount();

      for (let i = courseCount.toNumber() - 1; i >= 0; i--) {
        const courseHash = await contract.getCourseHashAtIndex(i);
        const course = await contract.getCourseByHash(courseHash);

        if (course) {
          const newCourse: IOwnedCourse = {
            ownedCourseId: course.id.toNumber(),
            price: course.price.toString(),
            proof: course.proof,
            owner: course.owner,
            state: COURSE_STATES[course.state],
            hash: courseHash
          };
          courses.push(newCourse);
        }
      }

      return courses;
    }
  );

  return swrRes;
}
