import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { readFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import type { CsvUploadResponse, Recipient } from '@card0r/shared';

const REQUIRED_COLUMNS = ['name', 'message'];

function normalizeHeaders(headers: string[]): string[] {
  return headers.map(h =>
    h.toLowerCase().trim()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  );
}

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  const normalized = normalizeHeaders(headers);
  for (const name of possibleNames) {
    const index = normalized.indexOf(name);
    if (index !== -1) return index;
  }
  return -1;
}

export async function parseCSV(filePath: string): Promise<CsvUploadResponse> {
  try {
    const fileContent = await readFile(filePath, 'utf-8');
    const records = parse(fileContent, {
      skip_empty_lines: true,
      trim: true
    });

    if (records.length < 2) {
      return {
        recipients: [],
        errors: ['File is empty or has no data rows']
      };
    }

    const headers = records[0] as string[];
    const nameIndex = findColumnIndex(headers, ['name', 'recipient', 'person', 'to']);
    const messageIndex = findColumnIndex(headers, ['message', 'guidance', 'note', 'text', 'msg']);

    if (nameIndex === -1 || messageIndex === -1) {
      return {
        recipients: [],
        errors: [`Missing required columns. Found: ${headers.join(', ')}. Need: name and message`]
      };
    }

    const recipients: Recipient[] = [];
    const errors: string[] = [];

    for (let i = 1; i < records.length; i++) {
      const row = records[i] as string[];
      const name = row[nameIndex]?.trim();
      const messageGuidance = row[messageIndex]?.trim();

      if (!name || !messageGuidance) {
        errors.push(`Row ${i + 1}: Missing name or message`);
        continue;
      }

      recipients.push({
        id: uuidv4(),
        name,
        messageGuidance
      });
    }

    return { recipients, errors };
  } catch (error) {
    return {
      recipients: [],
      errors: [error instanceof Error ? error.message : 'Failed to parse CSV file']
    };
  }
}

export async function parseExcel(filePath: string): Promise<CsvUploadResponse> {
  try {
    const fileBuffer = await readFile(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    if (workbook.SheetNames.length === 0) {
      return {
        recipients: [],
        errors: ['Excel file has no sheets']
      };
    }

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];

    if (data.length < 2) {
      return {
        recipients: [],
        errors: ['File is empty or has no data rows']
      };
    }

    const headers = data[0];
    const nameIndex = findColumnIndex(headers, ['name', 'recipient', 'person', 'to']);
    const messageIndex = findColumnIndex(headers, ['message', 'guidance', 'note', 'text', 'msg']);

    if (nameIndex === -1 || messageIndex === -1) {
      return {
        recipients: [],
        errors: [`Missing required columns. Found: ${headers.join(', ')}. Need: name and message`]
      };
    }

    const recipients: Recipient[] = [];
    const errors: string[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const name = row[nameIndex]?.toString().trim();
      const messageGuidance = row[messageIndex]?.toString().trim();

      if (!name || !messageGuidance) {
        errors.push(`Row ${i + 1}: Missing name or message`);
        continue;
      }

      recipients.push({
        id: uuidv4(),
        name,
        messageGuidance
      });
    }

    return { recipients, errors };
  } catch (error) {
    return {
      recipients: [],
      errors: [error instanceof Error ? error.message : 'Failed to parse Excel file']
    };
  }
}
