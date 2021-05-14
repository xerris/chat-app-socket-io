import React, { useContext, useEffect, useState } from "react";
import p5 from "p5";
import { SocketContext } from "../SocketContext";

interface Props {
  color: string;
}

const SketchPad: React.FC<Props> = ({ color }) => {
  const socket = useContext(SocketContext);
  const divRef = React.useRef<any>();
  const colorRef = React.useRef<any>();

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  const sendDrawing = (x, y, pX, pY) => {
    const data = {
      x: x,
      y: y,
      px: pX,
      py: pY,
      color: colorRef.current,
      strokeWidth: 5
    };

    if (socket) {
      socket.emit("draw", data);
    }
  };

  useEffect(() => {
    let p5Obj;
    if (socket && divRef.current) {
      p5Obj = new p5((sketch) => {
        sketch.setup = () => {
          sketch.createCanvas(1000, 500);
        };

        sketch.mouseDragged = (event: any) => {
          const { offsetX, offsetY, movementX, movementY } = event;
          sendDrawing(
            offsetX,
            offsetY,
            offsetX - movementX,
            offsetY - movementY
          );
        };

        socket.on("draw", (data) => {
          sketch.stroke(data.color);
          sketch.color(data.color);
          sketch.strokeWeight(data.strokeWidth);
          sketch.line(data.px, data.py, data.x, data.y);
        });
      }, divRef.current);
    }
    return p5Obj;
  }, [socket, divRef]);

  useEffect(() => {
    console.log(color);
  }, [color]);
  return <div ref={divRef}></div>;
};

export default SketchPad;
