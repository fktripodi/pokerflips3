import type { NextApiRequest, NextApiResponse } from 'next';
import { appendToSheet } from '../../services/googleSheetsService';

const spreadsheetId = '1FptcHxrB1-A7tdVze_uPBo5zsEmm81gG6N-8xkverUw';
const range = 'Sheet1!A1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { players, scores, gameInfo } = req.body;

      if (!players || !scores || !gameInfo) {
        return res.status(400).json({ error: 'Missing required data' });
      }

      const values = players.map((player: string) => [
        player,
        scores[player].wins,
        scores[player].money,
        scores[player].lastUpdated,  // Include timestamp
        gameInfo,
      ]);

      console.log('Values to be sent to sheets:', values);

      const result = await appendToSheet(spreadsheetId, range, values);
      res.status(200).json({ message: 'Data successfully sent to Google Sheets', result });
    } catch (error) {
      console.error('Error sending data to Google Sheets:', error);
      res.status(500).json({ error: 'Failed to send data to Google Sheets' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}