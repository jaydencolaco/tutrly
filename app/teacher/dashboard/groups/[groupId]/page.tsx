"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ClassCard from "@/components/teacher/ClassCard";

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();

  const [group, setGroup] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    // 🔹 Get group
    const { data: groupData } = await supabase
      .from("groups")
      .select("id, name")
      .eq("id", groupId)
      .single();

    if (!groupData) return;
    setGroup(groupData);

    // 🔹 Get classes + meetings
    const { data: classData } = await supabase
      .from("classes")
      .select(
        `
        id,
        class_date,
        meetings (
          meeting_link,
          start_time
        )
      `
      )
      .eq("group_id", groupId);

    if (!classData) return;

    const now = new Date();

    const transformed = classData.map((cls: any) => {
      const meeting = cls.meetings?.[0];

      let status: "upcoming" | "completed" | "no-link";

      if (!meeting) {
        status = "no-link";
      } else {
        const classTime = new Date(meeting.start_time);
        status = classTime > now ? "upcoming" : "completed";
      }

      return {
        id: cls.id,
        date: cls.class_date,
        time: meeting?.start_time || "TBD",
        status,
        meetingLink: meeting?.meeting_link || undefined,
      };
    });

    setSessions(transformed);
  };

  // 🔥 Save meeting link
  const handleSaveLink = async (classId: string, link: string) => {
    if (!link) return;

    const cleanLink = link.trim();

    if (!cleanLink.startsWith("https://")) {
      alert("Invalid Google Meet link");
      return;
    }

    // get class date
    const { data: cls, error: classError } = await supabase
      .from("classes")
      .select("class_date")
      .eq("id", classId)
      .maybeSingle();

    if (classError || !cls) {
      console.error(classError);
      alert("Class not found");
      return;
    }

    const startTime = new Date(cls.class_date);
    startTime.setHours(18, 0, 0);

    await supabase.from("meetings").delete().eq("class_id", classId);

    const { error } = await supabase.from("meetings").insert({
      class_id: classId,
      meeting_link: cleanLink,
      start_time: startTime.toISOString(),
    });

    if (error) {
      console.error(error);
      alert("Failed to save link");
      return;
    }

    alert("Link saved 🚀");
    fetchGroup();
  };

  // 🚀 Add new class
  const handleAddClass = async () => {
    if (!newDate) {
      alert("Please select a date");
      return;
    }

    const { error } = await supabase.from("classes").insert({
      group_id: groupId,
      class_date: newDate,
    });

    if (error) {
      console.error(error);
      alert("Failed to create class");
      return;
    }

    alert("Class created ✅");
    setNewDate("");
    fetchGroup();
  };

  if (!group) return <p className="p-6">Loading...</p>;

  // ✅ IMPORTANT FIX: include no-link in upcoming
  const upcoming = sessions.filter(
    (s) => s.status === "upcoming" || s.status === "no-link"
  );

  const completed = sessions.filter((s) => s.status === "completed");

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-purple-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-purple-900">{group.name}</h1>

          <div className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span>{sessions.length} classes</span>
          </div>
        </div>
      </div>

      {/* Add Class */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">Add New Class</h2>

        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <button
          onClick={handleAddClass}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded"
        >
          <Plus className="w-4 h-4" />
          Create Class
        </button>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="font-bold text-lg">
          Upcoming Classes ({upcoming.length})
        </h2>

        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400 mt-2">No upcoming classes</p>
        ) : (
          <div className="grid gap-4 mt-3">
            {upcoming.map((s) => (
              <ClassCard key={s.id} session={s} onSaveLink={handleSaveLink} />
            ))}
          </div>
        )}
      </section>

      {/* Completed */}
      <section>
        <h2 className="font-bold text-lg">
          Completed Classes ({completed.length})
        </h2>

        {completed.length === 0 ? (
          <p className="text-sm text-gray-400 mt-2">No completed classes</p>
        ) : (
          <div className="grid gap-4 mt-3">
            {completed.map((s) => (
              <ClassCard key={s.id} session={s} onSaveLink={handleSaveLink} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
