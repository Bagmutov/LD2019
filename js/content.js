export let MAP = [
    { word: "star", creates: ["light", "heat"] },
    { word: "height", creates: ["fear"], deletes: ["light"] },
    { word: "feast", creates: ["fiery"], deletes: ["fear", "height"] },
    { word: "fiesta", creates: ["cactus"], clearStage: true },
    { word: "status", creates: ["ego"], deletes: ["fiesta", "cactus"] },
    { word: "statue", creates: ["pigeon"], deletes: ["status"] },
];
//# sourceMappingURL=content.js.map