/**
 * Main application script
 */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize components
  const markdownParser = new MarkdownParser();
  const cardManager = new CardManager();
  const cardRenderer = new CardRenderer();
  const storage = new Storage();

  // Set up card renderer for card manager
  cardManager.setRenderer(cardRenderer);

  // DOM Elements
  const importSection = document.getElementById("import-section");
  const studySection = document.getElementById("study-section");
  const markdownFileInput = document.getElementById("markdown-file");
  const markdownTextInput = document.getElementById("markdown-text");
  const generateCardsButton = document.getElementById("generate-cards");
  const backToImportButton = document.getElementById("back-to-import");
  const flipCardButton = document.getElementById("flip-card");
  const nextCardButton = document.getElementById("next-card");
  const prevCardButton = document.getElementById("prev-card");
  const markCorrectButton = document.getElementById("mark-correct");
  const markIncorrectButton = document.getElementById("mark-incorrect");
  const helpLink = document.getElementById("help-link");
  const aboutLink = document.getElementById("about-link");
  const helpModal = document.getElementById("help-modal");
  const aboutModal = document.getElementById("about-modal");
  const closeModalButtons = document.querySelectorAll(".close-modal");
  const accordionHeaders = document.querySelectorAll(".accordion-header");

  // Event Handlers

  /**
   * Generate flashcards from markdown input
   */
  const generateFlashcards = () => {
    let markdownContent = markdownTextInput.value.trim();

    if (!markdownContent) {
      alert("Please enter markdown content or upload a markdown file.");
      return;
    }

    // Save raw markdown for future use
    storage.saveRawMarkdown(markdownContent);

    // Parse markdown to cards
    const cards = markdownParser.parse(markdownContent);

    if (cards.length === 0) {
      alert(
        "No valid flashcards found in the markdown content. Please check the format and try again."
      );
      return;
    }

    // Load cards into manager
    cardManager.loadCards(cards);

    // Save cards to storage
    storage.saveCards(cards);

    // Show the first card
    cardRenderer.renderCard(cardManager.getCurrentCard());

    // Switch to study section
    switchToStudySection();
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (
      !file.name.endsWith(".md") &&
      !file.name.endsWith(".markdown") &&
      file.type !== "text/markdown"
    ) {
      alert("Please upload a markdown file (.md or .markdown).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      markdownTextInput.value = e.target.result;
    };
    reader.onerror = () => {
      alert("Error reading file. Please try again.");
    };
    reader.readAsText(file);
  };

  /**
   * Switch to study section
   */
  const switchToStudySection = () => {
    importSection.classList.remove("active");
    studySection.classList.add("active");
    studySection.style.display = "block";
  };

  /**
   * Switch to import section
   */
  const switchToImportSection = () => {
    studySection.classList.remove("active");
    importSection.classList.add("active");
    studySection.style.display = "none";
  };

  /**
   * Open modal
   * @param {HTMLElement} modal - Modal element to open
   */
  const openModal = (modal) => {
    modal.style.display = "block";
  };

  /**
   * Close modal
   * @param {HTMLElement} modal - Modal element to close
   */
  const closeModal = (modal) => {
    modal.style.display = "none";
  };

  /**
   * Toggle accordion item
   * @param {HTMLElement} header - Accordion header element
   */
  const toggleAccordion = (header) => {
    const item = header.parentElement;
    const isActive = item.classList.contains("active");

    // Close all accordion items
    document.querySelectorAll(".accordion-item").forEach((item) => {
      item.classList.remove("active");
    });

    // If the clicked item wasn't active, make it active
    if (!isActive) {
      item.classList.add("active");
    }
  };

  /**
   * Load saved flashcards from storage
   */
  const loadSavedFlashcards = () => {
    // Try to load raw markdown first
    const rawMarkdown = storage.loadRawMarkdown();
    if (rawMarkdown) {
      markdownTextInput.value = rawMarkdown;
    }

    // Try to load saved cards
    const savedData = storage.loadCards();
    if (savedData && savedData.cards && savedData.cards.length > 0) {
      // Ask user if they want to load saved cards
      const loadSaved = confirm(
        "Found saved flashcards. Would you like to load them?"
      );
      if (loadSaved) {
        cardManager.loadCards(savedData.cards);
        cardRenderer.renderCard(cardManager.getCurrentCard());
        switchToStudySection();

        // Also load progress
        cardManager.loadProgress();
      }
    }
  };

  // Event Listeners

  // Generate cards button
  generateCardsButton.addEventListener("click", generateFlashcards);

  // File upload
  markdownFileInput.addEventListener("change", handleFileUpload);

  // Back to import button
  backToImportButton.addEventListener("click", switchToImportSection);

  // Flip card button
  flipCardButton.addEventListener("click", cardRenderer.flipCard);

  // Next card button
  nextCardButton.addEventListener("click", () => {
    const nextCard = cardManager.nextCard();
    cardRenderer.renderCard(nextCard);
  });

  // Previous card button
  prevCardButton.addEventListener("click", () => {
    const prevCard = cardManager.prevCard();
    cardRenderer.renderCard(prevCard);
  });

  // Mark correct button
  markCorrectButton.addEventListener("click", () => {
    cardManager.markCorrect();

    // Automatically move to next card
    setTimeout(() => {
      const nextCard = cardManager.nextCard();
      cardRenderer.renderCard(nextCard);
    }, 500);
  });

  // Mark incorrect button
  markIncorrectButton.addEventListener("click", () => {
    cardManager.markIncorrect();

    // Automatically move to next card
    setTimeout(() => {
      const nextCard = cardManager.nextCard();
      cardRenderer.renderCard(nextCard);
    }, 500);
  });

  // Help link
  helpLink.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(helpModal);
  });

  // About link
  aboutLink.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(aboutModal);
  });

  // Close modal buttons
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".modal");
      closeModal(modal);
    });
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal(e.target);
    }
  });

  // Accordion headers
  accordionHeaders.forEach((header) => {
    header.addEventListener("click", () => toggleAccordion(header));
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Only apply shortcuts when in study section
    if (!studySection.classList.contains("active")) return;

    switch (e.key) {
      case " ": // Space
        cardRenderer.flipCard();
        break;
      case "ArrowRight":
        const nextCard = cardManager.nextCard();
        cardRenderer.renderCard(nextCard);
        break;
      case "ArrowLeft":
        const prevCard = cardManager.prevCard();
        cardRenderer.renderCard(prevCard);
        break;
      case "1":
      case "c":
        cardManager.markCorrect();
        setTimeout(() => {
          const next = cardManager.nextCard();
          cardRenderer.renderCard(next);
        }, 500);
        break;
      case "2":
      case "i":
        cardManager.markIncorrect();
        setTimeout(() => {
          const next = cardManager.nextCard();
          cardRenderer.renderCard(next);
        }, 500);
        break;
    }
  });

  // Sample markdown for the textarea
  const sampleMarkdown = `## What is Markdown?
Markdown is a lightweight markup language with plain-text formatting syntax.

## [T/F] Markdown was created by John Gruber
T
John Gruber created Markdown in 2004 with Aaron Swartz.

## Which of the following is a Markdown element?
- [ ] <p>
- [x] #
- [ ] <div>
- [ ] {tag}

The # symbol is used in Markdown to create headings.

## Concept: Front Matter
Front Matter is metadata at the beginning of a Markdown file, often used in static site generators.

## What are the components of a good README file?
A good README file should explain what a project does and how to use it.
%
A good README typically includes:

1. Project title and description
2. Installation instructions
3. Usage examples
4. Features
5. Contributing guidelines
6. License information

\`\`\`markdown
# Project Title

A brief description of what this project does.

## Installation

\`\`\`bash
npm install my-project
\`\`\`
\`\`\``;

  // Set sample markdown in textarea
  if (!markdownTextInput.value) {
    markdownTextInput.value = sampleMarkdown;
  }

  // Try to load saved flashcards
  loadSavedFlashcards();

  // Open the first accordion item by default
  if (accordionHeaders.length > 0) {
    toggleAccordion(accordionHeaders[0]);
  }
});
