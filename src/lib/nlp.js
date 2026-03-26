import natural from 'natural';

const wordTokenizer = new natural.WordTokenizer();
const sentenceTokenizer = new natural.SentenceTokenizer();
const stopwordsSet = new Set(natural.stopwords);

// ── helpers ──────────────────────────────────────────────────────────────────

function splitIntoChunks(text, wordsPerChunk) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
  }
  // TF-IDF needs at least 2 documents to be meaningful
  if (chunks.length < 2) {
    const sentences = sentenceTokenizer.tokenize(text);
    if (sentences && sentences.length >= 2) return sentences;
    return [text, text]; // fallback: duplicate
  }
  return chunks;
}

// ── keyword extraction (TF-IDF) ───────────────────────────────────────────────

export function extractKeywords(text) {
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();

  const chunks = splitIntoChunks(text, 200);
  chunks.forEach(chunk => tfidf.addDocument(chunk));

  const keywordScores = {};
  chunks.forEach((_, docIndex) => {
    tfidf.listTerms(docIndex).forEach(item => {
      if (!keywordScores[item.term]) keywordScores[item.term] = [];
      keywordScores[item.term].push(item.tfidf);
    });
  });

  return Object.entries(keywordScores)
    .map(([term, scores]) => ({
      keyword: term,
      score: scores.reduce((a, b) => a + b, 0) / scores.length,
    }))
    .filter(
      k =>
        !stopwordsSet.has(k.keyword) &&
        k.keyword.length >= 3 &&
        /^[a-z]+$/.test(k.keyword)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((k, index) => ({
      rank: index + 1,
      keyword: k.keyword,
      score: parseFloat(k.score.toFixed(3)),
    }));
}

// ── extractive summarizer ─────────────────────────────────────────────────────

export function extractSummary(text, numSentences = 7) {
  const sentences = sentenceTokenizer.tokenize(text);
  if (!sentences || sentences.length === 0) {
    return { sentences: [], originalSentenceCount: 0 };
  }

  if (sentences.length <= numSentences) {
    return {
      sentences: sentences.map((sentence, index) => ({
        sentence,
        index,
        score: parseFloat((1.0).toFixed(3)),
      })),
      originalSentenceCount: sentences.length,
    };
  }

  // Word frequency map (stopwords excluded, normalized)
  const allWords = wordTokenizer
    .tokenize(text.toLowerCase())
    .filter(w => w.length >= 2 && /^[a-z]+$/.test(w) && !stopwordsSet.has(w));
  const wordFreq = {};
  allWords.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(wordFreq), 1);
  Object.keys(wordFreq).forEach(w => { wordFreq[w] = wordFreq[w] / maxFreq; });

  // Paragraph boundary detection for position bonus
  const paragraphs = text.split(/\n\s*\n/);
  const paragraphBoundaries = new Set();
  let sIdx = 0;
  paragraphs.forEach(para => {
    const paraSentences = sentenceTokenizer.tokenize(para);
    if (paraSentences && paraSentences.length > 0) {
      paragraphBoundaries.add(sIdx);
      paragraphBoundaries.add(sIdx + paraSentences.length - 1);
    }
    sIdx += paraSentences ? paraSentences.length : 0;
  });

  // Score each sentence
  const scored = sentences.map((sentence, index) => {
    const words = wordTokenizer
      .tokenize(sentence.toLowerCase())
      .filter(w => w.length >= 2 && /^[a-z]+$/.test(w) && !stopwordsSet.has(w));

    if (words.length < 5 || words.length > 40) {
      return { sentence, index, score: 0 };
    }

    let freqScore = words.reduce((sum, w) => sum + (wordFreq[w] || 0), 0) / words.length;
    if (paragraphBoundaries.has(index)) freqScore *= 1.2;

    return { sentence, index, score: freqScore };
  });

  const targetCount = Math.min(numSentences, Math.ceil(sentences.length * 0.2));
  const topSentences = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, targetCount)
    .sort((a, b) => a.index - b.index); // restore original order

  return {
    sentences: topSentences.map(s => ({
      sentence: s.sentence,
      index: s.index,
      score: parseFloat(s.score.toFixed(3)),
    })),
    originalSentenceCount: sentences.length,
  };
}

export function analyzeText(text, ngramType = 'unigram') {
  // Sentence count
  const sentences = sentenceTokenizer.tokenize(text);
  const sentenceCount = sentences ? sentences.length : 0;

  // Word tokenize + lowercase
  const rawTokens = wordTokenizer.tokenize(text.toLowerCase()) || [];

  // Filter: only alphabetic, length >= 2
  const filtered = rawTokens.filter(t => t.length >= 2 && /^[a-z]+$/.test(t));

  const totalWords = filtered.length;

  const avgWordLength =
    totalWords > 0
      ? Math.round((filtered.reduce((s, w) => s + w.length, 0) / totalWords) * 10) / 10
      : 0;

  // Frequency map
  const freq = {};
  for (const word of filtered) {
    freq[word] = (freq[word] || 0) + 1;
  }

  const uniqueWords = Object.keys(freq).length;

  // Build words array
  const words = Object.entries(freq)
    .map(([word, frequency]) => ({
      word,
      frequency,
      percentage: totalWords > 0 ? Math.round((frequency / totalWords) * 1000) / 10 : 0,
      isStopword: stopwordsSet.has(word),
      stem: natural.PorterStemmer.stem(word),
    }))
    .sort((a, b) => b.frequency - a.frequency);

  const stats = {
    totalWords,
    uniqueWords,
    sentences: sentenceCount,
    avgWordLength,
  };

  if (ngramType === 'unigram') {
    return { stats, words };
  }

  // N-gram computation
  let ngramArrays;
  if (ngramType === 'bigram') {
    ngramArrays = natural.NGrams.bigrams(filtered);
  } else {
    ngramArrays = natural.NGrams.trigrams(filtered);
  }

  const ngramFreq = {};
  for (const ngram of ngramArrays) {
    const phrase = ngram.join(' ');
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
