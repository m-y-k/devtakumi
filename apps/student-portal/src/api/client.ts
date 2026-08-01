import { authFetch } from './auth'

export interface CourseTreeItem {
  id: string
  slug: string
  title: string
  months: MonthTreeItem[]
}

export interface MonthTreeItem {
  id: string
  monthNumber: number
  title: string
  weeks: WeekTreeItem[]
}

export interface WeekTreeItem {
  id: string
  weekNumber: number
  title: string
  classes: ClassTreeItem[]
}

export interface ClassTreeItem {
  id: string
  globalClassNumber: number
  title: string
  day: string
  orderIndex: number
}

export interface ClassDetail {
  id: string
  globalClassNumber: number
  title: string
  day: string
  scheduledStart: string | null
  scheduledEnd: string | null
  notesMarkdown: string | null
  liveMeetingUrl: string | null
  isLive: boolean
  hasRecording: boolean
  courseId: string
}

export interface QuestionSummary {
  id: string
  title: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  orderIndex: number
  solved: boolean
}

export interface QuestionDetail {
  id: string
  title: string
  difficulty: string
  statementMarkdown: string
  constraints: string[] | null
  examples: { input: string; output: string; explanation: string }[]
  starterCodeJava: string | null
  tags: string[] | null
  orderIndex: number
}

export interface Submission {
  id: string
  verdict: string
  score: number | null
  submittedAt: string
  code: string
}

export interface Assessment {
  id: string
  title: string
  type: 'CODE' | 'PROJECT_SUBMISSION'
  opensAt: string
  closesAt: string
  durationMinutes: number | null
  questions: AssessmentQuestion[]
}

export interface AssessmentQuestion {
  id: string
  questionId: string
  points: number
  orderIndex: number
  title: string | null
  solved: boolean
}

export interface EnrollmentSummary {
  id: string
  courseId: string
  status: string
  enrolledAt: string
  completedAt: string | null
}

export interface Announcement {
  id: string
  courseId: string | null
  title: string
  body: string
  createdAt: string
}

export async function getCourseTree(courseId: string): Promise<CourseTreeItem> {
  const res = await authFetch(`/api/courses/${courseId}/tree`)
  if (!res.ok) throw new Error('Failed to fetch course tree')
  return res.json()
}

export async function getClass(classId: string): Promise<ClassDetail> {
  const res = await authFetch(`/api/classes/${classId}`)
  if (!res.ok) throw new Error('Class not found')
  return res.json()
}

export async function getClassQuestions(classId: string): Promise<QuestionSummary[]> {
  const res = await authFetch(`/api/classes/${classId}/questions`)
  if (!res.ok) return []
  return res.json()
}

export async function getQuestion(questionId: string): Promise<QuestionDetail> {
  const res = await authFetch(`/api/questions/${questionId}`)
  if (!res.ok) throw new Error('Question not found')
  return res.json()
}

export async function getQuestionSubmissions(questionId: string): Promise<Submission[]> {
  const res = await authFetch(`/api/questions/${questionId}/submissions`)
  if (!res.ok) return []
  return res.json()
}

export async function getMe() {
  const res = await authFetch('/api/me')
  if (!res.ok) throw new Error('Not authenticated')
  return res.json()
}

export async function getMyEnrollments(): Promise<EnrollmentSummary[]> {
  const res = await authFetch('/api/me/enrollments')
  if (!res.ok) return []
  return res.json()
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await authFetch('/api/profile/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  if (!res.ok) throw new Error('Failed to change password')
}

export async function getWeekAssessment(weekId: string): Promise<Assessment> {
  const res = await authFetch(`/api/weeks/${weekId}/assessment`)
  if (!res.ok) throw new Error('Assessment not found')
  return res.json()
}

export async function submitCodeRun(questionId: string, code: string, stdin: string = '') {
  const res = await authFetch('/api/code/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, language: 'java', code, stdin }),
  })
  if (!res.ok) throw new Error('Failed to run code')
  return res.json()
}

export async function submitCode(questionId: string, code: string) {
  const res = await authFetch('/api/code/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, language: 'java', code }),
  })
  if (!res.ok) throw new Error('Failed to submit code')
  return res.json()
}

