import { useState } from 'react';
import { ethers } from 'ethers';
import { formatBytesString } from '@utils/formatBytes16String';
import { useWeb3 } from '@components/provider';
import { useAccount2 } from '@components/hooks/web3/useAccount';
import { getAllCourses, ICourse } from './../../../content/fetcher';
import useSWR from 'swr';
import { createCourseHash } from '@utils/hash';

export interface IOwnedCourseAndICourse extends ICourse {
    ownedCourseId: number
    price: string | number;
    proof: string;
    owner: string;
    state: string;
}

export const COURSE_STATES: {[key:number]: string} = {
  0: "purchased",
  1: "activated",
  2: "deactivated",
}

export function useOwnedCourses() {
  const {data: courses} = getAllCourses()
  const account = useAccount2()
  const { provider, contract } = useWeb3()
  const key = (provider && account.data && contract) ? ["web3/ownedCourses", account.data]:null

  const {data, error} = useSWR(key, async () => {
    
    const coursePromise = courses.map(async(course, i) => {
      if (!course.id) return null
      const courseHash = createCourseHash(course.id, account.data!)
      const ownedCourse = await contract!.getCourseByHash(courseHash)
      if (ownedCourse.owner == ethers.constants.AddressZero) {
       return null
      }
      const newOwnedCourse: IOwnedCourseAndICourse = {
        ownedCourseId: ownedCourse.id.toNumber(),
        price: ethers.utils.formatEther(ownedCourse.price.toString()),
        proof: ownedCourse.proof,
        owner: ownedCourse.owner,
        state: COURSE_STATES[ownedCourse.state],
        ...course
      }
      return newOwnedCourse
    })
    const all = await Promise.all(coursePromise)
    const ownCourses: IOwnedCourseAndICourse[] = all.filter( (a): a is IOwnedCourseAndICourse => !!a)
    console.table(ownCourses)
    return ownCourses
  })

  return {
    data,
    hasInitialResponse: !!(data || error),
    isEmpty: !!((data && data.length === 0) || error),
    lookup: data ? data.reduce((a, c) => {
      a[c.id] = c
      return a
    }, {} as {[key:string]: IOwnedCourseAndICourse}) : {}
  }
}