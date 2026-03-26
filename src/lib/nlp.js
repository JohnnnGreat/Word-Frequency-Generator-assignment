// Pure JS NLP — no external dependencies.
// Replaces the `natural` package to avoid its CJS→ESM conflict with afinn-165.

// ── Stopwords ─────────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  'i','me','my','myself','we','our','ours','ourselves','you','your','yours',
  'yourself','yourselves','he','him','his','himself','she','her','hers',
  'herself','it','its','itself','they','them','their','theirs','themselves',
  'what','which','who','whom','this','that','these','those','am','is','are',
  'was','were','be','been','being','have','has','had','having','do','does',
  'did','doing','a','an','the','and','but','if','or','because','as','until',
  'while','of','at','by','for','with','about','against','between','into',
  'through','during','before','after','above','below','to','from','up','down',
  'in','out','on','off','over','under','again','further','then','once','here',
  'there','when','where','why','how','all','both','each','few','more','most',
  'other','some','such','no','nor','not','only','own','same','so','than','too',
  'very','can','will','just','should','now','ain','aren','couldn','didn',
  'doesn','hadn','hasn','haven','isn','mightn','mustn','needn','shan',
  'shouldn','wasn','weren','won','wouldn','don','ll','re','ve','ma',
  // common verbs that carry little semantic weight
  'get','got','go','going','make','made','know','see','think','come','say',
  'said','want','look','use','used','find','give','tell','work','call','take',
  'let','put','set','keep','try','turn','ask','need','feel','become','leave',
  'show','hear','play','run','move','live','believe','hold','bring','happen',
  'write','sit','stand','lose','pay','meet','include','continue','change',
  'fall','remain','remember','allow','add','seem','begin','stay','speak',
  'stop','send','receive','decide','buy','may','might','shall','could',
  // common adjectives / adverbs with low semantic value
  'new','first','last','long','great','little','own','right','big','high',
  'small','large','next','early','old','good','same','public','free','real',
  'best','true','able','back','even','still','well','way','also','like','now',
  'just','since','one','two','three','four','five','six','seven','eight',
  'nine','ten','many','much','rather','often','always','never','already',
  'every','yet','us','its',
]);

// ── Tokenizers ────────────────────────────────────────────────────────────────

function tokenizeWords(text) {
  return (text.toLowerCase().match(/[a-z]+/g) || []).filter(t => t.length >= 2);
}

const ABBREVS = /\b(mr|mrs|ms|dr|prof|sr|jr|vs|etc|inc|ltd|approx|dept|est|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec|no|vol|pp|fig)\./gi;

function tokenizeSentences(text) {
  if (!text?.trim()) return [];
  // Temporarily mask known abbreviations so their dots don't split sentences
  const masked = text.replace(ABBREVS, (m) => m.replace('.', '\x01'));
  const parts = masked
    .replace(/([.!?]+)\s+([A-Z"'])/g, '$1\x00$2')
    .replace(/([.!?]+)\s*$/, '$1\x00')
    .split('\x00')
    .map(s => s.replace(/\x01/g, '.').trim())
    .filter(s => s.length > 0);
  return parts;
}

// ── N-grams ────────────────────────────────────────────────────────────────────

function makeNgrams(tokens, n) {
  const result = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    result.push(tokens.slice(i, i + n));
  }
  return result;
}

// ── Stemmer (simplified suffix-stripping) ─────────────────────────────────────

function stem(word) {
  let w = word.toLowerCase();
  if (w.length <= 3) return w;
  if (w.endsWith('ational'))        w = w.slice(0, -7) + 'ate';
  else if (w.endsWith('tional'))    w = w.slice(0, -2);
  else if (w.endsWith('ization'))   w = w.slice(0, -7) + 'ize';
  else if (w.endsWith('ation'))     w = w.slice(0, -5) + 'ate';
  else if (w.endsWith('ations'))    w = w.slice(0, -6) + 'ate';
  else if (w.endsWith('ness'))      w = w.slice(0, -4);
  else if (w.endsWith('ment'))      w = w.slice(0, -4);
  else if (w.endsWith('ments'))     w = w.slice(0, -5);
  else if (w.endsWith('ical'))      w = w.slice(0, -4);
  else if (w.endsWith('ically'))    w = w.slice(0, -6);
  else if (w.endsWith('lessly'))    w = w.slice(0, -6);
  else if (w.endsWith('less'))      w = w.slice(0, -4);
  else if (w.endsWith('ously'))     w = w.slice(0, -5);
  else if (w.endsWith('ous'))       w = w.slice(0, -3);
  else if (w.endsWith('ively'))     w = w.slice(0, -5);
  else if (w.endsWith('ive'))       w = w.slice(0, -3);
  else if (w.endsWith('ful'))       w = w.slice(0, -3);
  else if (w.endsWith('ings') && w.length > 7) w = w.slice(0, -4);
  else if (w.endsWith('ing') && w.length > 6)  w = w.slice(0, -3);
  else if (w.endsWith('edly') && w.length > 6) w = w.slice(0, -4);
  else if (w.endsWith('edly') && w.length > 5) w = w.slice(0, -2);
  else if (w.endsWith('ed') && w.length > 5)   w = w.slice(0, -2);
  else if (w.endsWith('ies') && w.length > 5)  w = w.slice(0, -3) + 'y';
  else if (w.endsWith('ies') && w.length <= 5) w = w.slice(0, -2);
  else if (w.endsWith('es') && w.length > 4)   w = w.slice(0, -2);
  else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) w = w.slice(0, -1);
  return w;
}

// ── TF-IDF ─────────────────────────────────────────────────────────────────────

function splitIntoChunks(text, wordsPerChunk) {
  const words = text.trim().split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
  }
  if (chunks.length < 2) {
    const sentences = tokenizeSentences(text);
    if (sentences.length >= 2) return sentences;
    return [text, text]; // fallback: duplicate so TF-IDF has 2 docs
  }
  return chunks;
}

