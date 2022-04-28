import courses from "./index.json"

export interface ICourse {
  id: string;
  type: string;
  title: string;
  description: string;
  coverImage: string;
  author: string;
  link: string;
  slug: string;
  wsl: string[];
  createdAt: string;
  index?: number
}

export interface ICourseMap {
  [key:string]: ICourse
}

export const getAllCourses = () => {
  return {
    data: courses,
    courseMap: courses.reduce((a, c, i) => {
      a[c.id] = c
      a[c.id].index = i
      return a
    }, {} as ICourseMap)
  }
}