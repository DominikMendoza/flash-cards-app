/**
 * CardRenderer - Handles rendering of flashcards to the UI
 */
class CardRenderer {
  constructor() {
    this.frontContainer = document.getElementById("card-front-content");
    this.backContainer = document.getElementById("card-back-content");
    this.flashcard = document.querySelector(".flashcard");

    // Bind methods
    this.renderCard = this.renderCard.bind(this);
    this.flipCard = this.flipCard.bind(this);
    this.resetFlip = this.resetFlip.bind(this);
  }

  /**
   * Render a card to the UI
   * @param {Object} card - Card object to render
   */
  renderCard(card) {
    if (!card) {
      this.frontContainer.innerHTML = "<p>No cards available.</p>";
      this.backContainer.innerHTML = "";
      return;
    }

    // Reset flip state
    this.resetFlip();

    // Render based on card type
    switch (card.type) {
      case "basic":
        this.renderBasicCard(card);
        break;
      case "true-false":
        this.renderTrueFalseCard(card);
        break;
      case "multiple-choice":
        this.renderMultipleChoiceCard(card);
        break;
      case "concept":
        this.renderConceptCard(card);
        break;
      case "multi-line-question":
        this.renderMultiLineQuestionCard(card);
        break;
      default:
        this.renderBasicCard(card);
    }
  }

  /**
   * Render a basic question/answer card
   * @param {Object} card - Basic card object
   */
  renderBasicCard(card) {
    this.frontContainer.innerHTML = `<h3>${card.front}</h3>`;
    this.backContainer.innerHTML = card.back;
  }

  /**
   * Render a true/false card
   * @param {Object} card - True/False card object
   */
  renderTrueFalseCard(card) {
    this.frontContainer.innerHTML = `
            <h3>[True/False]</h3>
            <p>${card.front}</p>
        `;

    let trueFalseHtml = "";
    if (card.answer === true) {
      trueFalseHtml = `<div class="true-false-indicator true-indicator">TRUE</div>`;
    } else if (card.answer === false) {
      trueFalseHtml = `<div class="true-false-indicator false-indicator">FALSE</div>`;
    }

    this.backContainer.innerHTML = `
            ${trueFalseHtml}
            ${card.back}
        `;
  }

  /**
   * Render a multiple choice card
   * @param {Object} card - Multiple choice card object
   */
  renderMultipleChoiceCard(card) {
    // Render question and options on front
    let optionsHtml = "";
    card.options.forEach((option, index) => {
      optionsHtml += `
                <div class="multiple-choice-option">
                    <div class="checkbox"></div>
                    <div>${option.text}</div>
                </div>
            `;
    });

    this.frontContainer.innerHTML = `
            <h3>${card.front}</h3>
            <div class="multiple-choice-options">
                ${optionsHtml}
            </div>
        `;

    // Render correct answer and explanation on back
    let backOptionsHtml = "";
    card.options.forEach((option, index) => {
      const isCorrect = option.isCorrect;
      const optionClass = isCorrect
        ? "multiple-choice-option correct"
        : "multiple-choice-option";
      const checkboxClass = isCorrect ? "checkbox checked correct" : "checkbox";

      backOptionsHtml += `
                <div class="${optionClass}">
                    <div class="${checkboxClass}">${isCorrect ? "✓" : ""}</div>
                    <div>${option.text}</div>
                </div>
            `;
    });

    this.backContainer.innerHTML = `
            <div class="multiple-choice-options">
                ${backOptionsHtml}
            </div>
            <div class="explanation">
                ${card.back}
            </div>
        `;
  }

  /**
   * Render a concept/definition card
   * @param {Object} card - Concept card object
   */
  renderConceptCard(card) {
    this.frontContainer.innerHTML = `
            <h3>Define:</h3>
            <div class="concept-title">${card.front}</div>
        `;

    this.backContainer.innerHTML = card.back;
  }

  /**
   * Render a card with multi-line question
   * @param {Object} card - Multi-line question card
   */
  renderMultiLineQuestionCard(card) {
    this.frontContainer.innerHTML = card.front;
    this.backContainer.innerHTML = card.back;
  }

  /**
   * Flip the card
   */
  flipCard() {
    this.flashcard.classList.toggle("flipped");
  }

  /**
   * Reset the card flip state
   */
  resetFlip() {
    this.flashcard.classList.remove("flipped");
  }
}
