import React, { useEffect, useRef, useContext } from "react";
import p5 from "p5";
import { AppContext } from "../AppContext";

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
  const { socket } = useContext(AppContext);

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
          try {
            sketch.stroke(data.color);
            sketch.strokeWeight(data.strokeWidth);
            sketch.line(data.px, data.py, data.x, data.y);
          } catch (error) {
            // Prevents crashing on inital draw data
            console.log("error drawing", error);
          }
        });

        socket.on("clearBoard", () => boardRef.current.clear());
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
        // Drawings only sent if drag on canvas
        if (String(event.target) === "[object HTMLCanvasElement]") {
          const { offsetX, offsetY, movementX, movementY } = event;
          sendDrawing(
            offsetX,
            offsetY,
            offsetX - movementX,
            offsetY - movementY
          );
        }
      };
    }
  });

  return (
    <div ref={divRef}>
      <button onClick={() => boardRef.current.save("drawing.jpg")}>Save</button>
      <button
        onClick={() => {
          boardRef.current.clear();
          socket.emit("clearBoard");
        }}
      >
        Clear Board
      </button>
    </div>
  );
};

export default SketchPad;
