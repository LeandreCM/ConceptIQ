export interface MiniGameChallenge {
  prompt: string;
  stimulus?: string[];
  options: string[];
  answerIndex: number;
  explanation: string;
}

export const cognitiveGameChallenges: Record<string, MiniGameChallenge[]> = {
  "fact-recall": [
    {
      prompt: "Study the facts: Nova is blue. Luma is green. Kiro is red. Which color is Luma?",
      options: ["Blue", "Green", "Red", "Yellow"],
      answerIndex: 1,
      explanation: "Luma was paired with green.",
    },
    {
      prompt: "Study the pairings: Atlas-7, Beacon-3, Cipher-9. What number belongs to Cipher?",
      options: ["3", "7", "9", "12"],
      answerIndex: 2,
      explanation: "Cipher was paired with 9.",
    },
  ],
  "process-order": [
    {
      prompt: "Put the process in order: gather data, decide, test, adjust.",
      options: ["Gather, test, decide, adjust", "Gather, decide, test, adjust", "Test, gather, decide, adjust", "Decide, gather, adjust, test"],
      answerIndex: 1,
      explanation: "The intended sequence is gather, decide, test, adjust.",
    },
    {
      prompt: "Which order correctly makes tea?",
      options: ["Pour, boil, steep, add tea", "Boil, add tea, pour, steep", "Boil, pour, steep, serve", "Steep, boil, pour, serve"],
      answerIndex: 2,
      explanation: "Water is boiled before pouring and steeping.",
    },
  ],
  "rule-recall": [
    {
      prompt: "Rule: if the symbol is a star, choose the opposite color. Star is shown with blue. What should you choose?",
      options: ["Blue", "Green", "Red", "Opposite color"],
      answerIndex: 3,
      explanation: "The star rule says to choose the opposite color.",
    },
    {
      prompt: "Rule: double even numbers, add 1 to odd numbers. What happens to 6?",
      options: ["7", "12", "5", "3"],
      answerIndex: 1,
      explanation: "6 is even, so it doubles to 12.",
    },
  ],
  "flash-addition": [
    {
      prompt: "Flash total: add the numbers in order.",
      stimulus: ["7", "4", "8"],
      options: ["17", "18", "19", "20"],
      answerIndex: 2,
      explanation: "7 + 4 + 8 = 19.",
    },
    {
      prompt: "Flash total: add the numbers in order.",
      stimulus: ["6", "9", "5", "3"],
      options: ["21", "22", "23", "24"],
      answerIndex: 2,
      explanation: "6 + 9 + 5 + 3 = 23.",
    },
  ],
  "hold-the-rule": [
    {
      prompt: "Rule: choose HIGH for numbers above 5 and LOW for 5 or below. What is 8?",
      options: ["Low", "High", "Switch", "Ignore"],
      answerIndex: 1,
      explanation: "8 is above 5, so the answer is HIGH.",
    },
    {
      prompt: "New rule: choose SAME if both symbols match. What about triangle and triangle?",
      options: ["Same", "Different", "Skip", "Opposite"],
      answerIndex: 0,
      explanation: "The symbols match.",
    },
  ],
  "shape-rotation": [
    {
      prompt: "A shape points up. After a 90 degree clockwise rotation, where does it point?",
      options: ["Up", "Right", "Down", "Left"],
      answerIndex: 1,
      explanation: "A clockwise quarter turn moves up to right.",
    },
    {
      prompt: "A shape points left. After a 180 degree rotation, where does it point?",
      options: ["Up", "Right", "Down", "Left"],
      answerIndex: 1,
      explanation: "A half turn changes left to right.",
    },
  ],
  "shape-transformation": [
    {
      prompt: "Transform: add one side to a triangle. What shape do you get?",
      options: ["Line", "Triangle", "Square", "Pentagon"],
      answerIndex: 2,
      explanation: "A triangle with one added side becomes a four-sided shape.",
    },
    {
      prompt: "Transform: mirror the letter b horizontally. Which letter is closest?",
      options: ["b", "d", "p", "q"],
      answerIndex: 1,
      explanation: "A horizontal mirror of b looks like d.",
    },
  ],
  "spatial-recall": [
    {
      prompt: "Remember the lit cells: top-left, center, bottom-right. Which pattern matches?",
      options: ["Diagonal down", "Top row", "Middle column", "Corners only"],
      answerIndex: 0,
      explanation: "Those cells form a diagonal from top-left to bottom-right.",
    },
    {
      prompt: "A dot appears in row 2, column 3. Which location is correct?",
      options: ["Top left", "Middle right", "Bottom center", "Top right"],
      answerIndex: 1,
      explanation: "Row 2, column 3 is the middle-right cell in a 3 by 3 grid.",
    },
  ],
  "if-a-then-b": [
    {
      prompt: "If A then B. A is true. What follows?",
      options: ["B is true", "B is false", "A is false", "Nothing can follow"],
      answerIndex: 0,
      explanation: "With A true, the rule implies B.",
    },
    {
      prompt: "If it rains, the ground gets wet. The ground is dry. What can you infer?",
      options: ["It rained", "It did not rain", "The rule is false", "It is snowing"],
      answerIndex: 1,
      explanation: "If rain always makes it wet, dry ground rules out rain.",
    },
  ],
  "logic-word-problems": [
    {
      prompt: "Mia is taller than Leo. Leo is taller than Sam. Who is tallest?",
      options: ["Mia", "Leo", "Sam", "Cannot tell"],
      answerIndex: 0,
      explanation: "Mia is above Leo, and Leo is above Sam.",
    },
    {
      prompt: "Only coders can enter Lab A. Dana entered Lab A. What must be true?",
      options: ["Dana is a coder", "Dana is not a coder", "Lab A is closed", "Anyone can enter"],
      answerIndex: 0,
      explanation: "Entry requires being a coder.",
    },
  ],
  "contradiction-finder": [
    {
      prompt: "Find the contradiction: all tokens are red. One token is blue.",
      options: ["All tokens are red", "One token is blue", "Both cannot be true", "No contradiction"],
      answerIndex: 2,
      explanation: "A blue token contradicts all tokens being red.",
    },
    {
      prompt: "Find the contradiction: Kai is before Nia. Nia is before Omar. Omar is before Kai.",
      options: ["Kai before Nia", "Nia before Omar", "Omar before Kai", "The cycle contradicts itself"],
      answerIndex: 3,
      explanation: "The ordering loops back on itself.",
    },
  ],
  "distraction-task": [
    {
      prompt: "Target is the word GREEN, ignore ink color. The word GREEN appears in red ink. Choose the target word.",
      options: ["Red", "Green", "Blue", "Yellow"],
      answerIndex: 1,
      explanation: "The word matters, not the ink color.",
    },
    {
      prompt: "Tap the center item only: left star, center circle, right star.",
      options: ["Left star", "Center circle", "Right star", "Both stars"],
      answerIndex: 1,
      explanation: "The instruction asks for the center item.",
    },
  ],
  "target-filter": [
    {
      prompt: "Target: odd numbers only. Which item is a target?",
      options: ["4", "8", "9", "12"],
      answerIndex: 2,
      explanation: "9 is odd.",
    },
    {
      prompt: "Target: rounded letters. Which letter fits?",
      options: ["A", "T", "O", "K"],
      answerIndex: 2,
      explanation: "O is rounded.",
    },
  ],
  "ignore-the-decoy": [
    {
      prompt: "Choose the smaller number, ignore the brighter label: 8 or 3.",
      options: ["8", "3", "Both", "Neither"],
      answerIndex: 1,
      explanation: "3 is smaller.",
    },
    {
      prompt: "Choose the shape, ignore the word. Word says SQUARE, shape shown is circle.",
      options: ["Square", "Circle", "Triangle", "Text"],
      answerIndex: 1,
      explanation: "The shape is circle.",
    },
  ],
  "symbol-match": [
    {
      prompt: "Target symbol is #. Which option matches?",
      options: ["%", "#", "&", "@"],
      answerIndex: 1,
      explanation: "The matching symbol is #.",
    },
    {
      prompt: "Target pair is AX. Which pair matches exactly?",
      options: ["XA", "AX", "AA", "XX"],
      answerIndex: 1,
      explanation: "AX matches exactly.",
    },
  ],
  "fast-sort": [
    {
      prompt: "Sort quickly: apple belongs in which category?",
      options: ["Tool", "Fruit", "Vehicle", "Shape"],
      answerIndex: 1,
      explanation: "Apple is a fruit.",
    },
    {
      prompt: "Sort quickly: hexagon belongs in which category?",
      options: ["Number", "Animal", "Shape", "Color"],
      answerIndex: 2,
      explanation: "A hexagon is a shape.",
    },
  ],
  "number-sequence": [
    {
      prompt: "What comes next: 3, 6, 12, 24, ?",
      options: ["30", "36", "42", "48"],
      answerIndex: 3,
      explanation: "Each number doubles.",
    },
    {
      prompt: "What comes next: 5, 9, 13, 17, ?",
      options: ["19", "20", "21", "22"],
      answerIndex: 2,
      explanation: "The pattern adds 4.",
    },
  ],
  "pattern-matrix": [
    {
      prompt: "Matrix rule: each row gains one dot. Row 1 has 1, row 2 has 2. Row 3 has?",
      options: ["1", "2", "3", "4"],
      answerIndex: 2,
      explanation: "The count increases by one each row.",
    },
    {
      prompt: "Matrix rule: circle becomes square across each row. What follows circle?",
      options: ["Circle", "Square", "Triangle", "Line"],
      answerIndex: 1,
      explanation: "The row transformation changes circle to square.",
    },
  ],
  "short-reading-test": [
    {
      prompt: "Passage: The rover paused because its battery was low. Why did it pause?",
      options: ["Dust", "Battery was low", "Lost signal", "Reached base"],
      answerIndex: 1,
      explanation: "The passage directly names the low battery.",
    },
    {
      prompt: "Passage: Jae chose the quiet route to avoid traffic. What was Jae avoiding?",
      options: ["Rain", "Traffic", "Noise", "A toll"],
      answerIndex: 1,
      explanation: "The route was chosen to avoid traffic.",
    },
  ],
  "word-analogy": [
    {
      prompt: "Hand is to glove as foot is to...",
      options: ["Hat", "Sock", "Ring", "Coat"],
      answerIndex: 1,
      explanation: "A sock covers a foot like a glove covers a hand.",
    },
    {
      prompt: "Bird is to nest as person is to...",
      options: ["Home", "Wing", "Tree", "Feather"],
      answerIndex: 0,
      explanation: "A home is the living place for a person.",
    },
  ],
  "follow-instructions": [
    {
      prompt: "Choose the second option unless it is blue. The second option is green.",
      options: ["First", "Second", "Third", "Fourth"],
      answerIndex: 1,
      explanation: "The second option is not blue, so choose it.",
    },
    {
      prompt: "Choose the larger number, then subtract 2 mentally: 6 and 9.",
      options: ["4", "7", "9", "11"],
      answerIndex: 1,
      explanation: "The larger number is 9, and 9 - 2 = 7.",
    },
  ],
  "mental-math": [
    {
      prompt: "Solve: 18 + 27",
      options: ["35", "45", "47", "54"],
      answerIndex: 1,
      explanation: "18 + 27 = 45.",
    },
    {
      prompt: "Solve: 9 x 6",
      options: ["42", "48", "54", "63"],
      answerIndex: 2,
      explanation: "9 x 6 = 54.",
    },
  ],
  "estimate-it": [
    {
      prompt: "Estimate 49 x 21. Which is closest?",
      options: ["500", "800", "1000", "1500"],
      answerIndex: 2,
      explanation: "49 x 21 is close to 50 x 20 = 1000.",
    },
    {
      prompt: "Estimate 198 divided by 4. Which is closest?",
      options: ["25", "50", "75", "100"],
      answerIndex: 1,
      explanation: "200 divided by 4 is 50.",
    },
  ],
  "ratio-problems": [
    {
      prompt: "A mix has 2 red for every 3 blue. If red is 4, blue is...",
      options: ["3", "4", "6", "8"],
      answerIndex: 2,
      explanation: "Doubling 2 red to 4 red doubles 3 blue to 6 blue.",
    },
    {
      prompt: "If 5 tickets cost 20, what do 2 tickets cost?",
      options: ["4", "8", "10", "12"],
      answerIndex: 1,
      explanation: "Each ticket costs 4, so 2 cost 8.",
    },
  ],
  "cause-chain": [
    {
      prompt: "Order the chain: rain, wet roads, slower traffic.",
      options: ["Rain, wet roads, slower traffic", "Wet roads, rain, slower traffic", "Traffic, rain, wet roads", "Rain, traffic, wet roads"],
      answerIndex: 0,
      explanation: "Rain causes wet roads, which can slow traffic.",
    },
    {
      prompt: "What is the likely effect of reducing supply while demand stays high?",
      options: ["Lower price", "Higher price", "No change", "Less demand always"],
      answerIndex: 1,
      explanation: "Lower supply with high demand tends to raise price.",
    },
  ],
  "feedback-loop": [
    {
      prompt: "More practice improves skill, which makes practice feel easier. What loop is this?",
      options: ["Balancing", "Reinforcing", "Random", "Contradictory"],
      answerIndex: 1,
      explanation: "Improvement encourages more practice, reinforcing the loop.",
    },
    {
      prompt: "A thermostat turns heat off when the room gets warm. What loop is this?",
      options: ["Reinforcing", "Balancing", "Runaway", "None"],
      answerIndex: 1,
      explanation: "The system counteracts temperature change.",
    },
  ],
  "optimize-the-system": [
    {
      prompt: "A checkout line is slow because payment takes longest. What should you optimize first?",
      options: ["Entrance sign", "Payment step", "Receipt color", "Floor tiles"],
      answerIndex: 1,
      explanation: "The bottleneck is payment.",
    },
    {
      prompt: "A study plan fails because review is missing. Best improvement?",
      options: ["Longer breaks only", "Add spaced review", "Use smaller font", "Skip practice"],
      answerIndex: 1,
      explanation: "Spaced review fixes the missing feedback step.",
    },
  ],
};

