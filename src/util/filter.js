export const lowpath = (prev, next) => {
  return {
    x: prev.x * 0.8 + next.x * 0.2,
    y: prev.y * 0.8 + next.y * 0.2
  };
};
