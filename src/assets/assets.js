export const assets =[
  {
    id: 1,
    type: "image",
    src: ["./images/star_01.png"],
    tiltFlag: true,
    anim: [
      {
        index: 1,
        pos: { x: 0, y: 0 },
        rot: 0,
        scale: { x: 1, y: 1 },
        time: 0.0
      },
      {
        index: 2,
        pos: { x: -100, y: 100 },
        rot: 360,
        scale: { x: 1, y: 1 },
        time: 0.5
      },
      {
        index: 3,
        pos: { x: -100, y: 200 },
        rot: 180,
        scale: { x: 1, y: 1 },
        time: 1.0
      },
      {
        index: 4,
        pos: { x: 100, y: 0 },
        rot: 200,
        scale: { x: 1, y: 1 },
        time: 1.5
      },
      {
        index: 5,
        pos: { x: -100, y: -200 },
        rot: 360,
        scale: { x: 1, y: 1 },
        time: 2.0
      },
      {
        index: 6,
        pos: { x: 0, y: 100 },
        rot: 180,
        scale: { x: 1, y: 1 },
        time: 2.5
      },
      {
        index: 7,
        pos: { x: 0, y: 0 },
        rot: 0,
        scale: { x: 1, y: 1 },
        time: 3.0
      }
    ]
  },
  {
    id: 2,
    type: "ani",
    src: ["./images/arrow_left.png"],
    tiltFlag: true,
    anim: [
      {
        index: 1,
        pos: { x: 0, y: 0 },
        rot: 0,
        scale: { x: 1, y: 1 },
        time: 0.0
      },
      {
        index: 2,
        pos: { x: 10, y: 0 },
        rot: 45,
        scale: { x: 1, y: 1 },
        time: 0.5
      },
      {
        index: 3,
        pos: { x: 80, y: 0 },
        rot: 90,
        scale: { x: 1, y: 1 },
        time: 1.0
      },
      {
        index: 4,
        pos: { x: 90, y: 0 },
        rot: 95,
        scale: { x: 1, y: 1 },
        time: 1.5
      }
    ]
  },
  {
    id: 3,
    type: "ani",
    src: ["./images/arrow_left.png"],
    tiltFlag: false,
    anim: [
      {
        index: 1,
        pos: { x: 0, y: 0 },
        rot: 0,
        scale: { x: 1, y: 1 },
        time: 0.0
      }
    ]
  }
];