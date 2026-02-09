import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type StatusCode = '★' | 'W' | 'C' | 'M' | 'A' | 'X' | '?';

const VALID_STATUSES: StatusCode[] = ['★', 'W', 'C', 'M', 'A', 'X', '?'];

const STATUSES_FILE = path.join(process.cwd(), 'src', 'config', 'gallery-statuses.json');

function readStatuses(): Record<string, StatusCode> {
  try {
    const data = fs.readFileSync(STATUSES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function writeStatuses(statuses: Record<string, StatusCode>): void {
  fs.writeFileSync(STATUSES_FILE, JSON.stringify(statuses, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const statuses = readStatuses();
    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Gallery statuses fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to read statuses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body as { id: string; status: string };

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "id"' },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status as StatusCode)) {
      return NextResponse.json(
        { error: 'Invalid status code', valid: VALID_STATUSES },
        { status: 400 }
      );
    }

    const statuses = readStatuses();
    statuses[id] = status as StatusCode;
    writeStatuses(statuses);

    return NextResponse.json({ success: true, statuses });
  } catch (error) {
    console.error('Gallery status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
