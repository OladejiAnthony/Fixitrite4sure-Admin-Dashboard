import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "db.json")
    const fileContents = fs.readFileSync(filePath, "utf8")
    const data = JSON.parse(fileContents)

    return NextResponse.json(data.content)
  } catch (error) {
    console.error("Error reading db.json:", error)
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 })
  }
}
