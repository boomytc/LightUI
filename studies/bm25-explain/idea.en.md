# Explainable Search

Search ranking is not a black-box total score. Never add sparse and dense scores directly; decompose scores into term frequency saturation and document length penalty.

## The Problem

Modern full-text search and RAG architectures often treat retrieval ranking as a black-box number:

- Adding BM25 raw scores and dense vector cosine similarities directly, causing scale collapse and untraceable bad cases.
- Assuming higher term frequency is always better, allowing lengthy, keyword-stuffed documents to displace concise, exact matches.
- Treating all matched tokens equally, ignoring the massive IDF gap between common filler words and rare entity terms.
- Failing to pinpoint whether a retrieval bug stems from tokenization, stopword leakage, document length dilution, or misconfigured $k_1$ / $b$ parameters.

## The Rule

Break retrieval ranking into three transparent layers:

1. **Scale Separation & Multi-lane Fusion**
   - Sparse (BM25) produces unbounded positive scores; vector search produces cosine similarities bounded in $[-1, 1]$.
   - Never add them directly. Use **Reciprocal Rank Fusion (RRF: $\frac{1}{k + rank}$)** or **Max-norm Normalized Weighted Fusion**.
2. **Three Pillars of Lucene BM25**
   - **IDF Rarity**: $\ln(1 + \frac{N - df + 0.5}{df + 0.5})$. Rarer terms carry exponential value. Lucene adds $+1$ inside the logarithm to guarantee strictly non-negative values.
   - **TF Saturation ($k_1$)**: Caps the maximum gain from term frequency to $k_1 + 1$ times. Default 1.2 prevents keyword repetition from running away.
   - **Length Penalty ($b$)**: Penalizes documents longer than the corpus average ($|D| / avgdl$). Default 0.75 rewards concise, information-dense hits.
3. **Pipeline Transparency**
   - Query → Tokenization → Inverted Index Postings → BM25 Formula Breakdown → Term Waterfall → Live Parameter Tuning.

## Comparison: Black-box vs Explainable Search

| | Black-box Scoring | Explainable Search |
| --- | --- | --- |
| Bad Case Debugging | Guessing and re-prompting | Inspecting exact IDF, TF saturation, and $|D|/avgdl$ penalty |
| Hybrid Fusion | Raw addition scale collapse | RRF rank fusion or normalized weighting |
| Parameter Tuning | Blind trial-and-error | Real-time response curve analysis for $k_1$ and $b$ |
| Tokenizer Bugs | Mystery zero-hits | Comparing exact term, subwords, and Porter stemming |
