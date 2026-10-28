// Real AIWANNA IDs. Every finished run submits to its mode's board; best per player.
export const leaderboardConfig = {
 origin:'https://www.aiwanna.games',
 origins:['https://www.aiwanna.games','https://aiwanna.games','https://www.ai-made.games','https://ai-made.games','https://1gp-game-platform.vercel.app'],
 gameId:'d0fc278e-74f8-4237-8818-bc245259e602',gameSlug:'c3dc0fddf4a7ca4a8ad99616373026e9-e32d976e',boards:{adventure:'eb6bf9d7-29c8-4c57-9d5b-cb12d57a0815',endless:'0554a813-ccab-45e9-9437-3a303b27cb5e'},minScore:1,maxScore:1000000000,
};
export const boardDefinitions = [
 {key:'adventure-score-v1',name:'秘藏探险 · Adventure',
  description:'秘藏探险单局最终得分（含寻宝后的无尽冲分），分高者排前。Final score of one Adventure run, including the endless stage after the hunts. Higher is better.',
  order:'desc',unit:'points',minScore:1,maxScore:1000000000,minPlayMs:0},
 {key:'classic-score-v1',name:'经典模式 · Classic',
  description:'经典模式单局最高得分，分高者排前。Best score from one Classic-mode run. Higher is better.',
  order:'desc',unit:'points',minScore:1,maxScore:1000000000,minPlayMs:0},
];
