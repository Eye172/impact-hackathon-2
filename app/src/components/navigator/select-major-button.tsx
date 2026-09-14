"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/ui/button";

export function SelectMajorButton({
  majorId,
  selected,
}: {
  majorId: string;
  selected: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  async function select() {
    setSaving(true);
    try {
      await fetch("/api/career/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedMajorId: majorId }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ActionButton onClick={select} disabled={saving || selected}>
      {selected ? "Выбрано как основное направление" : "Сделать основным направлением"}
    </ActionButton>
  );
}
