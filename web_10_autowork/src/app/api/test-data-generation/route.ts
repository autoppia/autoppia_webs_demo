import { NextRequest, NextResponse } from "next/server";
import { generateProjectData } from "@/shared/data-generator";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectKey = searchParams.get('project') || 'web_10_autowork_jobs';
  const count = parseInt(searchParams.get('count') || '5');
  
  try {
    const result = await generateProjectData(projectKey, count);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

