import React, { useContext, useEffect, useRef } from "react";
import p5 from "p5";
import { SocketContext } from "../SocketContext";

interface Props {
  color: string;
}

interface SocketDrawing {
  color: string;
  strokeWidth: number;
  px: number;
  py: number;
  y: number;
  x: number;
}

const SketchPad: React.FC<Props> = ({ color }) => {
  const socket = useContext(SocketContext);
  const divRef = useRef<HTMLDivElement>();
  const colorRef = useRef<string>();
  const boardRef: React.MutableRefObject<p5> = React.useRef();
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
    if (socket) {
      // Prevents glitch where multiple canvasses appear
      if (boardRef.current) {
        boardRef.current.remove();
      }

      boardRef.current = new p5((sketch: p5) => {
        sketch.setup = () => {
          sketch.createCanvas(
            window.window.innerWidth,
            window.window.innerHeight
          );
        };

        socket.on("draw", (data: SocketDrawing) => {
          sketch.stroke(data.color);
          sketch.strokeWeight(data.strokeWidth);

          sketch.line(data.px, data.py, data.x, data.y);
        });
      }, divRef.current);
    }
    return () => {
      if (socket) {
        socket.off("draw");
      }
    };
  }, [socket, divRef]);

  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.mouseDragged = (event: MouseEvent) => {
        const { offsetX, offsetY, movementX, movementY } = event;
        sendDrawing(offsetX, offsetY, offsetX - movementX, offsetY - movementY);
      };
    }
  });

  return (
    <div ref={divRef}>
      <button onClick={() => boardRef.current.save("drawing.jpg")}>Save</button>
    </div>
  );
};

export default SketchPad;
