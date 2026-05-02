import { NextResponse } from 'next/server';

interface Task {
  task: string;
  owner: string;
  source: string;
  status: string;
  priority: string;
  deadline: string;
  dependency?: string;
  confidence?: number;
}

export async function POST(req: Request) {
  try {
    const body: { title: string; tasks: Task[] } = await req.json();
    const { title, tasks } = body;

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ error: 'No tasks to export' }, { status: 400 });
    }

    const serviceAccountEmail = process.env.GOOGLE_DOCS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_DOCS_PRIVATE_KEY;

    if (!serviceAccountEmail || !privateKey) {
      return NextResponse.json({
        success: true,
        sheetUrl: '#demo-export',
        demo: true,
        message: 'Export ready (demo mode)',
      });
    }

    const { google } = await import('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: serviceAccountEmail, private_key: privateKey.replace(/\\n/g, '\n') },
      scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });
    const sheetTitle = title || `Invisible PM Tasks — ${new Date().toLocaleDateString()}`;

    const createRes = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: sheetTitle },
        sheets: [{ properties: { title: 'Task Board' } }],
      },
    });

    const spreadsheetId = createRes.data.spreadsheetId!;
    const headers = ['Task', 'Owner', 'Source', 'Status', 'Priority', 'Deadline', 'Dependency', 'Confidence'];
    const rows = tasks.map(t => [
      t.task, t.owner || 'Unassigned', t.source, t.status?.replaceAll('_', ' '),
      t.priority, t.deadline || '-', t.dependency || '-', t.confidence?.toString() || '-',
    ]);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Task Board!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [headers, ...rows] },
    });

    // Style header row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          repeatCell: {
            range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { backgroundColor: { red: 0.26, green: 0.52, blue: 0.96 }, textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } } } },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        }],
      },
    });

    await drive.permissions.create({ fileId: spreadsheetId, requestBody: { role: 'reader', type: 'anyone' } });

    return NextResponse.json({
      success: true,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      demo: false,
    });
  } catch (error: any) {
    console.error('Sheets export error:', error);
    return NextResponse.json({ error: error.message || 'Failed to export' }, { status: 500 });
  }
}
