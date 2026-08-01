import catalog from '../data/curriculum.json'
import { PUBLIC_SETTINGS } from '../data/settings'

export interface CourseSummary {
  id: string
  slug: string
  title: string
  description: string
  priceInr: number
  durationMonths: number
  orderIndex: number
  prerequisiteCourseId: string | null
  prerequisiteCourseTitle: string | null
  totalClasses: number
}

export interface ClassItem {
  id: string
  globalClassNumber: number
  title: string
  day: string
  orderIndex: number
}

export interface WeekItem {
  id: string
  weekNumber: number
  title: string
  classes: ClassItem[]
}

export interface MonthItem {
  id: string
  monthNumber: number
  title: string
  weeks: WeekItem[]
}

export interface Curriculum {
  courseId: string
  slug: string
  title: string
  months: MonthItem[]
}

export interface EnrollmentRequest {
  name: string
  email: string
  phone: string
  courseId: string
  upiReference: string
  paymentScreenshot?: File
}

const courses = catalog.courses as CourseSummary[]
const curriculumBySlug = catalog.curriculumBySlug as Record<string, Curriculum>

export function getCourses(): Promise<CourseSummary[]> {
  return Promise.resolve([...courses].sort((a, b) => a.orderIndex - b.orderIndex))
}

export function getCourse(slug: string): Promise<CourseSummary> {
  const course = courses.find((c) => c.slug === slug)
  if (!course) return Promise.reject(new Error('Course not found'))
  return Promise.resolve(course)
}

export function getCurriculum(slug: string): Promise<Curriculum> {
  const curriculum = curriculumBySlug[slug]
  if (!curriculum) return Promise.reject(new Error('Curriculum not found'))
  return Promise.resolve(curriculum)
}

export function getUpiId(): Promise<string> {
  return Promise.resolve(PUBLIC_SETTINGS.upiId)
}

export async function submitEnrollment(data: EnrollmentRequest): Promise<{ id: string; status: string }> {
  const course = courses.find((c) => c.id === data.courseId)
  const formspreeId = import.meta.env.VITE_FORMSPREE_ENROLL_ID

  if (formspreeId) {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('phone', data.phone)
    formData.append('course', course?.title ?? data.courseId)
    formData.append('courseId', data.courseId)
    formData.append('upiReference', data.upiReference)
    if (data.paymentScreenshot) {
      formData.append('paymentScreenshot', data.paymentScreenshot)
    }

    const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error('Failed to submit enrollment request')
    return { id: 'formspree', status: 'submitted' }
  }

  const message = [
    'New enrollment request',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Course: ${course?.title ?? data.courseId}`,
    `UTR: ${data.upiReference}`,
  ].join('\n')

  window.open(
    `https://wa.me/${PUBLIC_SETTINGS.whatsappNumber}?text=${encodeURIComponent(message)}`,
    '_blank',
    'noopener,noreferrer',
  )

  return { id: crypto.randomUUID(), status: 'submitted' }
}
