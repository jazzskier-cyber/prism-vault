// Real AIWANNA IDs. Only pure classic runs submit: one score per finished run, best per player.
export const leaderboardConfig = {
 origin:'https://www.aiwanna.games',
 origins:['https://www.aiwanna.games','https://aiwanna.games','https://www.ai-made.games','https://ai-made.games','https://1gp-game-platform.vercel.app'],
 gameId:'d0fc278e-74f8-4237-8818-bc245259e602',gameSlug:'c3dc0fddf4a7ca4a8ad99616373026e9-e32d976e',boards:{endless:'0554a813-ccab-45e9-9437-3a303b27cb5e'},minScore:1,maxScore:1000000000,
};
export const boardDefinition = {
 key:'classic-score-v1',name:'经典模式 · 最高分',
 description:'单局经典模式（纯经典，不含秘藏探险）的最高得分，分高者排前。',
 order:'desc',unit:'points',minScore:1,maxScore:1000000000,minPlayMs:0,
};
