import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sqlPath = path.resolve(__dirname, '../../../backend/src/main/resources/db/migration/V2__seed_curriculum.sql')
const outPath = path.resolve(__dirname, '../src/data/curriculum.json')

const sql = fs.readFileSync(sqlPath, 'utf8')

const courses = []
const courseById = new Map()
const monthsByCourse = new Map()
const monthById = new Map()
const weeksByMonth = new Map()
const weekById = new Map()
const classesByWeek = new Map()

for (const line of sql.split('\n')) {
  const courseMatch = line.match(
    /INSERT INTO courses \(id, slug, title, description, price_inr, duration_months, order_index, prerequisite_course_id\) VALUES \('([^']+)', '([^']+)', '([^']+)', '([^']+)', (\d+), (\d+), (\d+), (NULL|'[^']+')\)/,
  )
  if (courseMatch) {
    const [, id, slug, title, description, priceInr, durationMonths, orderIndex, prereqRaw] = courseMatch
    const prerequisiteCourseId = prereqRaw === 'NULL' ? null : prereqRaw.replace(/'/g, '')
    const course = {
      id,
      slug,
      title,
      description,
      priceInr: Number(priceInr),
      durationMonths: Number(durationMonths),
      orderIndex: Number(orderIndex),
      prerequisiteCourseId,
      prerequisiteCourseTitle: null,
      totalClasses: 0,
    }
    courses.push(course)
    courseById.set(id, course)
    monthsByCourse.set(id, [])
    continue
  }

  const monthMatch = line.match(
    /INSERT INTO months \(id, course_id, month_number, title\) VALUES \('([^']+)', '([^']+)', (\d+), '([^']+)'\)/,
  )
  if (monthMatch) {
    const [, id, courseId, monthNumber, title] = monthMatch
    const month = { id, monthNumber: Number(monthNumber), title, weeks: [] }
    monthById.set(id, month)
    monthsByCourse.get(courseId)?.push(month)
    weeksByMonth.set(id, [])
    continue
  }

  const weekMatch = line.match(
    /INSERT INTO weeks \(id, month_id, week_number, title\) VALUES \('([^']+)', '([^']+)', (\d+), '([^']+)'\)/,
  )
  if (weekMatch) {
    const [, id, monthId, weekNumber, title] = weekMatch
    const week = { id, weekNumber: Number(weekNumber), title, classes: [] }
    weekById.set(id, week)
    weeksByMonth.get(monthId)?.push(week)
    classesByWeek.set(id, [])
    continue
  }

  const classMatch = line.match(
    /INSERT INTO class_sessions \(id, week_id, global_class_number, title, day, order_index\) VALUES \('([^']+)', '([^']+)', (\d+), '(.+)', '([A-Z]+)', (\d+)\)/,
  )
  if (classMatch) {
    const [, id, weekId, globalClassNumber, title, day, orderIndex] = classMatch
    classesByWeek.get(weekId)?.push({
      id,
      globalClassNumber: Number(globalClassNumber),
      title,
      day,
      orderIndex: Number(orderIndex),
    })
  }
}

for (const course of courses) {
  if (course.prerequisiteCourseId) {
    course.prerequisiteCourseTitle = courseById.get(course.prerequisiteCourseId)?.title ?? null
  }
}

for (const [, months] of monthsByCourse) {
  for (const month of months) {
    month.weeks = weeksByMonth.get(month.id) ?? []
    for (const week of month.weeks) {
      week.classes = (classesByWeek.get(week.id) ?? []).sort((a, b) => a.orderIndex - b.orderIndex)
    }
  }
}

const curriculumBySlug = {}
for (const course of courses) {
  const months = monthsByCourse.get(course.id) ?? []
  const totalClasses = months.reduce(
    (sum, m) => sum + m.weeks.reduce((ws, w) => ws + w.classes.length, 0),
    0,
  )
  course.totalClasses = totalClasses
  curriculumBySlug[course.slug] = {
    courseId: course.id,
    slug: course.slug,
    title: course.title,
    months,
  }
}

// Align public-site pricing with marketing pages
const publicPrices = {
  'dsa-foundations': 999,
  'backend-engineering': 1499,
  'full-stack-development': 1999,
}
for (const course of courses) {
  if (publicPrices[course.slug]) {
    course.priceInr = publicPrices[course.slug]
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(
  outPath,
  JSON.stringify({ courses, curriculumBySlug }, null, 2),
  'utf8',
)

console.log(`Wrote ${courses.length} courses to ${outPath}`)