const registryGameChallenges: Record<string, MiniGameChallenge[]> = {
  "distraction-filter": [
    {
      prompt: "Target is the word BLUE. Ignore the ink color. The word BLUE appears in green ink. What is the target?",
      options: ["Green", "Blue", "Ink", "Neither"],
      answerIndex: 1,
      explanation: "The word is the target, not the ink color.",
    },
    {
      prompt: "Choose the center item only: left square, center star, right star.",
      options: ["Left square", "Center star", "Right star", "Both stars"],
      answerIndex: 1,
      explanation: "The instruction asks for the center item.",
    },
  ],
  "flash-numbers": [
    {
      prompt: "Flash total: add each number as it appears.",
      stimulus: ["7", "4", "8"],
      options: ["17", "18", "19", "20"],
      answerIndex: 2,
      explanation: "7 + 4 + 8 = 19.",
    },
    {
      prompt: "Flash total: add each number as it appears.",
      stimulus: ["6", "9", "5", "3"],
      options: ["21", "22", "23", "24"],
      answerIndex: 2,
      explanation: "6 + 9 + 5 + 3 = 23.",
    },
  ],
  "symbol-accuracy": [
    {
      prompt: "Target pair is AX. Which option matches exactly?",
      options: ["XA", "AX", "AA", "XX"],
      answerIndex: 1,
      explanation: "AX matches the target exactly.",
    },
    {
      prompt: "Target sign is -7. Which option matches the sign and number?",
      options: ["7", "-7", "+7", "-1"],
      answerIndex: 1,
      explanation: "The negative sign is part of the target.",
    },
  ],
  "change-detection": [
    {
      prompt: "Display changed from dot in center to dot in upper-right. What changed?",
      options: ["Color changed", "Dot moved upper-right", "Dot disappeared", "Size doubled"],
      answerIndex: 1,
      explanation: "The dot moved from center to upper-right.",
    },
    {
      prompt: "First pattern: triangle, circle, square. Second pattern: triangle, star, square. What changed?",
      options: ["First item", "Middle item", "Last item", "No change"],
      answerIndex: 1,
      explanation: "The middle item changed from circle to star.",
    },
  ],
  "sequence-builder": [
    {
      prompt: "What comes next: 4, 8, 16, 32, ?",
      options: ["36", "48", "64", "72"],
      answerIndex: 2,
      explanation: "Each number doubles.",
    },
    {
      prompt: "What comes next: A, C, F, J, ?",
      options: ["K", "M", "N", "O"],
      answerIndex: 3,
      explanation: "The jumps grow by one: +2, +3, +4, then +5.",
    },
  ],
  "mental-folding": [
    {
      prompt: "Mirror the letter b horizontally. Which letter is closest?",
      options: ["b", "d", "p", "q"],
      answerIndex: 1,
      explanation: "A horizontal mirror of b looks like d.",
    },
    {
      prompt: "Fold a square in half vertically. Which edges meet?",
      options: ["Top and bottom", "Left and right", "All corners only", "No edges"],
      answerIndex: 1,
      explanation: "A vertical fold brings left and right edges together.",
    },
  ],
  "vocabulary-builder": [
    {
      prompt: "Hand is to glove as foot is to...",
      options: ["Hat", "Sock", "Ring", "Coat"],
      answerIndex: 1,
      explanation: "A sock covers a foot like a glove covers a hand.",
    },
    {
      prompt: "Choose the closest meaning of concise.",
      options: ["Brief", "Angry", "Heavy", "Colorful"],
      answerIndex: 0,
      explanation: "Concise means brief and to the point.",
    },
  ],
  "concept-matching": [
    {
      prompt: "Bird is to nest as person is to...",
      options: ["Home", "Wing", "Tree", "Feather"],
      answerIndex: 0,
      explanation: "A home is a living place for a person.",
    },
    {
      prompt: "Which item belongs with hammer, wrench, and screwdriver?",
      options: ["Apple", "Pliers", "Cloud", "Triangle"],
      answerIndex: 1,
      explanation: "Pliers are a tool like the others.",
    },
  ],
  "if-then-logic": [
    {
      prompt: "If A then B. A is true. What follows?",
      options: ["B is true", "B is false", "A is false", "Nothing follows"],
      answerIndex: 0,
      explanation: "With A true, the rule implies B.",
    },
    {
      prompt: "If it rains, the ground gets wet. The ground is dry. What can you infer?",
      options: ["It rained", "It did not rain", "The rule is impossible", "It is snowing"],
      answerIndex: 1,
      explanation: "Dry ground rules out rain under the stated rule.",
    },
  ],
  "deduction-challenge": [
    {
      prompt: "Mia is taller than Leo. Leo is taller than Sam. Who is tallest?",
      options: ["Mia", "Leo", "Sam", "Cannot tell"],
      answerIndex: 0,
      explanation: "Mia is taller than Leo, and Leo is taller than Sam.",
    },
    {
      prompt: "Only members can enter Lab A. Dana entered Lab A. What must be true?",
      options: ["Dana is a member", "Dana is not a member", "Lab A is closed", "Anyone can enter"],
      answerIndex: 0,
      explanation: "Entry requires membership.",
    },
  ],
  "cause-effect-analyzer": [
    {
      prompt: "Order the chain: rain, wet roads, slower traffic.",
      options: ["Rain, wet roads, slower traffic", "Wet roads, rain, slower traffic", "Traffic, rain, wet roads", "Rain, traffic, wet roads"],
      answerIndex: 0,
      explanation: "Rain causes wet roads, which can slow traffic.",
    },
    {
      prompt: "What is the likely effect of reducing supply while demand stays high?",
      options: ["Lower price", "Higher price", "No change", "Less demand always"],
      answerIndex: 1,
      explanation: "Lower supply with high demand tends to raise price.",
    },
  ],
  "system-prediction": [
    {
      prompt: "More practice improves skill, which makes practice feel easier. What loop is this?",
      options: ["Balancing", "Reinforcing", "Random", "Contradictory"],
      answerIndex: 1,
      explanation: "Improvement encourages more practice, reinforcing the loop.",
    },
    {
      prompt: "A thermostat turns heat off when the room gets warm. What loop is this?",
      options: ["Reinforcing", "Balancing", "Runaway", "None"],
      answerIndex: 1,
      explanation: "The system counteracts temperature change.",
    },
  ],
  "memory-retention": [
    {
      prompt: "Study the facts: Nova is blue. Luma is green. Kiro is red. Which color is Luma?",
      options: ["Blue", "Green", "Red", "Yellow"],
      answerIndex: 1,
      explanation: "Luma was paired with green.",
    },
    {
      prompt: "Study the pairings: Atlas-7, Beacon-3, Cipher-9. What number belongs to Cipher?",
      options: ["3", "7", "9", "12"],
      answerIndex: 2,
      explanation: "Cipher was paired with 9.",
    },
  ],
  "concept-linking": [
    {
      prompt: "Practice improves skill, and skill makes practice easier. Which concept fits?",
      options: ["Contradiction", "Reinforcing loop", "Random walk", "Definition"],
      answerIndex: 1,
      explanation: "The two variables strengthen each other.",
    },
    {
      prompt: "A learned rule is used in a new problem. What is that called?",
      options: ["Transfer", "Forgetting", "Guessing", "Noise"],
      answerIndex: 0,
      explanation: "Applying knowledge in a new context is transfer.",
    },
  ],
  "task-planner": [
    {
      prompt: "Put the process in order: gather data, decide, test, adjust.",
      options: ["Gather, test, decide, adjust", "Gather, decide, test, adjust", "Test, gather, decide, adjust", "Decide, gather, adjust, test"],
      answerIndex: 1,
      explanation: "The useful sequence is gather, decide, test, adjust.",
    },
    {
      prompt: "A checkout line is slow because payment takes longest. What should you optimize first?",
      options: ["Entrance sign", "Payment step", "Receipt color", "Floor tiles"],
      answerIndex: 1,
      explanation: "The bottleneck is payment.",
    },
  ],
  "multi-step-execution": [
    {
      prompt: "Choose the second option unless it is blue. The second option is green.",
      options: ["First", "Second", "Third", "Fourth"],
      answerIndex: 1,
      explanation: "The second option is not blue, so choose it.",
    },
    {
      prompt: "Choose the larger number, then subtract 2 mentally: 6 and 9.",
      options: ["4", "7", "9", "11"],
      answerIndex: 1,
      explanation: "The larger number is 9, and 9 - 2 = 7.",
    },
  ],
};

export function getMiniGameChallenges(gameId: string) {
  return cognitiveGameChallenges[gameId] ?? registryGameChallenges[gameId] ?? [
    {
      prompt: "Choose the option that best fits the rule for this challenge.",
      options: ["First option", "Best fit", "Distractor", "Unrelated"],
      answerIndex: 1,
      explanation: "This fallback checks the same core skill with a simple rule.",
    },
  ];
}
