/**
 * Storage - Handles localStorage operations for flashcards
 */
class Storage {
  constructor() {
    this.STORAGE_KEY = "markdown-flashcards";
    this.PROGRESS_KEY = "markdown-flashcards-progress";
    this.RECENT_KEY = "markdown-flashcards-recent";
  }

  /**
   * Save cards to localStorage
   * @param {Array} cards - Array of card objects
   * @param {string} [title='My Flashcards'] - Title of the flashcard set
   */
  saveCards(cards, title = "My Flashcards") {
    const data = {
      title: title,
      cards: cards,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));

    // Also save to recent sets
    this.saveToRecent(data);
  }

  /**
   * Load cards from localStorage
   * @returns {Object|null} - Object containing title and cards, or null if not found
   */
  loadCards() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Error parsing cards from localStorage:", e);
        return null;
      }
    }
    return null;
  }

  /**
   * Save progress to localStorage
   * @param {Object} progress - Progress object with correct/incorrect counts
   */
  saveProgress(progress) {
    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
  }

  /**
   * Load progress from localStorage
   * @returns {Object|null} - Progress object, or null if not found
   */
  loadProgress() {
    const data = localStorage.getItem(this.PROGRESS_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Error parsing progress from localStorage:", e);
        return null;
      }
    }
    return null;
  }

  /**
   * Save current set to recent sets
   * @param {Object} data - Flashcard set data
   */
  saveToRecent(data) {
    // Get existing recent sets
    let recentSets = this.getRecentSets();

    // Check if this set already exists (by title and card count)
    const existingIndex = recentSets.findIndex(
      (set) =>
        set.title === data.title && set.cards.length === data.cards.length
    );

    // If it exists, remove it
    if (existingIndex !== -1) {
      recentSets.splice(existingIndex, 1);
    }

    // Create summary object
    const summary = {
      title: data.title,
      cardCount: data.cards.length,
      timestamp: new Date().toISOString(),
      preview: data.cards.slice(0, 3).map((card) => {
        // Create simple preview object
        const front =
          typeof card.front === "string" ? card.front : "Complex Card";
        return {
          type: card.type,
          front: front.length > 50 ? front.substring(0, 50) + "..." : front,
        };
      }),
    };

    // Add to recent sets
    recentSets.unshift(summary);

    // Keep only the 10 most recent
    recentSets = recentSets.slice(0, 10);

    // Save to localStorage
    localStorage.setItem(this.RECENT_KEY, JSON.stringify(recentSets));
  }

  /**
   * Get recent flashcard sets
   * @returns {Array} - Array of recent flashcard set summaries
   */
  getRecentSets() {
    const data = localStorage.getItem(this.RECENT_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Error parsing recent sets from localStorage:", e);
        return [];
      }
    }
    return [];
  }

  /**
   * Save the raw markdown content
   * @param {string} markdown - Raw markdown content
   */
  saveRawMarkdown(markdown) {
    localStorage.setItem(`${this.STORAGE_KEY}-raw`, markdown);
  }

  /**
   * Load the raw markdown content
   * @returns {string|null} - Raw markdown content, or null if not found
   */
  loadRawMarkdown() {
    return localStorage.getItem(`${this.STORAGE_KEY}-raw`);
  }

  /**
   * Clear all saved flashcard data
   */
  clearAll() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PROGRESS_KEY);
    localStorage.removeItem(`${this.STORAGE_KEY}-raw`);
  }
}
