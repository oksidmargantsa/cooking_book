const BG = ['#FFC83D', '#FFC2B0', '#CFF3C2', '#CBB9FF', '#FF9A6B', '#B6F23A'];
export const dishBg = (id: number) => BG[id % BG.length];
