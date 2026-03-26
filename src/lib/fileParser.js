export async function parseFile(buffer, filename, mimeType) {
  const ext = (filename || '').split('.').pop().toLowerCase();

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    ext === 'docx' ||
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const mammoth = (await import('mammoth')).default;
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // TXT or any other text format
  return buffer.toString('utf-8');
}
