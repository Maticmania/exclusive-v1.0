import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  await connectToDatabase();
  return Response.json( { status: 200, message: "Db connected sucessfully" });
}
