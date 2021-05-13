import { useContext, useEffect, useState } from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import { SocketContext } from "../SocketContext";

interface Props {}

const SketchPad: React.FC<Props> = ({}) => {
  const socket = useContext(SocketContext);
  const [color, setColor] = useState("#1362b0");
  const [strokeWidth, setStrokeWidth] = useState(1);

  useEffect(() => {
    if (socket) {
      socket.emit("join", {
        username: "alex"
      });
    }
  }, [socket]);

  const sendMouse = (x, y, pX, pY) => {
    const data = {
      x: x,
      y: y,
      px: pX,
      py: pY,
      color,
      strokeWidth
    };

    if (socket) {
      socket.emit("mouse", data);
    }
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(1000, 500).parent(canvasParentRef);
    p5.mouseDragged = (event: any) => {
      const { offsetX, offsetY, movementX, movementY } = event;
      sendMouse(offsetX, offsetY, offsetX - movementX, offsetY - movementY);
    };
  };

  const draw = (p5: p5Types) => {
    if (socket) {
      socket.on("mouse", (data) => {
        p5.stroke(data.color);
        p5.strokeWeight(data.strokeWidth);
        p5.line(data.px, data.py, data.x, data.y);
      });
    }
  };

  return (
    <div>
      <Sketch setup={setup} draw={draw} />
    </div>
  );
};

export default SketchPad;
