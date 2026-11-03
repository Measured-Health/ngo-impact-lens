import { LensChat } from "@/components/LensChat";
import { listModels } from "@/lib/models";

// Reads the server's model configuration on every request, so changing
// environment variables takes effect without a rebuild.
export const dynamic = "force-dynamic";

export default function Page() {
  return <LensChat models={listModels()} needsAccessCode={Boolean(process.env.LENS_ACCESS_CODE)} />;
}
