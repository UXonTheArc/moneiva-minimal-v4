import { Suspense } from "react"

import { Teach, type TeachPanel } from "@/components/m/teach"
import { STAGES } from "@/lib/moneiva/data"

async function Content({ searchParams }: PageProps<"/teach">) {
  const { state, panel, step } = await searchParams
  const panels: TeachPanel[] = ["rules", "types", "email", "right"]
  return (
    <Teach
      initialPhase={state === "empty" || state === "reading" ? state : "ready"}
      initialPanel={panels.find((p) => p === panel)}
      focus={STAGES.find((s) => s === step)}
    />
  )
}

export default function TeachPage(props: PageProps<"/teach">) {
  return (
    <Suspense>
      <Content {...props} />
    </Suspense>
  )
}