export async function submitAssessmentAnswer(assessmentId: string, questionId: string, code: string) {
  const res = await authFetch(`/api/assessments/${assessmentId}/questions/${questionId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error('Failed to submit answer')
  return res.json()
}

export async function submitProjectAssessment(assessmentId: string, repoUrl: string) {
  const formData = new FormData()
  formData.append('repoUrl', repoUrl)
  const res = await authFetch(`/api/assessments/${assessmentId}/project-submission`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Failed to submit project')
  return res.json()
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const res = await authFetch('/api/announcements')
  if (!res.ok) return []
  return res.json()
}

export async function getRecordingUrl(classId: string): Promise<string> {
  const res = await authFetch(`/api/classes/${classId}/recording-url`)
  if (!res.ok) throw new Error('Recording not available')
  const data = await res.json()
  return data.url
}

export async function getUpiId(): Promise<string> {
  const res = await authFetch('/api/settings/upi-id')
  if (!res.ok) return 'myk22.wallet@phonepe'
  const data = await res.json()
  return data.upiId
}

export async function getCoursesPublic() {
  const res = await fetch('/api/public/courses')
  return res.json()
}

export async function getAdminEnrollmentRequests(status?: string) {
  const params = status ? `?status=${status}` : ''
  const res = await authFetch(`/api/admin/enrollment-requests${params}`)
  return res.json()
}

export async function approveEnrollmentRequest(id: string) {
  return authFetch(`/api/admin/enrollment-requests/${id}/approve`, { method: 'POST' })
}

export async function rejectEnrollmentRequest(id: string, note?: string) {
  return authFetch(`/api/admin/enrollment-requests/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note }),
  })
}

export async function getAdminStudents() {
  const res = await authFetch('/api/admin/students')
  return res.json()
}

export async function markCourseComplete(studentId: string, courseId: string) {
  return authFetch(`/api/admin/students/${studentId}/enrollments/${courseId}/complete`, { method: 'POST' })
}

export async function createAdminAnnouncement(title: string, body: string, courseId?: string) {
  return authFetch('/api/admin/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, courseId }),
  })
}

export async function deleteAdminAnnouncement(id: string) {
  return authFetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
}

export async function createCourse(data: any) {
  const res = await authFetch('/api/admin/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateCourse(id: string, data: any) {
  const res = await authFetch(`/api/admin/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function createMonth(courseId: string, data: any) {
  const res = await authFetch(`/api/admin/courses/${courseId}/months`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateMonth(id: string, data: any) {
  const res = await authFetch(`/api/admin/months/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function createWeek(monthId: string, data: any) {
  const res = await authFetch(`/api/admin/months/${monthId}/weeks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateWeek(id: string, data: any) {
  const res = await authFetch(`/api/admin/weeks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function createClass(weekId: string, data: any) {
  const res = await authFetch(`/api/admin/weeks/${weekId}/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateClass(id: string, data: any) {
  const res = await authFetch(`/api/admin/classes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteClass(id: string) {
  return authFetch(`/api/admin/classes/${id}`, { method: 'DELETE' })
}

export async function createQuestion(classId: string, data: any) {
  const res = await authFetch(`/api/admin/classes/${classId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateQuestion(id: string, data: any) {
  const res = await authFetch(`/api/admin/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteQuestion(id: string) {
  return authFetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
}

export async function uploadRecording(classId: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await authFetch(`/api/admin/classes/${classId}/recording`, {
    method: 'POST',
    body: formData,
  })
  return res.json()
}

export async function createAssessment(weekId: string, data: any) {
  const res = await authFetch(`/api/admin/weeks/${weekId}/assessment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateAssessment(id: string, data: any) {
  const res = await authFetch(`/api/admin/assessments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function addAssessmentQuestion(assessmentId: string, data: any) {
  const res = await authFetch(`/api/admin/assessments/${assessmentId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function getAssessmentSubmissions(assessmentId: string) {
  const res = await authFetch(`/api/admin/assessments/${assessmentId}/submissions`)
  return res.json()
}

export async function getAssessmentProjectSubmissions(assessmentId: string) {
  const res = await authFetch(`/api/admin/assessments/${assessmentId}/project-submissions`)
  return res.json()
}

export async function gradeProjectSubmission(id: string, score: number, feedback: string) {
  const res = await authFetch(`/api/admin/project-submissions/${id}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, feedback }),
  })
  return res.json()
}
