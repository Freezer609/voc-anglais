let vocabData = null;

export async function loadVocabData() {
  if (vocabData) {
    return vocabData;
  }

  try {
    const response = await fetch('./modules/vocab_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    vocabData = await response.json();
    return vocabData;
  } catch (error) {
    console.error("Could not load vocabulary data:", error);
    return null;
  }
}
