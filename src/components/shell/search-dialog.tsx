import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import { courses, events, notices } from "@/data/demo";
import { Modal } from "@/components/ui/modal";
import { NAV } from "@/components/shell/nav";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  const searchablePages = NAV.filter(
    (item) => (item.to as string) !== "/complaints" && (item.to as string) !== "/campus",
  );

  function closeAnd(run: () => void) {
    onOpenChange(false);
    run();
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Pages, courses, notices, and events in this demonstration."
    >
      <Command label="Search UniConnect" className="flex flex-col">
        <Command.Input
          autoFocus
          placeholder="Search the sample workspace"
          className="w-full border border-line bg-surface px-3 py-3 type-sm r-md outline-none placeholder:text-faint"
        />
        <Command.List className="mt-3 max-h-80 overflow-y-auto">
          <Command.Empty className="px-2 py-6 type-sm text-muted">
            Nothing in the sample set matches.
          </Command.Empty>
          <Command.Group heading="Pages" className="type-label px-2 py-2">
            {searchablePages.map((item) => (
              <Command.Item
                key={item.to}
                value={item.label}
                onSelect={() => closeAnd(() => void navigate({ to: item.to }))}
                className="flex min-h-11 cursor-pointer items-center px-2 type-sm text-fg r-sm data-[selected=true]:bg-sunken"
              >
                {item.label}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Courses" className="type-label px-2 py-2">
            {courses.map((course) => (
              <Command.Item
                key={course.id}
                value={`${course.code} ${course.title} ${course.instructor}`}
                onSelect={() =>
                  closeAnd(() => void navigate({ to: "/courses", search: { course: course.id } }))
                }
                className="flex min-h-11 cursor-pointer flex-col items-start justify-center px-2 type-sm text-fg r-sm data-[selected=true]:bg-sunken"
              >
                <span>{course.title}</span>
                <span className="type-xs text-muted">{course.code}</span>
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Notices" className="type-label px-2 py-2">
            {notices.map((notice) => (
              <Command.Item
                key={notice.id}
                value={`${notice.title} ${notice.body}`}
                onSelect={() =>
                  closeAnd(() => void navigate({ to: "/notices", search: { notice: notice.id } }))
                }
                className="flex min-h-11 cursor-pointer items-center px-2 type-sm text-fg r-sm data-[selected=true]:bg-sunken"
              >
                {notice.title}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Events" className="type-label px-2 py-2">
            {events.map((event) => (
              <Command.Item
                key={event.id}
                value={`${event.title} ${event.summary}`}
                onSelect={() =>
                  closeAnd(() => void navigate({ to: "/events", search: { event: event.id } }))
                }
                className="flex min-h-11 cursor-pointer items-center px-2 type-sm text-fg r-sm data-[selected=true]:bg-sunken"
              >
                {event.title}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </Modal>
  );
}