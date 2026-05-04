document.addEventListener('DOMContentLoaded', () => {
  const masterToggleInput = document.getElementById('masterToggle');
  const gridCountInput = document.getElementById('gridCount');
  const showShortsInput = document.getElementById('showShorts');
  const showGamesInput = document.getElementById('showGames');
  const showPostsInput = document.getElementById('showPosts');
  const showExploreInput = document.getElementById('showExplore');

  // Load saved preferences
  chrome.storage.sync.get({
    enabled: true,
    gridCount: 6,
    showShorts: false,
    showGames: false,
    showPosts: false,
    showExplore: false
  }, (prefs) => {
    masterToggleInput.checked = prefs.enabled;
    gridCountInput.value = prefs.gridCount;
    showShortsInput.checked = prefs.showShorts;
    showGamesInput.checked = prefs.showGames;
    showPostsInput.checked = prefs.showPosts;
    showExploreInput.checked = prefs.showExplore;
  });

  // Save preferences when changed
  const savePrefs = () => {
    chrome.storage.sync.set({
      enabled: masterToggleInput.checked,
      gridCount: parseInt(gridCountInput.value, 10),
      showShorts: showShortsInput.checked,
      showGames: showGamesInput.checked,
      showPosts: showPostsInput.checked,
      showExplore: showExploreInput.checked
    });
  };

  masterToggleInput.addEventListener('change', savePrefs);
  gridCountInput.addEventListener('change', savePrefs);
  showShortsInput.addEventListener('change', savePrefs);
  showGamesInput.addEventListener('change', savePrefs);
  showPostsInput.addEventListener('change', savePrefs);
  showExploreInput.addEventListener('change', savePrefs);
});