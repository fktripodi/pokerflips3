import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.resolve('src/config/CredentialsApiKey.json');  // Ensure this matches your file location

if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error(`Credentials file not found at: ${CREDENTIALS_PATH}`);
  throw new Error(`Credentials file not found at: ${CREDENTIALS_PATH}`);
}

export async function appendToSheet(spreadsheetId: string, range: string, values: any[]) {
  const auth = new GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error appending data to Google Sheets:', error);
    throw error;
  }
}