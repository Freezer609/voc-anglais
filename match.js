const matchScoreSpan = document.getElementById('matchScore');
const wordsColumn = document.getElementById('wordsColumn');
const definitionsColumn = document.getElementById('definitionsColumn');
const matchNextBtn = document.getElementById('matchNextBtn');

let matchPairs = [];
let matchedPairsCount = 0;
let selectedWordItem = null;
let selectedDefItem = null;
const MATCH_COUNT = 6;

function startMatchGame() {
    showGameContainer(matchGameContainer, matchModeBtn);
    trackEvent('mode-match-started');
    if (vocab.length === 0) {
         matchScoreSpan.textContent = "Sélectionnez un chapitre pour jouer.";
         wordsColumn.innerHTML = '';
         definitionsColumn.innerHTML = '';
         return;
    }

    hideAlert();
    wordsColumn.innerHTML = '';
    definitionsColumn.innerHTML = '';
    matchNextBtn.style.display = 'none';
    matchedPairsCount = 0;
    selectedWordItem = null;
    selectedDefItem = null;
    updateMatchScore();

    const pairs = shuffleArray([...vocab]).slice(0, MATCH_COUNT);
    matchPairs = pairs.map(([word, definition]) => ({ word, definition }));

    let words = shuffleArray(matchPairs.map(p => p.word));
    let definitions = shuffleArray(matchPairs.map(p => p.definition));

    words.forEach(word => createMatchItem(wordsColumn, word, 'word'));
    definitions.forEach(def => createMatchItem(definitionsColumn, def, 'definition'));
}

function createMatchItem(parent, content, type) {
    const item = document.createElement('div');
    item.classList.add('match-item');
    item.textContent = content;
    item.dataset.type = type;
    item.dataset.value = content;
    item.addEventListener('click', () => handleMatchSelection(item));
    parent.appendChild(item);
}

function getMatchPair(item1, item2) {
    const wordValue = item1.dataset.type === 'word' ? item1.dataset.value : item2.dataset.value;
    const defValue = item1.dataset.type === 'definition' ? item1.dataset.value : item2.dataset.value;

    return matchPairs.find(p => p.word === wordValue && p.definition === defValue);
}

function handleMatchSelection(item) {
    if (item.classList.contains('matched')) return;

    if (item.dataset.type === 'word') {
        if (selectedWordItem) selectedWordItem.classList.remove('selected');
        selectedWordItem = item;
    } else {
        if (selectedDefItem) selectedDefItem.classList.remove('selected');
        selectedDefItem = item;
    }

    item.classList.add('selected');

    if (selectedWordItem && selectedDefItem) {
        const wordItem = selectedWordItem;
        const defItem = selectedDefItem;

        const pair = getMatchPair(wordItem, defItem);

        if (pair) {
            matchedPairsCount++;
            wordItem.classList.remove('selected');
            defItem.classList.remove('selected');
            wordItem.classList.add('matched');
            defItem.classList.add('matched');
            updateMatchScore();

            if (matchedPairsCount === MATCH_COUNT) {
                displayAlert('Félicitations! Toutes les paires trouvées.', varCss.colorCorrect);
                trackEvent('match-completed');
                matchNextBtn.style.display = 'block';
            }
        } else {
            wordItem.classList.add('error');
            defItem.classList.add('error');
            setTimeout(() => {
                wordItem.classList.remove('error', 'selected');
                defItem.classList.remove('error', 'selected');
            }, 1000);
        }
        
        selectedWordItem = null;
        selectedDefItem = null;
    }
}

function updateMatchScore() {
    matchScoreSpan.textContent = `Paires trouvées : ${matchedPairsCount} / ${MATCH_COUNT}`;
}

matchNextBtn.addEventListener('click', startMatchGame);