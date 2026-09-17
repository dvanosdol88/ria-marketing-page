import { FlexibleSchedule } from "@/components/FlexibleSchedule";

export default function CalendarPreviewPage() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-800">
            Flexible Schedule
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Component preview — rotating extended hours calendar
          </p>
        </div>
        <FlexibleSchedule />
      </div>
    </div>
  );
}
