import { NextResponse } from 'next/server';
import { google } from 'googleapis';

interface ExportDocsRequest {
  title: string;
  brief: string;
  nextActions: string[];
  teamHealthScore?: number;
  riskLevel?: string;
  pulseSummary?: string;
}

// Top-level auth client — created once, not on every request (Fix #3)
function getAuthClient() {
  const serviceAccountEmail = process.env.GOOGLE_DOCS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DOCS_PRIVATE_KEY;
  if (!serviceAccountEmail || !privateKey) return null;
  return new google.auth.GoogleAuth({
    credentials: { client_email: serviceAccountEmail, private_key: privateKey.replace(/\\n/g, '\n') },
    scopes: ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive'],
  });
}

export async function POST(req: Request) {
  try {
    const body: ExportDocsRequest = await req.json();
    const { title, brief, nextActions, teamHealthScore, riskLevel, pulseSummary } = body;

    if (!brief && (!nextActions || nextActions.length === 0)) {
      return NextResponse.json({ error: 'No content to export' }, { status: 400 });
    }

    const authClient = getAuthClient();

    if (!authClient) {
      return NextResponse.json({
        success: true,
        docUrl: '#demo-export',
        demo: true,
        message: 'Export ready (demo mode)',
        content: formatContent(title, brief, nextActions, teamHealthScore, riskLevel, pulseSummary),
      });
    }

    const docs = google.docs({ version: 'v1', auth: authClient });
    const drive = google.drive({ version: 'v3', auth: authClient });
    const docTitle = title || `Invisible PM Brief — ${new Date().toLocaleDateString()}`;
    const createRes = await docs.documents.create({ requestBody: { title: docTitle } });
    const documentId = createRes.data.documentId!;

    const requests: { insertText: { location: { index: number }; text: string } }[] = [];
    let idx = 1;
    const ins = (text: string) => { requests.push({ insertText: { location: { index: idx }, text } }); idx += text.length; };

    ins(`${docTitle}\n\n`);
    if (teamHealthScore !== undefined) ins(`Team Health: ${teamHealthScore}/100 | Risk: ${riskLevel?.toUpperCase()}\n\n`);
    if (pulseSummary) ins(`Pulse Summary\n${pulseSummary}\n\n`);
    if (brief) ins(`Executive Brief\n${brief}\n\n`);
    if (nextActions?.length) { ins(`Next Actions\n`); nextActions.forEach(a => ins(`• ${a}\n`)); }

    await docs.documents.batchUpdate({ documentId, requestBody: { requests } });
    await drive.permissions.create({ fileId: documentId, requestBody: { role: 'reader', type: 'anyone' } });

    return NextResponse.json({ success: true, docUrl: `https://docs.google.com/document/d/${documentId}/edit`, demo: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to export';
    console.error('Docs export error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatContent(title: string, brief: string, actions: string[], score?: number, risk?: string, pulse?: string): string {
  let c = `# ${title || 'Leadership Brief'}\n\n`;
  if (score !== undefined) c += `**Health:** ${score}/100 | **Risk:** ${risk?.toUpperCase()}\n\n`;
  if (pulse) c += `## Pulse\n${pulse}\n\n`;
  if (brief) c += `## Brief\n${brief}\n\n`;
  if (actions?.length) c += `## Actions\n${actions.map(a => `- ${a}`).join('\n')}\n`;
  return c;
}