function computeTfIdf(chunks) {
  const N = chunks.length;
  const tokenizedChunks = chunks.map(c => tokenizeWords(c));

  // TF per chunk
  const chunkTFs = tokenizedChunks.map(tokens => {
    const tf = {};
    if (!tokens.length) return tf;
    tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
    Object.keys(tf).forEach(t => { tf[t] = tf[t] / tokens.length; });
    return tf;
  });

  // DF (document frequency)
  const df = {};
  tokenizedChunks.forEach(tokens => {
    new Set(tokens).forEach(t => { df[t] = (df[t] || 0) + 1; });
  });

  // IDF with smoothing
  const idf = {};
  Object.keys(df).forEach(t => {
    idf[t] = Math.log((1 + N) / (1 + df[t])) + 1;
  });

  // Average TF-IDF across chunks
  const scores = {};
  chunkTFs.forEach(tf => {
    Object.keys(tf).forEach(t => {
      const s = tf[t] * (idf[t] || 1);
      if (!scores[t]) scores[t] = [];
      scores[t].push(s);
    });
  });

  const result = {};
  Object.entries(scores).forEach(([t, arr]) => {
    result[t] = arr.reduce((a, b) => a + b, 0) / arr.length;
  });
  return result;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function analyzeText(text, ngramType = 'unigram') {
  const sentences = tokenizeSentences(text);
  const sentenceCount = sentences.length;

  const rawTokens = tokenizeWords(text);
  const filtered = rawTokens.filter(t => /^[a-z]+$/.test(t));
  const totalWords = filtered.length;

  const avgWordLength =
    totalWords > 0
      ? Math.round((filtered.reduce((s, w) => s + w.length, 0) / totalWords) * 10) / 10
      : 0;

  const freq = {};
  for (const word of filtered) {
    freq[word] = (freq[word] || 0) + 1;
  }
  const uniqueWords = Object.keys(freq).length;

  const words = Object.entries(freq)
    .map(([word, frequency]) => ({
      word,
      frequency,
      percentage: totalWords > 0 ? Math.round((frequency / totalWords) * 1000) / 10 : 0,
      isStopword: STOPWORDS.has(word),
      stem: stem(word),
    }))
    .sort((a, b) => b.frequency - a.frequency);

  const stats = { totalWords, uniqueWords, sentences: sentenceCount, avgWordLength };

  if (ngramType === 'unigram') return { stats, words };

  const ngramArrays =
    ngramType === 'bigram' ? makeNgrams(filtered, 2) : makeNgrams(filtered, 3);

  const ngramFreq = {};
  for (const ng of ngramArrays) {
    const phrase = ng.join(' ');
    ngramFreq[phrase] = (ngramFreq[phrase] || 0) + 1;
  }
  const totalNgrams = ngramArrays.length;
  const ngrams = Object.entries(ngramFreq)
    .map(([phrase, frequency]) => ({
      phrase,
      frequency,
      percentage: totalNgrams > 0 ? Math.round((frequency / totalNgrams) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.frequency - a.frequency);

  return { stats, words, ngrams };
}

export function extractKeywords(text) {
  const chunks = splitIntoChunks(text, 200);
  const tfidfScores = computeTfIdf(chunks);

  return Object.entries(tfidfScores)
    .filter(
      ([term]) =>
        !STOPWORDS.has(term) && term.length >= 3 && /^[a-z]+$/.test(term)
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([keyword, score], index) => ({
      rank: index + 1,
      keyword,
      score: parseFloat(score.toFixed(3)),
    }));
}

export function extractSummary(text, numSentences = 7) {
  const sentences = tokenizeSentences(text);
  if (!sentences.length) return { sentences: [], originalSentenceCount: 0 };

  if (sentences.length <= numSentences) {
    return {
      sentences: sentences.map((sentence, index) => ({ sentence, index, score: 1.0 })),
      originalSentenceCount: sentences.length,
    };
  }

  // Normalized word frequency (stopwords excluded)
  const allWords = tokenizeWords(text).filter(w => !STOPWORDS.has(w));
  const wordFreq = {};
  allWords.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(wordFreq), 1);
  Object.keys(wordFreq).forEach(w => { wordFreq[w] /= maxFreq; });

  // Paragraph boundary detection
  const paragraphs = text.split(/\n\s*\n/);
  const boundary = new Set();
  let sIdx = 0;
  paragraphs.forEach(para => {
    const ps = tokenizeSentences(para);
    if (ps.length > 0) {
      boundary.add(sIdx);
      boundary.add(sIdx + ps.length - 1);
    }
    sIdx += ps.length;
  });

  // Score each sentence
  const scored = sentences.map((sentence, index) => {
    const words = tokenizeWords(sentence).filter(w => !STOPWORDS.has(w));
    if (words.length < 5 || words.length > 40) return { sentence, index, score: 0 };
    let score = words.reduce((s, w) => s + (wordFreq[w] || 0), 0) / words.length;
    if (boundary.has(index)) score *= 1.2;
    return { sentence, index, score };
  });

  const targetCount = Math.min(numSentences, Math.ceil(sentences.length * 0.2));
  const top = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, targetCount)
    .sort((a, b) => a.index - b.index);

  return {
    sentences: top.map(s => ({
      sentence: s.sentence,
      index: s.index,
      score: parseFloat(s.score.toFixed(3)),
    })),
    originalSentenceCount: sentences.length,
  };
}
