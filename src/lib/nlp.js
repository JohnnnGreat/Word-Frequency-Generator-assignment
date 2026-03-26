import natural from 'natural';

const wordTokenizer = new natural.WordTokenizer();
const sentenceTokenizer = new natural.SentenceTokenizer();
const stopwordsSet = new Set(natural.stopwords);

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
