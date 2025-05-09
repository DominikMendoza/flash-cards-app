/**
 * MarkdownParser - Converts markdown content to flashcard objects
 */
class MarkdownParser {
  constructor() {
    // Configure marked.js options
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: false,
      highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (e) {
            console.error(e);
          }
        }
        return hljs.highlightAuto(code).value;
      },
    });
  }

  /**
   * Parse markdown content into flashcard objects
   * @param {string} markdownContent - The markdown content to parse
   * @returns {array} - Array of flashcard objects
   */
  parse(markdownContent) {
    // First, we need to split the content by h2 headers (##)
    const regex = /(^|\n)## (.*?)(?=\n## |$)/gs;
    let match;
    const cards = [];

    while ((match = regex.exec(markdownContent)) !== null) {
      const cardContent = match[0].trim();
      const card = this.parseCard(cardContent);
      if (card) {
        cards.push(card);
      }
    }

    return cards;
  }

  /**
   * Parse a single card content into a card object
   * @param {string} cardContent - Content of a single card
   * @returns {object} - Card object with type, front, back, etc.
   */
  parseCard(cardContent) {
    // Extract the title (everything after ## and before the first newline)
    const titleMatch = cardContent.match(/^## (.*?)(?:\n|$)/);
    if (!titleMatch) return null;

    const title = titleMatch[1].trim();
    const contentAfterTitle = cardContent
      .substring(titleMatch[0].length)
      .trim();

    // Determine card type and parse accordingly
    if (title.startsWith("[T/F]") || title.startsWith("[V/F]")) {
      return this.parseTrueFalseCard(title, contentAfterTitle);
    } else if (
      contentAfterTitle.includes("- [ ]") ||
      contentAfterTitle.includes("- [x]")
    ) {
      return this.parseMultipleChoiceCard(title, contentAfterTitle);
    } else if (title.startsWith("Concept:")) {
      return this.parseConceptCard(title, contentAfterTitle);
    } else if (contentAfterTitle.includes("%")) {
      return this.parseMultiLineQuestionCard(title, contentAfterTitle);
    } else {
      return this.parseBasicCard(title, contentAfterTitle);
    }
  }

  /**
   * Parse a basic question/answer card
   * @param {string} title - The card title (question)
   * @param {string} content - The card content (answer)
   * @returns {object} - Basic card object
   */
  parseBasicCard(title, content) {
    return {
      type: "basic",
      front: title,
      back: marked.parse(content),
    };
  }

  /**
   * Parse a true/false card
   * @param {string} title - The card title (question)
   * @param {string} content - The card content (answer)
   * @returns {object} - True/False card object
   */
  parseTrueFalseCard(title, content) {
    // Remove the [T/F] or [V/F] prefix from the title
    const question = title.replace(/^\[(T|V)\/F\]\s*/i, "").trim();

    // Extract the answer (T/F or true/false) from the first line
    const firstLine = content.split("\n")[0].trim().toLowerCase();
    let answer = "";
    let explanation = "";

    if (
      firstLine === "t" ||
      firstLine === "true" ||
      firstLine === "v" ||
      firstLine === "verdadero"
    ) {
      answer = true;
      explanation = content.substring(content.indexOf("\n")).trim();
    } else if (
      firstLine === "f" ||
      firstLine === "false" ||
      firstLine === "falso"
    ) {
      answer = false;
      explanation = content.substring(content.indexOf("\n")).trim();
    } else {
      // If not explicitly marked, treat the whole content as explanation
      answer = null;
      explanation = content;
    }

    return {
      type: "true-false",
      front: question,
      answer: answer,
      back: marked.parse(explanation),
    };
  }

  /**
   * Parse a multiple choice card
   * @param {string} title - The card title (question)
   * @param {string} content - The card content (options and explanation)
   * @returns {object} - Multiple choice card object
   */
  parseMultipleChoiceCard(title, content) {
    const options = [];
    const lines = content.split("\n");
    let correctIndex = -1;
    let explanationStart = -1;

    // Parse options
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if this line is an option
      const optionMatch = line.match(/^- \[([ x])\] (.*)/);
      if (optionMatch) {
        const isChecked = optionMatch[1] === "x";
        const optionText = optionMatch[2].trim();

        options.push({
          text: optionText,
          isCorrect: isChecked,
        });

        if (isChecked) {
          correctIndex = options.length - 1;
        }
      } else if (options.length > 0 && line === "") {
        // First empty line after options marks the beginning of explanation
        explanationStart = i + 1;
        break;
      }
    }

    // Extract explanation
    let explanation = "";
    if (explanationStart > 0 && explanationStart < lines.length) {
      explanation = lines.slice(explanationStart).join("\n").trim();
    }

    return {
      type: "multiple-choice",
      front: title,
      options: options,
      correctIndex: correctIndex,
      back: marked.parse(explanation),
    };
  }

  /**
   * Parse a concept/definition card
   * @param {string} title - The card title (concept name)
   * @param {string} content - The card content (definition)
   * @returns {object} - Concept card object
   */
  parseConceptCard(title, content) {
    // Extract the concept name (remove "Concept:" prefix)
    const conceptName = title.replace(/^Concept:\s*/i, "").trim();

    return {
      type: "concept",
      front: conceptName,
      back: marked.parse(content),
    };
  }

  /**
   * Parse a card with multi-line question
   * @param {string} title - The initial part of question
   * @param {string} content - Rest of question and answer
   * @returns {object} - Card object with multi-line question
   */
  parseMultiLineQuestionCard(title, content) {
    // Split content at % which separates question from answer
    const parts = content.split("%");

    // The question is title + first part of content
    const question = title + "\n\n" + parts[0].trim();

    // The answer is the rest of the content after %
    const answer = parts.slice(1).join("%").trim();

    return {
      type: "multi-line-question",
      front: marked.parse(question),
      back: marked.parse(answer),
    };
  }

  /**
   * Extract tags from a card content (not implemented yet)
   * @param {string} content - The card content
   * @returns {array} - Array of tags
   */
  extractTags(content) {
    const tagRegex = /\[#([^\]]+)\]\([^)]*\)/g;
    const tags = [];
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1].trim());
    }

    return tags;
  }
}
