import { createFileRoute } from "@tanstack/react-router";
import { CoursesPage } from "@/pages/courses-page";

type CourseSearch = { course?: string };

export const Route = createFileRoute("/_app/courses")({
  validateSearch: (search: Record<string, unknown>): CourseSearch => ({
    course: typeof search.course === "string" ? search.course : undefined,
  }),
  head: () => ({ meta: [{ title: "Courses · UniConnect" }] }),
  component: CoursesRoute,
});

function CoursesRoute() {
  const { course } = Route.useSearch();
  return <CoursesPage initialCourseId={course} />;
}
