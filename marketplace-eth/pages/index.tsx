import type { GetStaticProps, NextPage } from 'next'
import Image from 'next/image'
import { Breadcrums, Hero } from '@components/ui/common'
import { CourseList, CourseCard } from '@components/ui/course'
import { BaseLayout } from '@components/ui/layout'
import { getAllCourses, ICourse } from '@content/fetcher'
import { NextPageWithLayout } from './_app'
import { ReactElement } from 'react'



interface IHomeProps {
  courses: ICourse[]
}

const Home: NextPageWithLayout<IHomeProps> = ({courses}) => {
  return (
    <>
      <Hero />
      <CourseList courses={courses}>
        {course =>
          <CourseCard
            key={course.id}
            course={course} disabled={false}          />
        }
      </CourseList>
    </>
  )
}

Home.getLayout = (page: ReactElement) => {
  return (
    <BaseLayout>
    {page}
    </BaseLayout>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const {data} = getAllCourses()

  return {
    props: {
      courses: data
    }
  }
}

export default Home
