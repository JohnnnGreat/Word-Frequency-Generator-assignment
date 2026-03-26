import { analyzeText, extractKeywords, extractSummary } from '@/lib/nlp';
import { parseFile } from '@/lib/fileParser';

export async function POST(request) {
  try {
    const formData = await request.formData();

    const textInput = formData.get('text');
    const file = formData.get('file');
    const ngramType = formData.get('ngramType') || 'unigram';

    let text = '';

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      text = await parseFile(buffer, file.name, file.type);
    } else if (textInput && textInput.trim()) {
      text = textInput;
    } else {
      return Response.json({ error: 'No text or file provided.' }, { status: 400 });
    }

    if (!text.trim()) {
      return Response.json({ error: 'No readable text content found.' }, { status: 400 });
    }

    const result = analyzeText(text, ngramType);
    const keywords = extractKeywords(text);
    const summary = extractSummary(text, 7);

    return Response.json({ ...result, keywords, summary });
  } catch (err) {
    console.error('Analyze error:', err);
    return Response.json(
      { error: 'Analysis failed: ' + (err.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
