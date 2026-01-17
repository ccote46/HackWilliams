"use client";

import { useEffect, useRef } from 'react';

//used from repo AmbientCanvasBgs by crnacura
//Small changes made for react compatability & color pallette


export default function ShiftCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;


    const circleCount = 150;
    const circlePropCount = 8;
    const circlePropsLength = circleCount * circlePropCount;
    const baseSpeed = 0.1;
    const rangeSpeed = 1;
    const baseTTL = 150;
    const rangeTTL = 200;
    const baseRadius = 100;
    const rangeRadius = 200;
    const backgroundColor = 'hsla(0,0%,5%,0.1)';


    const colorRanges = [
      { base: 180, range: 30 },  // Teal
      { base: 240, range: 30 },  // Blue 
      { base: 280, range: 40 },  // Purple/Violet 
      { base: 140, range: 40 },  // Green 
    ];

    let canvas: any;
    let ctx: any;
    let circleProps: Float32Array;


    const rand = (n: number) => n * Math.random();
    const fadeInOut = (t: number, m: number) => {
      let hm = 0.5 * m;
      return Math.abs((t + hm) % m - hm) / hm;
    };
    const TAU = 2 * Math.PI;


    const simplex = {
      noise3D: (x: number, y: number, z: number) => Math.random() * 2 - 1
    };

    function createCanvas() {
      canvas = {
        a: document.createElement('canvas'),
        b: document.createElement('canvas')
      };
      canvas.b.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      `;
      containerRef.current?.appendChild(canvas.b);
      ctx = {
        a: canvas.a.getContext('2d'),
        b: canvas.b.getContext('2d')
      };
    }

    function resize() {
      const width = containerRef.current?.clientWidth || window.innerWidth;
      const height = containerRef.current?.clientHeight || window.innerHeight;
      
      canvas.a.width = width;
      canvas.a.height = height;
      ctx.a.drawImage(canvas.b, 0, 0);

      canvas.b.width = width;
      canvas.b.height = height;
      ctx.b.drawImage(canvas.a, 0, 0);
    }

    function initCircles() {
      circleProps = new Float32Array(circlePropsLength);

      for (let i = 0; i < circlePropsLength; i += circlePropCount) {
        initCircle(i);
      }
    }

    function getAuroraColor() {
      const colorRange = colorRanges[Math.floor(Math.random() * colorRanges.length)];
      return colorRange.base + rand(colorRange.range);
    }

    function initCircle(i: number) {
      const x = rand(canvas.a.width);
      const y = rand(canvas.a.height);
      const t = rand(TAU);
      const speed = baseSpeed + rand(rangeSpeed);
      const vx = speed * Math.cos(t);
      const vy = speed * Math.sin(t);
      const life = 0;
      const ttl = baseTTL + rand(rangeTTL);
      const radius = baseRadius + rand(rangeRadius);
      const hue = getAuroraColor(); // Use aurora colors

      circleProps.set([x, y, vx, vy, life, ttl, radius, hue], i);
    }

    function updateCircles() {
      for (let i = 0; i < circlePropsLength; i += circlePropCount) {
        updateCircle(i);
      }
    }

    function updateCircle(i: number) {
      const i2 = 1 + i, i3 = 2 + i, i4 = 3 + i, i5 = 4 + i, i6 = 5 + i, i7 = 6 + i, i8 = 7 + i;

      let x = circleProps[i];
      let y = circleProps[i2];
      const vx = circleProps[i3];
      const vy = circleProps[i4];
      let life = circleProps[i5];
      const ttl = circleProps[i6];
      const radius = circleProps[i7];
      const hue = circleProps[i8];

      drawCircle(x, y, life, ttl, radius, hue);

      life++;
      circleProps[i] = x + vx;
      circleProps[i2] = y + vy;
      circleProps[i5] = life;

      if (checkBounds(x, y, radius) || life > ttl) {
        initCircle(i);
      }
    }

    function drawCircle(x: number, y: number, life: number, ttl: number, radius: number, hue: number) {
      ctx.a.save();
      ctx.a.fillStyle = `hsla(${hue},70%,50%,${fadeInOut(life, ttl) * 0.4})`;
      ctx.a.beginPath();
      ctx.a.arc(x, y, radius, 0, TAU);
      ctx.a.fill();
      ctx.a.closePath();
      ctx.a.restore();
    }

    function checkBounds(x: number, y: number, radius: number) {
      return (
        x < -radius ||
        x > canvas.a.width + radius ||
        y < -radius ||
        y > canvas.a.height + radius
      );
    }

    function render() {
      ctx.b.save();
      ctx.b.filter = 'blur(50px)';
      ctx.b.drawImage(canvas.a, 0, 0);
      ctx.b.restore();
    }

    function draw() {
      ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);
      ctx.b.fillStyle = backgroundColor;
      ctx.b.fillRect(0, 0, canvas.b.width, canvas.b.height);
      updateCircles();
      render();
      requestAnimationFrame(draw);
    }

    function setup() {
      createCanvas();
      resize();
      initCircles();
      draw();
    }

    setup();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (canvas?.b?.parentNode) {
        canvas.b.parentNode.removeChild(canvas.b);
      }
    };
  }, []);

  return <div ref={containerRef} className="content--canvas absolute inset-0" />;
}