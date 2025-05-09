/**
 * CardManager - Manages the collection of flashcards and navigation
 */
class CardManager {
  constructor() {
    this.cards = [];
    this.currentIndex = 0;
    this.correctCount = 0;
    this.incorrectCount = 0;
    this.renderer = null;
  }

  /**
   * Set the card renderer
   * @param {CardRenderer} renderer - The renderer to use
   */
  setRenderer(renderer) {
    this.renderer = renderer;
  }

  /**
   * Load cards into the manager
   * @param {Array} cards - Array of card objects
   */
  loadCards(cards) {
    this.cards = cards;
    this.currentIndex = 0;
    this.correctCount = 0;
    this.incorrectCount = 0;
    this.updateStats();
  }

  /**
   * Get the current card
   * @returns {Object} - Current card object
   */
  getCurrentCard() {
    if (this.cards.length === 0) return null;
    return this.cards[this.currentIndex];
  }

  /**
   * Move to the next card
   * @returns {Object} - New current card
   */
  nextCard() {
    if (this.cards.length === 0) return null;
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    this.updateStats();
    return this.getCurrentCard();
  }

  /**
   * Move to the previous card
   * @returns {Object} - New current card
   */
  prevCard() {
    if (this.cards.length === 0) return null;
    this.currentIndex =
      (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    this.updateStats();
    return this.getCurrentCard();
  }

  /**
   * Mark the current card as correct
   */
  markCorrect() {
    this.correctCount++;
    this.updateStats();

    // Save progress to localStorage
    this.saveProgress();
  }

  /**
   * Mark the current card as incorrect
   */
  markIncorrect() {
    this.incorrectCount++;
    this.updateStats();

    // Save progress to localStorage
    this.saveProgress();
  }

  /**
   * Update statistics display
   */
  updateStats() {
    document.getElementById("current-card-num").textContent = this.cards.length
      ? this.currentIndex + 1
      : 0;
    document.getElementById("total-cards").textContent = this.cards.length;
    document.getElementById("correct-count").textContent = this.correctCount;
    document.getElementById("incorrect-count").textContent =
      this.incorrectCount;
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.correctCount = 0;
    this.incorrectCount = 0;
    this.updateStats();

    // Reset progress in localStorage
    localStorage.removeItem("flashcard-progress");
  }

  /**
   * Save progress to localStorage
   */
  saveProgress() {
    const progress = {
      correctCount: this.correctCount,
      incorrectCount: this.incorrectCount,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("flashcard-progress", JSON.stringify(progress));
  }

  /**
   * Load progress from localStorage
   */
  loadProgress() {
    const progressData = localStorage.getItem("flashcard-progress");
    if (progressData) {
      try {
        const progress = JSON.parse(progressData);
        this.correctCount = progress.correctCount || 0;
        this.incorrectCount = progress.incorrectCount || 0;
        this.updateStats();
      } catch (e) {
        console.error("Error loading progress:", e);
      }
    }
  }

  /**
   * Shuffle the cards
   */
  shuffleCards() {
    // Fisher-Yates shuffle algorithm
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }

    // Reset current index
    this.currentIndex = 0;
    this.updateStats();

    // Render the first card
    if (this.renderer && this.cards.length > 0) {
      this.renderer.renderCard(this.getCurrentCard());
    }
  }

  /**
   * Filter cards by type
   * @param {string} type - Card type to filter by
   */
  filterByType(type) {
    if (!type || type === "all") {
      // Remove filtering
      this.loadCards(this.allCards || this.cards);
      return;
    }

    // Store all cards if not already stored
    if (!this.allCards) {
      this.allCards = [...this.cards];
    }

    // Filter cards by type
    const filteredCards = this.allCards.filter((card) => card.type === type);
    this.cards = filteredCards;
    this.currentIndex = 0;
    this.updateStats();

    // Render the first card
    if (this.renderer && this.cards.length > 0) {
      this.renderer.renderCard(this.getCurrentCard());
    }
  }

  /**
   * Get the total number of cards
   * @returns {number} - Number of cards
   */
  getCardCount() {
    return this.cards.length;
  }
}
