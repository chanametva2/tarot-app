import { google } from 'googleapis';
import serviceAccount from './service-account.json';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

function getServiceAccount() {
  return {
    type: 'service_account',
    project_id: serviceAccount.project_id,
    private_key_id: serviceAccount.private_key_id,
    private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
    client_email: serviceAccount.client_email,
    client_id: serviceAccount.client_id,
    auth_uri: serviceAccount.auth_uri,
    token_uri: serviceAccount.token_uri,
    auth_provider_x509_cert_url: serviceAccount.auth_provider_x509_cert_url,
    client_x509_cert_url: serviceAccount.client_x509_cert_url,
  };
}

export type MemberStatus = 'pending' | 'active' | 'inactive' | 'banned';

export interface Member {
  member_id: string;
  email: string;
  password_hash: string;
  google_sub: string;
  name: string;
  role: 'user' | 'admin';
  status: MemberStatus;
  created_at: string;
  last_login: string;
  approved_by?: string;
  approved_at?: string;
}

const sheets = google.sheets('v4');

function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: getServiceAccount(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
}

export async function getMembers(): Promise<Member[]> {
  const auth = getAuth();
  const client = await auth.getClient();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'members!A2:K',
    auth: client as any,
  });

  const rows = response.data.values || [];
  
  return rows.map((row: string[]) => ({
    member_id: row[0] || '',
    email: row[1] || '',
    password_hash: row[2] || '',
    google_sub: row[3] || '',
    name: row[4] || '',
    role: (row[5] || 'user') as 'user' | 'admin',
    status: (row[6] || 'pending') as MemberStatus,
    created_at: row[7] || '',
    last_login: row[8] || '',
    approved_by: row[9] || '',
    approved_at: row[10] || '',
  }));
}

export async function getMemberByEmail(email: string): Promise<Member | null> {
  const members = await getMembers();
  return members.find(m => m.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getMemberByGoogleSub(googleSub: string): Promise<Member | null> {
  const members = await getMembers();
  return members.find(m => m.google_sub === googleSub) || null;
}

export async function createMember(member: Omit<Member, 'created_at' | 'last_login'>): Promise<void> {
  const auth = getAuth();
  const client = await auth.getClient();
  
  const now = new Date().toISOString();
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'members!A2:I',
    valueInputOption: 'RAW',
    auth: client as any,
    requestBody: {
      values: [[
        member.member_id,
        member.email,
        member.password_hash,
        member.google_sub,
        member.name,
        member.role,
        member.status,
        now,
        now,
      ]],
    },
  });
}

export async function updateMemberLastLogin(memberId: string): Promise<void> {
  const members = await getMembers();
  const rowIndex = members.findIndex(m => m.member_id === memberId);
  
  if (rowIndex === -1) return;
  
  const auth = getAuth();
  const client = await auth.getClient();
  const now = new Date().toISOString();
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `members!I${rowIndex + 2}`,
    valueInputOption: 'RAW',
    auth: client as any,
    requestBody: {
      values: [[now]],
    },
  });
}

export async function updateMemberStatus(
  memberId: string,
  status: MemberStatus,
  approvedBy?: string
): Promise<void> {
  const members = await getMembers();
  const rowIndex = members.findIndex(m => m.member_id === memberId);
  
  if (rowIndex === -1) return;
  
  const auth = getAuth();
  const client = await auth.getClient();
  const now = new Date().toISOString();
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `members!G${rowIndex + 2}:K${rowIndex + 2}`,
    valueInputOption: 'RAW',
    auth: client as any,
    requestBody: {
      values: [[status, members[rowIndex].created_at, members[rowIndex].last_login, approvedBy || '', approvedBy ? now : '']],
    },
  });
}

export async function getMemberById(memberId: string): Promise<Member | null> {
  const members = await getMembers();
  return members.find(m => m.member_id === memberId) || null;
}

export async function getPendingMembers(): Promise<Member[]> {
  const members = await getMembers();
  return members.filter(m => m.status === 'pending');
}
