import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

const KEYWORDS = [
  { text: 'User Research', green: true },
  { text: 'Component', green: false },
  { text: 'Desk Research', green: true },
  { text: 'Typography', green: false },
  { text: 'Pain Point', green: true },
  { text: 'Prototype', green: false },
  { text: 'IA', green: true },
  { text: 'Interaction', green: false },
  { text: 'Site Map', green: true },
  { text: 'Design System', green: false },
  { text: 'User Flow', green: true },
  { text: 'Accessibility', green: false },
  { text: 'Wireframe', green: true },
  { text: 'Retrospective', green: false },
  { text: 'Goal Setting', green: true }, // ← 중복 제거
  { text: 'Feedback', green: false },
];

const CARD_H = 54;
const CARD_PAD_X = 30;
const RADIUS = 12;

function measureWidth(text) {
  const tmp = document.createElement('span');
  tmp.style.cssText = `
    position: absolute;
    visibility: hidden;
    white-space: nowrap;
    font-size: 20px;
    font-weight: 500;
    font-family: 'GmarketSans', sans-serif;
  `;
  tmp.textContent = text;
  document.body.appendChild(tmp);
  const w = tmp.offsetWidth + CARD_PAD_X * 2;
  document.body.removeChild(tmp);
  return Math.max(w, 80);
}

export default function PhysicsCards() {
  const wrapRef = useRef(null);
  const initializedRef = useRef(false); // StrictMode 이중 실행 방지

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (initializedRef.current) return; // 이미 실행됐으면 스킵
    initializedRef.current = true;

    document.fonts.ready.then(() => {
      const W = wrap.offsetWidth;
      const H = wrap.offsetHeight;

      const {
        Engine,
        Render,
        Runner,
        Bodies,
        Body,
        Composite,
        Mouse,
        MouseConstraint,
        Events,
      } = Matter;

      const engine = Engine.create({ gravity: { x: 0, y: 1.4 } });

      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas);

      const render = Render.create({
        canvas,
        engine,
        options: {
          width: W,
          height: H,
          wireframes: false,
          background: 'transparent',
          pixelRatio: window.devicePixelRatio || 1,
        },
      });

      const labelLayer = document.createElement('div');
      labelLayer.style.cssText = `
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
      `;
      wrap.appendChild(labelLayer);

      const chips = KEYWORDS.map(({ text, green }, i) => {
        const cardW = measureWidth(text);
        const x = cardW / 2 + 20 + Math.random() * (W - cardW - 40);
        const y = -CARD_H - i * (30 + Math.random() * 60);
        const angle = (Math.random() - 0.5) * 0.6;

        const body = Bodies.rectangle(x, y, cardW, CARD_H, {
          restitution: 0.2,
          friction: 0.6,
          frictionAir: 0.02,
          chamfer: { radius: RADIUS },
          render: {
            fillStyle: green ? '#D3F27E' : '#FFFFFF',
            strokeStyle: green ? '#D3F27E' : '#BDAFFF',
            lineWidth: green ? 0 : 1.5,
          },
        });
        Body.setAngle(body, angle);
        Composite.add(engine.world, body);

        const el = document.createElement('div');
        el.textContent = text;
        el.style.cssText = `
          position: absolute;
          padding: 0 ${CARD_PAD_X}px;
          height: ${CARD_H}px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: ${RADIUS}px;
          font-size: 20px;
          font-weight: 500;
          font-family: 'GmarketSans', sans-serif;
          white-space: nowrap;
          pointer-events: none;
          box-sizing: content-box;
          background: ${green ? '#D3F27E' : '#FFFFFF'};
          border: ${green ? 'none' : '1.5px solid #BDAFFF'};
          color: #111111;
          z-index: ${i};
        `;
        labelLayer.appendChild(el);

        return { body, el };
      });

      // 벽 + 바닥
      const ground = Bodies.rectangle(W / 2, H + 25, W * 2, 50, {
        isStatic: true,
        render: { visible: false },
      });
      const wallL = Bodies.rectangle(-25, H / 2, 50, H * 2, {
        isStatic: true,
        render: { visible: false },
      });
      const wallR = Bodies.rectangle(W + 25, H / 2, 50, H * 2, {
        isStatic: true,
        render: { visible: false },
      });
      Composite.add(engine.world, [ground, wallL, wallR]);

      // 물리 미리 돌리기
      const delta = 1000 / 60;
      for (let i = 0; i < 500; i++) {
        Engine.update(engine, delta);
      }

      // 마우스 드래그
      const mouse = Mouse.create(wrap);
      mouse.pixelRatio = window.devicePixelRatio || 1;

      const mConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      });
      Composite.add(engine.world, mConstraint);
      render.mouse = mouse;

      Events.on(mConstraint, 'startdrag', ({ body }) => {
        const chip = chips.find((c) => c.body === body);
        if (chip) chip.el.style.zIndex = 999;
      });
      Events.on(mConstraint, 'enddrag', ({ body }) => {
        const idx = chips.findIndex((c) => c.body === body);
        if (idx !== -1) chips[idx].el.style.zIndex = idx;
      });

      Events.on(render, 'afterRender', () => {
        chips.forEach(({ body, el }) => {
          el.style.left = `${body.position.x}px`;
          el.style.top = `${body.position.y}px`;
          el.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
        });
      });

      Render.run(render);
      const runner = Runner.create();
      Runner.run(runner, engine);

      wrap._cleanup = () => {
        Render.stop(render);
        Runner.stop(runner);
        Matter.World.clear(engine.world);
        Matter.Engine.clear(engine);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        if (labelLayer.parentNode)
          labelLayer.parentNode.removeChild(labelLayer);
        initializedRef.current = false;
      };
    });

    return () => {
      if (wrapRef.current?._cleanup) wrapRef.current._cleanup();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        overflow: 'hidden',
        cursor: 'grab',
      }}
    />
  );
}
